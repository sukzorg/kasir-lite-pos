import { BarChart3, Download, ReceiptText, TrendingUp, WalletCards } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";
import { useFallbackQuery } from "../api/useFallbackQuery";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { fallbackSalesReport } from "../data/fallback";
import { showSuccess } from "../lib/alerts";
import { compactCurrency, currency, shortDateTime } from "../lib/format";
import type { SalesReport } from "../types";

const methodLabel: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  qris: "QRIS",
  ewallet: "E-Wallet",
  card: "Kartu"
};

const primaryColor: [number, number, number] = [0, 91, 191];
const greenColor: [number, number, number] = [22, 163, 74];
const orangeColor: [number, number, number] = [197, 85, 0];
const textColor: [number, number, number] = [25, 28, 35];
const mutedColor: [number, number, number] = [92, 95, 96];

function pdfCurrency(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(value))}`;
}

function paymentMethodName(method: string) {
  return methodLabel[method] ?? method;
}

function addPageFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text("Kasir Lite POS - tumbuhapp.com", 14, 288);
    doc.text(`Halaman ${page} dari ${pageCount}`, 196, 288, { align: "right" });
  }
}

function tableEndY(doc: jsPDF, fallback: number) {
  const tableDoc = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  return tableDoc.lastAutoTable?.finalY ?? fallback;
}

export function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (paymentMethod) params.set("paymentMethod", paymentMethod);
    const value = params.toString();
    return value ? `/reports/sales?${value}` : "/reports/sales";
  }, [dateFrom, dateTo, paymentMethod]);
  const reportQuery = useFallbackQuery<SalesReport>(["reports", "sales", dateFrom, dateTo, paymentMethod], query, fallbackSalesReport);
  const report = reportQuery.data ?? fallbackSalesReport;
  const averageReceipt = report.totals.transactions > 0 ? report.totals.revenue / report.totals.transactions : 0;

  function exportPdf() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const generatedAt = new Date().toLocaleString("id-ID");
    const activePeriod = `${dateFrom || "Awal"} s/d ${dateTo || "Hari ini"}`;
    const activeMethod = paymentMethod ? paymentMethodName(paymentMethod) : "Semua Metode";

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 34, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Laporan Penjualan", 14, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Kasir Lite POS | tumbuhapp.com", 14, 24);
    doc.text(`Dibuat: ${generatedAt}`, 196, 24, { align: "right" });

    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Filter Laporan", 14, 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(`Periode: ${activePeriod}`, 14, 51);
    doc.text(`Metode Pembayaran: ${activeMethod}`, 14, 57);

    const cards = [
      { label: "Total Penjualan", value: pdfCurrency(report.totals.revenue), color: primaryColor },
      { label: "Transaksi", value: String(report.totals.transactions), color: greenColor },
      { label: "Rata-rata Struk", value: pdfCurrency(averageReceipt), color: orangeColor },
      { label: "Pajak", value: pdfCurrency(report.totals.tax), color: mutedColor }
    ];
    cards.forEach((card, index) => {
      const x = 14 + index * 47;
      doc.setDrawColor(224, 226, 236);
      doc.setFillColor(249, 249, 255);
      doc.roundedRect(x, 66, 42, 24, 2, 2, "FD");
      doc.setTextColor(...card.color);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(card.value, x + 4, 77, { maxWidth: 34 });
      doc.setTextColor(...mutedColor);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(card.label, x + 4, 85);
    });

    autoTable(doc, {
      startY: 102,
      head: [["Metode Pembayaran", "Total Nominal", "Kontribusi"]],
      body: report.paymentMethods.map((method) => {
        const percent = report.totals.revenue > 0 ? (method.total / report.totals.revenue) * 100 : 0;
        return [paymentMethodName(method.method), pdfCurrency(method.total), `${percent.toFixed(1)}%`];
      }),
      theme: "grid",
      styles: { font: "helvetica", fontSize: 8, cellPadding: 2.8, textColor },
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 }
    });

    let y = tableEndY(doc, 102) + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.text("Produk Terlaris", 14, y);
    autoTable(doc, {
      startY: y + 5,
      head: [["No", "Produk", "Qty", "Total"]],
      body: report.topProducts.slice(0, 10).map((product, index) => [
        index + 1,
        product.name,
        product.qty,
        pdfCurrency(product.total)
      ]),
      theme: "striped",
      styles: { font: "helvetica", fontSize: 8, cellPadding: 2.6, textColor },
      headStyles: { fillColor: greenColor, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [244, 252, 247] },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 38, halign: "right" }
      },
      margin: { left: 14, right: 14 }
    });

    y = tableEndY(doc, y + 5) + 12;
    if (y > 230) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.text("Daftar Transaksi", 14, y);
    autoTable(doc, {
      startY: y + 5,
      head: [["No", "No Transaksi", "Kasir", "Waktu", "Metode", "Total", "Status"]],
      body: report.transactions.map((sale, index) => [
        index + 1,
        sale.transactionNumber,
        sale.cashier?.name ?? "-",
        shortDateTime(sale.createdAt),
        paymentMethodName(sale.paymentMethod),
        pdfCurrency(sale.grandTotal),
        sale.status === "completed" ? "Selesai" : sale.status
      ]),
      theme: "grid",
      styles: { font: "helvetica", fontSize: 7.6, cellPadding: 2.4, textColor, overflow: "linebreak" },
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 36 },
        3: { cellWidth: 28 },
        4: { cellWidth: 20 },
        5: { cellWidth: 28, halign: "right" },
        6: { cellWidth: 18, halign: "center" }
      },
      margin: { left: 14, right: 14 }
    });

    addPageFooter(doc);

    doc.save(`laporan-penjualan-${new Date().toISOString().slice(0, 10)}.pdf`);
    void showSuccess("Export PDF berhasil", "Laporan penjualan berhasil dibuat.");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <section className="rounded-lg border border-outline-variant bg-white p-4 shadow-card">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="text-sm font-semibold">
            Tanggal Mulai
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-3" />
          </label>
          <label className="text-sm font-semibold">
            Tanggal Akhir
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-3" />
          </label>
          <label className="text-sm font-semibold">
            Metode Bayar
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-3">
              <option value="">Semua</option>
              {Object.entries(methodLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={exportPdf} className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-5 py-3 font-bold hover:bg-surface-container">
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard title="Total Penjualan" value={currency(report.totals.revenue)} subtitle="Transaksi selesai" icon={TrendingUp} tone="blue" />
        <StatCard title="Jumlah Transaksi" value={String(report.totals.transactions)} subtitle="Sesuai filter" icon={ReceiptText} tone="green" />
        <StatCard title="Rata-rata Struk" value={currency(averageReceipt)} subtitle="Basket size" icon={WalletCards} tone="orange" />
        <StatCard title="Pajak Terkumpul" value={currency(report.totals.tax)} subtitle="Estimasi pajak" icon={BarChart3} tone="gray" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-lg border border-outline-variant bg-white p-6 shadow-card xl:col-span-2">
          <h2 className="text-xl font-bold">Produk Terlaris</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Urutan berdasarkan kuantitas produk terjual.</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.topProducts.slice(0, 8)} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e0e2ec" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={0} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value, name) => (name === "total" ? currency(Number(value)) : value)} />
                <Bar dataKey="qty" fill="#005bbf" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-lg border border-outline-variant bg-white p-6 shadow-card">
          <h2 className="text-xl font-bold">Metode Pembayaran</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Distribusi nominal transaksi.</p>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={report.paymentMethods} dataKey="total" nameKey="method" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {report.paymentMethods.map((item, index) => (
                    <Cell key={item.method} fill={["#005bbf", "#16a34a", "#c55500", "#5c5f60", "#ba1a1a"][index % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => currency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {report.paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between text-sm">
                <span>{methodLabel[method.method] ?? method.method}</span>
                <span className="font-bold">{compactCurrency(method.total)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card">
        <div className="border-b border-outline-variant px-6 py-4">
          <h2 className="text-lg font-bold">Daftar Transaksi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-bold">No Transaksi</th>
                <th className="px-6 py-4 font-bold">Kasir</th>
                <th className="px-6 py-4 font-bold">Waktu</th>
                <th className="px-6 py-4 font-bold">Metode</th>
                <th className="px-6 py-4 text-right font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {report.transactions.map((sale) => (
                <tr key={sale.id} className="hover:bg-surface-container-low">
                  <td className="px-6 py-4 font-bold">{sale.transactionNumber}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{sale.cashier?.name ?? "-"}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{shortDateTime(sale.createdAt)}</td>
                  <td className="px-6 py-4">{methodLabel[sale.paymentMethod] ?? sale.paymentMethod}</td>
                  <td className="px-6 py-4 text-right font-bold">{currency(sale.grandTotal)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge tone={sale.status === "completed" ? "green" : "red"}>{sale.status === "completed" ? "Selesai" : sale.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
