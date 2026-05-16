import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CalendarDays,
  Eye,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  WalletCards
} from "lucide-react";
import { api } from "../api/client";
import { useFallbackQuery } from "../api/useFallbackQuery";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { StatCard } from "../components/ui/StatCard";
import { TransactionStatusBadge } from "../features/transactions/components/TransactionStatusBadge";
import { fallbackSales } from "../data/fallback";
import { defaultStore } from "../store/auth";
import { showSuccess } from "../lib/alerts";
import { currency, shortDateTime } from "../lib/format";
import type { Sale, StoreSetting } from "../types";

const inputClass =
  "min-h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const paymentLabels: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  transfer: "Transfer",
  ewallet: "E-Wallet",
  card: "Kartu"
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function sevenDaysAgoInputValue() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().slice(0, 10);
}

function totalItems(sale: Sale) {
  return sale.items.reduce((total, item) => total + item.qty, 0);
}

export function TransactionsPage() {
  const [dateFrom, setDateFrom] = useState(sevenDaysAgoInputValue());
  const [dateTo, setDateTo] = useState(todayInputValue());
  const [status, setStatus] = useState<"all" | Sale["status"]>("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  const queryPath = `/sales?dateFrom=${dateFrom}&dateTo=${dateTo}${
    status === "all" ? "" : `&status=${status}`
  }${paymentMethod === "all" ? "" : `&paymentMethod=${paymentMethod}`}`;
  const salesQuery = useFallbackQuery<Sale[]>(
    ["sales", dateFrom, dateTo, status, paymentMethod],
    queryPath,
    fallbackSales
  );
  const storeQuery = useFallbackQuery<StoreSetting>(["settings", "store"], "/settings/store", defaultStore);
  const fetchedSales = salesQuery.data ?? fallbackSales;
  const store = storeQuery.data ?? defaultStore;
  const [sales, setSales] = useState<Sale[]>(fetchedSales);

  useEffect(() => {
    setSales(fetchedSales);
  }, [fetchedSales]);

  const filteredSales = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return sales.filter((sale) => {
      const searchMatch =
        !keyword ||
        sale.transactionNumber.toLowerCase().includes(keyword) ||
        Boolean(sale.customer?.name.toLowerCase().includes(keyword)) ||
        Boolean(sale.cashier?.name.toLowerCase().includes(keyword));
      const statusMatch = status === "all" || sale.status === status;
      const paymentMatch = paymentMethod === "all" || sale.paymentMethod === paymentMethod;
      return searchMatch && statusMatch && paymentMatch;
    });
  }, [paymentMethod, sales, search, status]);

  const completedSales = filteredSales.filter((sale) => sale.status === "completed");
  const cancelledSales = filteredSales.filter((sale) => sale.status === "cancelled");
  const revenue = completedSales.reduce((total, sale) => total + sale.grandTotal, 0);
  const averageReceipt = revenue / Math.max(completedSales.length, 1);

  async function submitCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cancelTarget) return;
    if (cancelReason.trim().length < 3) {
      setCancelError("Alasan pembatalan minimal 3 karakter.");
      return;
    }

    setCancelError("");
    try {
      const response = await api.post<{ data: Sale }>(`/sales/${cancelTarget.id}/cancel`, {
        reason: cancelReason
      });
      setSales((current) =>
        current.map((sale) => (sale.id === cancelTarget.id ? response.data.data : sale))
      );
    } catch {
      setSales((current) =>
        current.map((sale) =>
          sale.id === cancelTarget.id
            ? {
                ...sale,
                status: "cancelled",
                notes: sale.notes
                  ? `${sale.notes}\nPembatalan: ${cancelReason}`
                  : `Pembatalan: ${cancelReason}`
              }
            : sale
        )
      );
    }

    setCancelTarget(null);
    setCancelReason("");
    await showSuccess("Transaksi dibatalkan", `${cancelTarget.transactionNumber} berhasil dibatalkan.`);
  }

  function printSale(sale: Sale) {
    setSelectedSale(sale);
    window.setTimeout(() => {
      window.print();
      void showSuccess("Cetak ulang berhasil", `${sale.transactionNumber} dikirim ke dialog cetak.`);
    }, 120);
  }

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-on-surface-variant">Riwayat kasir</p>
          <h1 className="text-3xl font-extrabold">Transaksi</h1>
        </div>
        <section className="rounded-lg border border-outline-variant bg-white p-4 shadow-card">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_160px]">
            <label className="grid gap-1.5 text-sm font-semibold">
              Dari
              <input
                className={inputClass}
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Sampai
              <input
                className={inputClass}
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Status
              <select
                className={inputClass}
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
              >
                <option value="all">Semua</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
                <option value="refunded">Diretur</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Metode
              <select
                className={inputClass}
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <option value="all">Semua</option>
                {Object.entries(paymentLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Penjualan Selesai" value={currency(revenue)} subtitle="Filter aktif" icon={WalletCards} />
        <StatCard
          title="Total Transaksi"
          value={String(filteredSales.length)}
          subtitle="Semua status"
          icon={ReceiptText}
          tone="green"
        />
        <StatCard
          title="Rata-rata Struk"
          value={currency(averageReceipt)}
          subtitle="Transaksi selesai"
          icon={CalendarDays}
          tone="orange"
        />
        <StatCard
          title="Dibatalkan"
          value={String(cancelledSales.length)}
          subtitle="Periode aktif"
          icon={Ban}
          tone="red"
        />
      </section>

      <section className="rounded-lg border border-outline-variant bg-white p-4 shadow-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
          <input
            className={`${inputClass} pl-10`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nomor transaksi, pelanggan, atau kasir..."
          />
        </div>
      </section>

      {filteredSales.length === 0 ? (
        <EmptyState icon={ReceiptText} title="Transaksi tidak ditemukan" description="Ubah filter tanggal, status, atau kata pencarian." />
      ) : (
        <section className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">No Transaksi</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Kasir</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4 text-center">Item</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-surface-container-low">
                    <td className="px-6 py-4 font-extrabold">{sale.transactionNumber}</td>
                    <td className="px-6 py-4">{sale.customer?.name ?? "Pelanggan Umum"}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{sale.cashier?.name ?? "-"}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{shortDateTime(sale.createdAt)}</td>
                    <td className="px-6 py-4 text-center font-bold">{totalItems(sale)}</td>
                    <td className="px-6 py-4">{paymentLabels[sale.paymentMethod] ?? sale.paymentMethod}</td>
                    <td className="px-6 py-4 text-right font-extrabold">{currency(sale.grandTotal)}</td>
                    <td className="px-6 py-4">
                      <TransactionStatusBadge status={sale.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                          onClick={() => setSelectedSale(sale)}
                          aria-label={`Lihat transaksi ${sale.transactionNumber}`}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                          onClick={() => printSale(sale)}
                          aria-label={`Cetak transaksi ${sale.transactionNumber}`}
                        >
                          <Printer className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          disabled={sale.status !== "completed"}
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-error-container hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => {
                            setCancelTarget(sale);
                            setCancelError("");
                            setCancelReason("");
                          }}
                          aria-label={`Batalkan transaksi ${sale.transactionNumber}`}
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedSale ? (
        <Modal
          title={selectedSale.transactionNumber}
          onClose={() => setSelectedSale(null)}
          size="xl"
          footer={
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-outline-variant px-4 py-2 font-bold hover:bg-white"
                onClick={() => setSelectedSale(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-bold text-on-primary hover:bg-primary-container"
                onClick={() => {
                  window.print();
                  void showSuccess("Cetak ulang berhasil", `${selectedSale.transactionNumber} dikirim ke dialog cetak.`);
                }}
              >
                <Printer className="h-4 w-4" />
                Cetak Ulang
              </button>
            </div>
          }
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-lg border border-outline-variant">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Harga</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {selectedSale.items.map((item) => (
                    <tr key={`${selectedSale.id}-${item.productId}-${item.productName}`}>
                      <td className="px-4 py-3 font-semibold">{item.productName}</td>
                      <td className="px-4 py-3 text-center">{item.qty}</td>
                      <td className="px-4 py-3 text-right">{currency(item.price)}</td>
                      <td className="px-4 py-3 text-right font-bold">{currency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            <div className="print-receipt mx-auto w-full max-w-[320px] rounded-lg border border-outline-variant bg-white p-5 text-sm">
              <div className="text-center">
                <h3 className="text-lg font-extrabold">{store.name}</h3>
                <p className="text-xs text-on-surface-variant">{store.address}</p>
                <p className="text-xs text-on-surface-variant">{store.phone}</p>
              </div>
              <div className="my-4 border-y border-dashed border-outline-variant py-3">
                <div className="flex justify-between gap-3">
                  <span>No</span>
                  <span className="text-right">{selectedSale.transactionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir</span>
                  <span>{selectedSale.cashier?.name ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu</span>
                  <span>{shortDateTime(selectedSale.createdAt)}</span>
                </div>
              </div>
              <div className="grid gap-2">
                {selectedSale.items.map((item) => (
                  <div key={`receipt-${selectedSale.id}-${item.productId}`}>
                    <div className="flex justify-between gap-2">
                      <span>{item.productName}</span>
                      <span>{currency(item.subtotal)}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {item.qty} x {currency(item.price)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-1 border-t border-dashed border-outline-variant pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{currency(selectedSale.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diskon</span>
                  <span>{currency(selectedSale.discountAmount)}</span>
                </div>
                {(selectedSale.pointDiscountAmount ?? 0) > 0 ? (
                  <div className="flex justify-between">
                    <span>Tukar Point</span>
                    <span>{currency(selectedSale.pointDiscountAmount ?? 0)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span>Pajak</span>
                  <span>{currency(selectedSale.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold">
                  <span>Total</span>
                  <span>{currency(selectedSale.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar</span>
                  <span>{currency(selectedSale.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kembali</span>
                  <span>{currency(selectedSale.changeAmount)}</span>
                </div>
              </div>
              <p className="mt-5 text-center text-xs">{store.receiptFooter}</p>
            </div>
          </div>
        </Modal>
      ) : null}

      {cancelTarget ? (
        <Modal
          title="Batalkan Transaksi"
          onClose={() => setCancelTarget(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-outline-variant px-4 py-2 font-bold hover:bg-white"
                onClick={() => setCancelTarget(null)}
              >
                Batal
              </button>
              <button
                form="cancel-sale-form"
                type="submit"
                className="rounded-lg bg-error px-5 py-2 font-bold text-white hover:bg-red-700"
              >
                Batalkan
              </button>
            </div>
          }
        >
          <form id="cancel-sale-form" className="grid gap-4" onSubmit={submitCancel}>
            <div className="rounded-lg bg-surface-container-low p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Transaksi</span>
                <span className="font-bold">{cancelTarget.transactionNumber}</span>
              </div>
              <div className="mt-2 flex justify-between gap-3">
                <span className="text-on-surface-variant">Total</span>
                <span className="font-bold">{currency(cancelTarget.grandTotal)}</span>
              </div>
            </div>
            {cancelError ? (
              <p className="rounded-lg bg-error-container px-4 py-3 text-sm font-semibold text-error">
                {cancelError}
              </p>
            ) : null}
            <label className="grid gap-2 text-sm font-semibold">
              Alasan Pembatalan
              <textarea
                className={`${inputClass} min-h-28 py-3`}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Contoh: salah input item"
              />
            </label>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
