import { AlertTriangle, Package, ReceiptText, TrendingUp, Users } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useMemo, useState } from "react";
import { useFallbackQuery } from "../api/useFallbackQuery";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { fallbackDashboard } from "../data/fallback";
import { compactCurrency, currency, shortDateTime } from "../lib/format";
import type { DashboardSummary } from "../types";

type TrendRange = "7d" | "1m" | "3m" | "5y";

const trendOptions: Array<{ value: TrendRange; label: string; title: string }> = [
  { value: "7d", label: "7 Hari", title: "Tren Penjualan 7 Hari" },
  { value: "1m", label: "1 Bulan", title: "Tren Penjualan 1 Bulan" },
  { value: "3m", label: "3 Bulan", title: "Tren Penjualan 3 Bulan" },
  { value: "5y", label: "5 Tahun", title: "Tren Penjualan 5 Tahun" }
];

function buildFallbackSummary(range: TrendRange): DashboardSummary {
  if (range === "7d") return fallbackDashboard;
  const sourceTotal = fallbackDashboard.salesTrend.reduce((total, item) => total + item.total, 0);
  const pointCount = range === "1m" ? 30 : range === "3m" ? 12 : 5;
  const now = new Date();
  const salesTrend = Array.from({ length: pointCount }, (_, index) => {
    const date = new Date(now);
    if (range === "5y") {
      const year = now.getFullYear() - (pointCount - 1 - index);
      return { label: String(year), total: Math.round(sourceTotal * (0.75 + index * 0.08)) };
    }
    date.setDate(now.getDate() - (pointCount - 1 - index) * (range === "3m" ? 7 : 1));
    return {
      label: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      total: Math.round((sourceTotal / pointCount) * (0.8 + (index % 5) * 0.1))
    };
  });

  return { ...fallbackDashboard, salesTrend };
}

export function DashboardPage() {
  const [trendRange, setTrendRange] = useState<TrendRange>("7d");
  const fallbackSummary = useMemo(() => buildFallbackSummary(trendRange), [trendRange]);
  const summaryQuery = useFallbackQuery<DashboardSummary>(
    ["dashboard", "summary", trendRange],
    `/dashboard/summary?trendRange=${trendRange}`,
    fallbackSummary
  );
  const summary = summaryQuery.data ?? fallbackSummary;
  const selectedTrend = trendOptions.find((option) => option.value === trendRange) ?? trendOptions[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Penjualan Hari Ini" value={currency(summary.metrics.todayRevenue)} subtitle="Transaksi selesai" icon={TrendingUp} tone="blue" />
        <StatCard title="Jumlah Transaksi" value={String(summary.metrics.todayTransactions)} subtitle="Hari berjalan" icon={ReceiptText} tone="green" />
        <StatCard title="Produk Aktif" value={String(summary.metrics.productsCount)} subtitle="Katalog toko" icon={Package} tone="orange" />
        <StatCard title="Pelanggan" value={String(summary.metrics.customersCount)} subtitle="Data tersimpan" icon={Users} tone="gray" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-lg border border-outline-variant bg-white p-6 shadow-card xl:col-span-2">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-on-surface">{selectedTrend.title}</h2>
              <p className="text-sm text-on-surface-variant">Ringkasan omzet harian berdasarkan transaksi selesai.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTrendRange(option.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    trendRange === option.value
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.salesTrend} margin={{ left: 4, right: 16, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#e0e2ec" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={compactCurrency} tickLine={false} axisLine={false} width={70} />
                <Tooltip formatter={(value) => currency(Number(value))} labelClassName="font-semibold" />
                <Line type="monotone" dataKey="total" stroke="#005bbf" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-lg border border-outline-variant bg-white p-6 shadow-card">
          <h2 className="text-xl font-bold text-on-surface">Penjualan per Kategori</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Kontribusi kategori 30 hari terakhir.</p>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.categories} dataKey="total" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {summary.categories.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => currency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {summary.categories.slice(0, 4).map((category) => (
              <div key={category.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-on-surface-variant">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="truncate">{category.name}</span>
                </span>
                <span className="font-bold text-on-surface">{compactCurrency(category.total)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <article className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card">
          <div className="border-b border-outline-variant px-6 py-4">
            <h2 className="text-lg font-bold text-on-surface">Transaksi Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4 font-bold">No Transaksi</th>
                  <th className="px-6 py-4 font-bold">Kasir</th>
                  <th className="px-6 py-4 font-bold">Waktu</th>
                  <th className="px-6 py-4 text-right font-bold">Total</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {summary.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-surface-container-low">
                    <td className="px-6 py-4 font-semibold">{sale.transactionNumber}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{sale.cashier?.name ?? "-"}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{shortDateTime(sale.createdAt)}</td>
                    <td className="px-6 py-4 text-right font-bold">{currency(sale.grandTotal)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={sale.status === "completed" ? "green" : "red"}>
                        {sale.status === "completed" ? "Selesai" : "Dibatalkan"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-lg border border-outline-variant bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Stok Menipis</h2>
              <p className="text-sm text-on-surface-variant">Produk di bawah minimum stok.</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-error" />
          </div>
          <div className="space-y-4">
            {summary.lowStock.length === 0 ? (
              <p className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">Semua stok aman.</p>
            ) : (
              summary.lowStock.map((product) => {
                const progress = Math.max(8, Math.min(100, Math.round((product.stock / Math.max(product.minimumStock, 1)) * 100)));
                return (
                  <div key={product.id} className="flex items-center gap-3">
                    <img src={product.image ?? ""} alt={product.name} className="h-12 w-12 rounded-lg bg-surface-container object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{product.name}</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
                        <div className="h-full rounded-full bg-error" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-error">
                        Sisa {product.stock} {product.unit}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
