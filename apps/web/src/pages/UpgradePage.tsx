import { Crown, LockKeyhole, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { paidModuleLabels } from "../config/plans";

export function UpgradePage() {
  const [params] = useSearchParams();
  const modulePath = params.get("module") ?? "";
  const moduleName = paidModuleLabels[modulePath] ?? "Fitur Full Version";

  return (
    <div className="grid min-h-[calc(100vh-128px)] place-items-center p-4 sm:p-6 lg:p-8">
      <section className="w-full max-w-3xl rounded-lg border border-outline-variant bg-white p-8 shadow-card">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
            <LockKeyhole className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase text-primary">Full Version</p>
            <h1 className="mt-1 text-3xl font-extrabold text-on-surface">{moduleName}</h1>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Modul ini tersedia untuk pelanggan berbayar. Paket gratis tetap dapat menggunakan dashboard,
              penjualan, transaksi, produk, stok, dan pengaturan.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-surface-container-low p-4">
            <Crown className="h-5 w-5 text-primary" />
            <p className="mt-3 font-bold">Yang terbuka di Full Version</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Pelanggan, supplier, laporan lanjutan, master data, dan pengaturan loyalty point.
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="mt-3 font-bold">Saran implementasi pembayaran</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Simpan status langganan di backend, validasi akses di API, lalu tampilkan UI upgrade di frontend.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
