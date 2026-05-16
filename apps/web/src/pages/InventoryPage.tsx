import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ClipboardList,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";
import { api } from "../api/client";
import { useFallbackQuery } from "../api/useFallbackQuery";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { fallbackMovements, fallbackProducts } from "../data/fallback";
import { showSuccess } from "../lib/alerts";
import { currency, shortDateTime } from "../lib/format";
import type { Product, StockMovement } from "../types";

type MovementMode = "stock-in" | "stock-out" | "adjustment";

type MovementForm = {
  mode: MovementMode;
  productId: string;
  qty: string;
  newStock: string;
  notes: string;
};

const inputClass =
  "min-h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const modeLabels: Record<MovementMode, string> = {
  "stock-in": "Stok Masuk",
  "stock-out": "Stok Keluar",
  adjustment: "Koreksi Stok"
};

function initialForm(productId?: number, mode: MovementMode = "stock-in"): MovementForm {
  return {
    mode,
    productId: productId ? String(productId) : "",
    qty: "1",
    newStock: "0",
    notes: ""
  };
}

function movementTone(type: StockMovement["type"]) {
  if (type === "IN" || type === "RETURN") return "green";
  if (type === "OUT" || type === "DAMAGE") return "orange";
  return "blue";
}

export function InventoryPage() {
  const stocksQuery = useFallbackQuery<Product[]>(["inventory", "stocks"], "/inventory/stocks", fallbackProducts);
  const movementsQuery = useFallbackQuery<StockMovement[]>(
    ["inventory", "movements"],
    "/inventory/movements",
    fallbackMovements
  );
  const fetchedStocks = stocksQuery.data ?? fallbackProducts;
  const fetchedMovements = movementsQuery.data ?? fallbackMovements;

  const [stocks, setStocks] = useState<Product[]>(fetchedStocks);
  const [movements, setMovements] = useState<StockMovement[]>(fetchedMovements);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<MovementForm | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setStocks(fetchedStocks);
  }, [fetchedStocks]);

  useEffect(() => {
    setMovements(fetchedMovements);
  }, [fetchedMovements]);

  const filteredStocks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return stocks.filter(
      (product) =>
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword) ||
        Boolean(product.barcode?.toLowerCase().includes(keyword))
    );
  }, [search, stocks]);

  const lowStock = stocks.filter((product) => product.stock <= product.minimumStock);
  const outOfStock = stocks.filter((product) => product.stock === 0);
  const inventoryValue = stocks.reduce((total, product) => total + product.stock * product.purchasePrice, 0);

  function openMovement(mode: MovementMode, product?: Product) {
    setError("");
    setForm(initialForm(product?.id, mode));
  }

  async function submitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    const product = stocks.find((item) => item.id === Number(form.productId));
    if (!product) {
      setError("Produk wajib dipilih.");
      return;
    }

    const qty = Number(form.qty);
    const newStock = Number(form.newStock);
    const beforeStock = product.stock;
    let afterStock = beforeStock;
    let type: StockMovement["type"] = "IN";
    let endpoint = "/inventory/stock-in";
    let payload: Record<string, unknown> = { productId: product.id, qty, notes: form.notes || undefined };

    if (form.mode === "stock-out") {
      if (qty > product.stock) {
        setError("Stok keluar tidak boleh melebihi stok tersedia.");
        return;
      }
      endpoint = "/inventory/stock-out";
      afterStock = beforeStock - qty;
      type = "OUT";
    } else if (form.mode === "adjustment") {
      if (!form.notes.trim()) {
        setError("Alasan koreksi stok wajib diisi.");
        return;
      }
      endpoint = "/inventory/adjustment";
      payload = { productId: product.id, newStock, notes: form.notes };
      afterStock = newStock;
      type = "ADJUSTMENT";
    } else {
      afterStock = beforeStock + qty;
    }

    try {
      const response = await api.post<{ data: { product: Product; movement: StockMovement } }>(
        endpoint,
        payload
      );
      setStocks((current) =>
        current.map((item) => (item.id === product.id ? response.data.data.product : item))
      );
      setMovements((current) => [
        {
          ...response.data.data.movement,
          product: { id: product.id, name: product.name, sku: product.sku }
        },
        ...current
      ]);
    } catch {
      const updatedProduct = { ...product, stock: afterStock };
      const localMovement: StockMovement = {
        id: Date.now(),
        productId: product.id,
        product: { id: product.id, name: product.name, sku: product.sku },
        type,
        qty: form.mode === "adjustment" ? afterStock - beforeStock : qty,
        beforeStock,
        afterStock,
        referenceType: "manual",
        notes: form.notes || "Mode demo",
        createdAt: new Date().toISOString(),
        user: { id: 1, name: "Admin Utama" }
      };
      setStocks((current) => current.map((item) => (item.id === product.id ? updatedProduct : item)));
      setMovements((current) => [localMovement, ...current]);
    }

    setForm(null);
    await showSuccess(
      form.mode === "adjustment" ? "Koreksi stok berhasil" : "Data stok berhasil disimpan",
      `${product.name} kini memiliki stok ${afterStock}.`
    );
  }

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-on-surface-variant">Gudang dan stok</p>
          <h1 className="text-3xl font-extrabold">Manajemen Stok</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 font-bold hover:bg-surface-container-low"
            onClick={() => openMovement("stock-out")}
          >
            <ArrowUpFromLine className="h-5 w-5" />
            Stok Keluar
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-bold text-on-primary hover:bg-primary-container"
            onClick={() => openMovement("stock-in")}
          >
            <Plus className="h-5 w-5" />
            Stok Masuk
          </button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Produk Stok" value={String(stocks.length)} subtitle="Produk aktif" icon={Boxes} />
        <StatCard
          title="Stok Menipis"
          value={String(lowStock.length)}
          subtitle="Perlu restock"
          icon={AlertTriangle}
          tone="orange"
        />
        <StatCard
          title="Stok Habis"
          value={String(outOfStock.length)}
          subtitle="Tidak tersedia"
          icon={RefreshCw}
          tone="red"
        />
        <StatCard
          title="Nilai Persediaan"
          value={currency(inventoryValue)}
          subtitle="Harga beli x stok"
          icon={ClipboardList}
          tone="green"
        />
      </section>

      <section className="rounded-lg border border-outline-variant bg-white p-4 shadow-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
          <input
            className={`${inputClass} pl-10`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari produk, SKU, atau barcode..."
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
        <article className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card">
          <div className="border-b border-outline-variant px-6 py-4">
            <h2 className="text-lg font-bold">Daftar Stok Produk</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 text-center">Stok</th>
                  <th className="px-6 py-4 text-center">Minimum</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredStocks.map((product) => {
                  const stockStatus =
                    product.stock === 0
                      ? { label: "Habis", tone: "red" as const }
                      : product.stock <= product.minimumStock
                        ? { label: "Menipis", tone: "orange" as const }
                        : { label: "Aman", tone: "green" as const };

                  return (
                    <tr key={product.id} className="hover:bg-surface-container-low">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image ?? ""}
                            alt={product.name}
                            className="h-11 w-11 rounded-lg bg-surface-container object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-bold">{product.name}</p>
                            <p className="text-xs text-on-surface-variant">{product.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{product.sku}</td>
                      <td className="px-6 py-4 text-center font-extrabold">{product.stock}</td>
                      <td className="px-6 py-4 text-center">{product.minimumStock}</td>
                      <td className="px-6 py-4">
                        <StatusBadge tone={stockStatus.tone}>{stockStatus.label}</StatusBadge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                            onClick={() => openMovement("stock-in", product)}
                            aria-label={`Tambah stok ${product.name}`}
                          >
                            <ArrowDownToLine className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                            onClick={() => openMovement("adjustment", product)}
                            aria-label={`Koreksi stok ${product.name}`}
                          >
                            <RefreshCw className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-lg border border-outline-variant bg-white shadow-card">
          <div className="border-b border-outline-variant px-6 py-4">
            <h2 className="text-lg font-bold">Riwayat Pergerakan</h2>
          </div>
          <div className="grid max-h-[560px] gap-4 overflow-y-auto p-6">
            {movements.length === 0 ? (
              <EmptyState icon={ClipboardList} title="Belum ada riwayat" description="Pergerakan stok akan tampil setelah ada transaksi atau koreksi stok." />
            ) : (
              movements.map((movement) => (
                <div key={movement.id} className="rounded-lg border border-outline-variant p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{movement.product?.name ?? `Produk #${movement.productId}`}</p>
                      <p className="text-xs text-on-surface-variant">{shortDateTime(movement.createdAt)}</p>
                    </div>
                    <StatusBadge tone={movementTone(movement.type)}>{movement.type}</StatusBadge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-lg bg-surface-container-low p-2">
                      <p className="text-xs text-on-surface-variant">Sebelum</p>
                      <p className="font-bold">{movement.beforeStock}</p>
                    </div>
                    <div className="rounded-lg bg-surface-container-low p-2">
                      <p className="text-xs text-on-surface-variant">Qty</p>
                      <p className="font-bold">{movement.qty}</p>
                    </div>
                    <div className="rounded-lg bg-surface-container-low p-2">
                      <p className="text-xs text-on-surface-variant">Sesudah</p>
                      <p className="font-bold">{movement.afterStock}</p>
                    </div>
                  </div>
                  {movement.notes ? <p className="mt-3 text-xs text-on-surface-variant">{movement.notes}</p> : null}
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {form ? (
        <Modal
          title={modeLabels[form.mode]}
          onClose={() => setForm(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 font-bold" onClick={() => setForm(null)}>
                Batal
              </button>
              <button form="movement-form" type="submit" className="rounded-lg bg-primary px-5 py-2 font-bold text-on-primary">
                Simpan
              </button>
            </div>
          }
        >
          <form id="movement-form" className="grid gap-4" onSubmit={submitMovement}>
            {error ? <p className="rounded-lg bg-error-container px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}
            <label className="grid gap-2 text-sm font-semibold">
              Produk
              <select
                required
                className={inputClass}
                value={form.productId}
                onChange={(event) => {
                  const product = stocks.find((item) => item.id === Number(event.target.value));
                  setForm((current) =>
                    current
                      ? { ...current, productId: event.target.value, newStock: String(product?.stock ?? 0) }
                      : current
                  );
                }}
              >
                <option value="">Pilih produk</option>
                {stocks.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - stok {product.stock}
                  </option>
                ))}
              </select>
            </label>
            {form.mode === "adjustment" ? (
              <label className="grid gap-2 text-sm font-semibold">
                Stok Baru
                <input
                  className={inputClass}
                  min={0}
                  type="number"
                  value={form.newStock}
                  onChange={(event) => setForm((current) => (current ? { ...current, newStock: event.target.value } : current))}
                />
              </label>
            ) : (
              <label className="grid gap-2 text-sm font-semibold">
                Qty
                <input
                  className={inputClass}
                  min={1}
                  type="number"
                  value={form.qty}
                  onChange={(event) => setForm((current) => (current ? { ...current, qty: event.target.value } : current))}
                />
              </label>
            )}
            <label className="grid gap-2 text-sm font-semibold">
              Catatan
              <textarea
                className={`${inputClass} min-h-24 py-3`}
                value={form.notes}
                onChange={(event) => setForm((current) => (current ? { ...current, notes: event.target.value } : current))}
                placeholder={form.mode === "adjustment" ? "Contoh: hasil stok opname" : "Opsional"}
              />
            </label>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
