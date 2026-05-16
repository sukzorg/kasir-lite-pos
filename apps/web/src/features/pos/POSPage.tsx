import { FormEvent, useMemo, useState } from "react";
import { Minus, Plus, Printer, ReceiptText, ScanBarcode, Search, Trash2 } from "lucide-react";
import { api } from "../../api/client";
import { useFallbackQuery } from "../../api/useFallbackQuery";
import { Button, Field, IconButton, Modal, StatusChip, inputClass } from "../../components/ui";
import { showSuccess } from "../../lib/alerts";
import { currency } from "../../lib/format";
import { mockCategories, mockCustomers, mockProducts, mockStore } from "../../lib/mockData";
import type { Category, Customer, LoyaltyRule, Product, Sale, StoreSetting } from "../../types";

type CartItem = {
  product: Product;
  qty: number;
  discountPercent: number;
};

const paymentLabels: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS Manual",
  transfer: "Transfer",
  ewallet: "E-Wallet",
  card: "Kartu"
};

const fallbackLoyaltyRule: LoyaltyRule = {
  id: 1,
  minimumSpend: 100000,
  pointsAwarded: 1000,
  pointValue: 1
};

function parseDigits(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

function parsePercent(value: string) {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  return Math.min(Number(normalized) || 0, 100);
}

function getReceiptItemDiscountTotal(sale: Sale) {
  return sale.items.reduce((total, item) => total + item.discountAmount, 0);
}

export function POSPage() {
  const { data: products = mockProducts } = useFallbackQuery<Product[]>(
    ["products", "pos"],
    "/products?status=active",
    mockProducts
  );
  const { data: categories = mockCategories } = useFallbackQuery<Category[]>(
    ["categories"],
    "/categories",
    mockCategories
  );
  const { data: customers = mockCustomers } = useFallbackQuery<Customer[]>(
    ["customers"],
    "/customers",
    mockCustomers
  );
  const { data: store = mockStore } = useFallbackQuery<StoreSetting>(
    ["settings-store"],
    "/settings/store",
    mockStore
  );
  const { data: loyaltyRule = fallbackLoyaltyRule } = useFallbackQuery<LoyaltyRule>(
    ["settings", "loyalty"],
    "/settings/loyalty",
    fallbackLoyaltyRule
  );

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [customerId, setCustomerId] = useState<number | "guest">("guest");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = categoryId === "all" || product.categoryId === categoryId;
      const keywordMatch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword) ||
        product.barcode?.toLowerCase() === keyword;
      return categoryMatch && keywordMatch && product.status === "active";
    });
  }, [categoryId, products, search]);

  const selectedCustomer =
    customerId === "guest" ? null : customers.find((customer) => customer.id === customerId) ?? null;
  const customerPoints = selectedCustomer?.points ?? selectedCustomer?.loyaltyPoints ?? 0;
  const canRedeemPoints = Boolean(selectedCustomer && selectedCustomer.status === "member" && customerPoints > 0);
  const lineDiscount = (item: CartItem) =>
    Math.round(((item.product.sellingPrice * item.qty) * item.discountPercent) / 100);
  const grossSubtotal = cart.reduce((total, item) => total + item.product.sellingPrice * item.qty, 0);
  const itemDiscountTotal = cart.reduce((total, item) => total + lineDiscount(item), 0);
  const subtotal = Math.max(grossSubtotal - itemDiscountTotal, 0);
  const pointValue = Math.max(loyaltyRule.pointValue, 0);
  const maxRedeemPoints =
    canRedeemPoints && pointValue > 0 ? Math.min(customerPoints, Math.floor(subtotal / pointValue)) : 0;
  const safeRedeemedPoints = Math.min(redeemedPoints, maxRedeemPoints);
  const pointDiscountAmount = safeRedeemedPoints * pointValue;
  const taxableAmount = Math.max(subtotal - pointDiscountAmount, 0);
  const taxAmount = Math.round((taxableAmount * store.taxRate) / 100);
  const grandTotal = taxableAmount + taxAmount;
  const changeAmount = Math.max(paidAmount - grandTotal, 0);

  function addProduct(product: Product) {
    setError("");
    if (product.stock <= 0) {
      setError(`${product.name} sedang habis.`);
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) return [...current, { product, qty: 1, discountPercent: 0 }];
      if (existing.qty >= product.stock) {
        setError(`Stok ${product.name} hanya ${product.stock} ${product.unit}.`);
        return current;
      }
      return current.map((item) =>
        item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
    });
  }

  function scanBarcode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const product = products.find((item) => item.barcode === search.trim() || item.sku === search.trim());
    if (!product) {
      setError("Produk barcode belum ditemukan.");
      return;
    }
    addProduct(product);
    setSearch("");
  }

  function updateQty(productId: number, nextQty: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, qty: Math.max(1, Math.min(nextQty, item.product.stock)) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function updateDiscountPercent(productId: number, value: string) {
    const discountPercent = parsePercent(value);
    setCart((current) =>
      current.map((item) => (item.product.id === productId ? { ...item, discountPercent } : item))
    );
  }

  async function checkout() {
    setError("");
    if (cart.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }
    if (paidAmount < grandTotal) {
      setError("Pembayaran masih kurang dari total belanja.");
      return;
    }

    const payload = {
      customerId: customerId === "guest" ? null : customerId,
      discountAmount: 0,
      taxRate: store.taxRate,
      redeemedPoints: safeRedeemedPoints,
      paidAmount,
      paymentMethod,
      items: cart.map((item) => ({
        productId: item.product.id,
        qty: item.qty,
        discountAmount: lineDiscount(item)
      }))
    };

    try {
      const response = await api.post<{ data: Sale }>("/sales", payload);
      setReceipt(response.data.data);
      await showSuccess("Transaksi berhasil", `${response.data.data.transactionNumber} siap dicetak.`);
    } catch {
      const earnedPoints =
        selectedCustomer?.status === "member" && loyaltyRule.minimumSpend > 0
          ? Math.floor(taxableAmount / loyaltyRule.minimumSpend) * loyaltyRule.pointsAwarded
          : 0;
      const demoSale: Sale = {
        id: Date.now(),
        transactionNumber: `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-DEMO`,
        customer: selectedCustomer,
        cashier: { id: 1, name: "Admin Utama" },
        subtotal,
        discountAmount: itemDiscountTotal,
        pointDiscountAmount,
        redeemedPoints: safeRedeemedPoints,
        earnedPoints,
        taxAmount,
        grandTotal,
        paidAmount,
        changeAmount,
        paymentMethod,
        status: "completed",
        createdAt: new Date().toISOString(),
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          qty: item.qty,
          price: item.product.sellingPrice,
          discountAmount: lineDiscount(item),
          subtotal: item.product.sellingPrice * item.qty - lineDiscount(item)
        }))
      };
      setReceipt(demoSale);
      await showSuccess("Transaksi berhasil", `${demoSale.transactionNumber} tersimpan pada mode demo.`);
    }

    setCart([]);
    setRedeemedPoints(0);
    setPaidAmount(0);
  }

  return (
    <div className="grid min-h-[calc(100vh-160px)] gap-6 xl:grid-cols-[minmax(0,1fr)_500px] 2xl:grid-cols-[minmax(0,1fr)_540px]">
      <section className="flex min-h-[680px] flex-col rounded-xl border border-outline-variant bg-surface">
        <div className="grid gap-4 border-b border-outline-variant p-4 sm:p-6">
          <form className="relative" onSubmit={scanBarcode}>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              size={20}
            />
            <input
              className={`${inputClass} pl-12`}
              placeholder="Cari produk atau scan barcode..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-primary hover:bg-primary-fixed"
              title="Tambah dari barcode"
            >
              <ScanBarcode size={19} />
            </button>
          </form>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold ${
                categoryId === "all"
                  ? "bg-primary text-white"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
              onClick={() => setCategoryId("all")}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold ${
                  categoryId === category.id
                    ? "bg-primary text-white"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
                key={category.id}
                onClick={() => setCategoryId(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid flex-1 content-start gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 2xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <button
              className="group grid gap-3 rounded-xl border border-outline-variant bg-white p-3 text-left shadow-sm transition hover:border-primary hover:shadow-card disabled:opacity-60"
              disabled={product.stock === 0}
              key={product.id}
              onClick={() => addProduct(product)}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-low">
                <img
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  src={product.image ?? ""}
                />
                <span
                  className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold ${
                    product.stock <= product.minimumStock
                      ? "bg-error-container text-error"
                      : "bg-primary-fixed text-primary"
                  }`}
                >
                  Stok {product.stock}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-on-surface">{product.name}</p>
                <p className="text-sm text-on-surface-variant">{product.sku}</p>
                <p className="mt-1 font-extrabold text-primary">{currency(product.sellingPrice)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <aside className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-white">
        <div className="border-b border-outline-variant p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Keranjang Belanja</h2>
              <p className="text-sm text-on-surface-variant">TRX otomatis saat pembayaran.</p>
            </div>
            <StatusChip tone="blue">{cart.length} item</StatusChip>
          </div>
          <div className="mt-4">
            <Field label="Pelanggan">
              <select
                className={inputClass}
                value={customerId}
                onChange={(event) => {
                  setCustomerId(event.target.value === "guest" ? "guest" : Number(event.target.value));
                  setRedeemedPoints(0);
                }}
              >
                <option value="guest">Pelanggan Umum</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="max-h-[440px] overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="grid h-full place-items-center rounded-xl border border-dashed border-outline-variant p-6 text-center text-sm text-on-surface-variant">
              Pilih produk untuk memulai transaksi.
            </div>
          ) : (
            <div className="grid gap-4">
              {cart.map((item) => (
                <div className="rounded-xl border border-outline-variant bg-white p-4 shadow-sm" key={item.product.id}>
                  <div className="grid grid-cols-[72px_minmax(0,1fr)_40px] gap-3">
                    <img
                      alt={item.product.name}
                      className="h-[72px] w-[72px] rounded-lg bg-surface-container object-cover"
                      src={item.product.image ?? ""}
                    />
                    <div className="min-w-0">
                      <p className="break-words font-extrabold leading-snug">{item.product.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                        <span>SKU {item.product.sku}</span>
                        <span>Stok {item.product.stock} {item.product.unit}</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-primary">{currency(item.product.sellingPrice)}</p>
                    </div>
                    <IconButton
                      label="Hapus item"
                      onClick={() =>
                        setCart((current) =>
                          current.filter((cartItem) => cartItem.product.id !== item.product.id)
                        )
                      }
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </div>

                  <div className="mt-4 grid gap-3 rounded-lg bg-surface-container-low p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <IconButton label="Kurangi" onClick={() => updateQty(item.product.id, item.qty - 1)}>
                          <Minus size={16} />
                        </IconButton>
                        <span className="min-w-10 text-center text-lg font-extrabold">{item.qty}</span>
                        <IconButton label="Tambah" onClick={() => updateQty(item.product.id, item.qty + 1)}>
                          <Plus size={16} />
                        </IconButton>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-on-surface-variant">Subtotal item</p>
                        <p className="text-base font-extrabold">
                          {currency(item.product.sellingPrice * item.qty - lineDiscount(item))}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                      <label className="text-xs font-semibold text-on-surface-variant">
                        Diskon item (%)
                        <div className="mt-1 flex min-h-10 items-center rounded-lg border border-outline-variant bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                          <input
                            className="w-full bg-transparent text-sm font-bold outline-none"
                            inputMode="decimal"
                            value={item.discountPercent ? String(item.discountPercent) : ""}
                            onChange={(event) => updateDiscountPercent(item.product.id, event.target.value)}
                            placeholder="0"
                          />
                          <span className="text-sm font-bold text-on-surface-variant">%</span>
                        </div>
                      </label>
                      <div className="rounded-lg bg-white px-3 py-2 text-right text-xs text-on-surface-variant">
                        <p>Potongan</p>
                        <p className="font-extrabold text-error">{currency(lineDiscount(item))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 border-t border-outline-variant bg-surface-container-low p-5">
          {error ? <div className="rounded-lg bg-error-container px-3 py-2 text-sm text-error">{error}</div> : null}
          <div className="grid gap-3">
            <Field label="Pembayaran">
              <select
                className={inputClass}
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                {Object.entries(paymentLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {selectedCustomer ? (
            <div className="rounded-lg border border-outline-variant bg-white p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-on-surface-variant">Point {selectedCustomer.name}</span>
                <span className="font-extrabold text-primary">{customerPoints}</span>
              </div>
              {canRedeemPoints ? (
                <label className="mt-3 grid gap-1.5 text-xs font-semibold text-on-surface-variant">
                  Tukar Point
                  <div className="flex min-h-11 items-center rounded-lg border border-outline-variant bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <input
                      className="w-full bg-transparent text-sm font-bold outline-none"
                      inputMode="numeric"
                      value={redeemedPoints ? String(redeemedPoints) : ""}
                      onChange={(event) =>
                        setRedeemedPoints(Math.min(parseDigits(event.target.value), maxRedeemPoints))
                      }
                      placeholder="0"
                    />
                    <span className="text-xs font-bold text-on-surface-variant">
                      maks. {maxRedeemPoints}
                    </span>
                  </div>
                  <span>Potongan point: {currency(pointDiscountAmount)}</span>
                </label>
              ) : (
                <p className="mt-2 text-xs text-on-surface-variant">
                  Tukar point hanya tersedia untuk pelanggan berstatus member dan memiliki point aktif.
                </p>
              )}
            </div>
          ) : null}
          <Field label="Uang Diterima">
            <div className="flex min-h-11 items-center rounded-lg border border-outline-variant bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <span className="mr-2 text-sm font-bold text-primary">Rp</span>
              <input
                className="w-full bg-transparent text-sm outline-none"
                inputMode="numeric"
                value={paidAmount ? String(paidAmount) : ""}
                onChange={(event) => setPaidAmount(parseDigits(event.target.value))}
                placeholder="0"
              />
            </div>
          </Field>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal Produk</span>
              <span>{currency(grossSubtotal)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Diskon Item</span>
              <span>-{currency(itemDiscountTotal)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Tukar Point</span>
              <span>-{currency(pointDiscountAmount)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Pajak ({store.taxRate}%)</span>
              <span>{currency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Kembalian</span>
              <span>{currency(changeAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-outline-variant pt-3 text-xl font-extrabold">
              <span>Total</span>
              <span className="text-primary">{currency(grandTotal)}</span>
            </div>
          </div>
          <Button className="min-h-14 w-full text-base" onClick={checkout}>
            <ReceiptText size={22} />
            Bayar Sekarang
          </Button>
        </div>
      </aside>

      {receipt ? (
        <Modal
          title="Struk Transaksi"
          onClose={() => setReceipt(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setReceipt(null)}>
                Tutup
              </Button>
              <Button onClick={() => window.print()}>
                <Printer size={18} />
                Cetak
              </Button>
            </>
          }
        >
          <div className="print-receipt mx-auto max-w-sm rounded-lg border border-outline-variant bg-white p-5 text-sm">
            <div className="text-center">
              <h3 className="text-lg font-extrabold">{store.name}</h3>
              <p className="text-xs text-on-surface-variant">{store.address}</p>
              <p className="text-xs text-on-surface-variant">{store.phone}</p>
            </div>
            <div className="my-4 border-y border-dashed border-outline-variant py-3">
              <div className="flex justify-between">
                <span>No</span>
                <span>{receipt.transactionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{receipt.cashier?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan</span>
                <span>{receipt.customer?.name ?? "Umum"}</span>
              </div>
            </div>
            <div className="grid gap-2">
              {receipt.items.map((item) => (
                <div key={`${item.productId}-${item.productName}`}>
                  <div className="flex justify-between gap-2">
                    <span>{item.productName}</span>
                    <span>{currency(item.subtotal)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {item.qty} x {currency(item.price)}
                  </p>
                  {item.discountAmount > 0 ? (
                    <p className="text-xs text-error">Diskon item {currency(item.discountAmount)}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-1 border-t border-dashed border-outline-variant pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency(receipt.subtotal)}</span>
              </div>
              {getReceiptItemDiscountTotal(receipt) > 0 ? (
                <div className="flex justify-between">
                  <span>Diskon Item</span>
                  <span>{currency(getReceiptItemDiscountTotal(receipt))}</span>
                </div>
              ) : null}
              {(receipt.pointDiscountAmount ?? 0) > 0 ? (
                <div className="flex justify-between">
                  <span>Tukar Point</span>
                  <span>{currency(receipt.pointDiscountAmount ?? 0)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Pajak</span>
                <span>{currency(receipt.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold">
                <span>Total</span>
                <span>{currency(receipt.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bayar</span>
                <span>{currency(receipt.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembali</span>
                <span>{currency(receipt.changeAmount)}</span>
              </div>
              {(receipt.redeemedPoints ?? 0) > 0 ? (
                <div className="flex justify-between">
                  <span>Point Dipakai</span>
                  <span>{receipt.redeemedPoints}</span>
                </div>
              ) : null}
              {(receipt.earnedPoints ?? 0) > 0 ? (
                <div className="flex justify-between">
                  <span>Point Didapat</span>
                  <span>{receipt.earnedPoints}</span>
                </div>
              ) : null}
            </div>
            <p className="mt-5 text-center text-xs">{store.receiptFooter}</p>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
