import { CreditCard, PackageCheck, ReceiptText, ScanBarcode, ShoppingBag } from "lucide-react";
import { currency } from "../../../lib/format";
import { fallbackProducts } from "../../../data/fallback";

export function LeftRetailScene() {
  return (
    <aside className="hidden h-full min-h-screen flex-col justify-center px-8 xl:flex">
      <div className="max-w-sm">
        <h2 className="text-3xl font-extrabold leading-tight text-on-surface">
          Kelola penjualan lebih <span className="text-primary">mudah</span>
        </h2>
        <p className="mt-4 max-w-xs text-base leading-7 text-on-surface-variant">
          Solusi kasir modern untuk toko retail, minimarket kecil, dan bisnis harian.
        </p>
        <div className="mt-5 h-1 w-20 rounded-full bg-primary" />
      </div>

      <div className="mt-10 rounded-lg border border-outline-variant bg-white p-4 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
            <ReceiptText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-extrabold">Ringkasan Hari Ini</p>
            <p className="text-xs text-on-surface-variant">Outlet Sudirman</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-bold text-on-surface-variant">Penjualan</p>
            <p className="mt-2 text-lg font-extrabold text-primary">{currency(2450000)}</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-bold text-on-surface-variant">Transaksi</p>
            <p className="mt-2 text-lg font-extrabold">28</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-outline-variant p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-bold text-on-surface-variant">
            <span>Grafik penjualan</span>
            <span>24 jam</span>
          </div>
          <div className="flex h-24 items-end gap-2">
            {[28, 40, 34, 52, 46, 70, 58, 76, 68, 86].map((height, index) => (
              <div
                key={`${height}-${index}`}
                className="flex-1 rounded-t bg-primary"
                style={{ height: `${height}%`, opacity: 0.35 + index * 0.05 }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {fallbackProducts.slice(0, 3).map((product) => (
          <div key={product.id} className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card">
            <img src={product.image ?? ""} alt={product.name} className="h-20 w-full object-cover" />
            <p className="truncate px-3 py-2 text-xs font-bold">{product.name}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function RightRetailScene() {
  return (
    <aside className="hidden h-full min-h-screen flex-col justify-center px-8 xl:flex">
      <div className="ml-auto w-full max-w-sm">
        <div className="rounded-lg border border-outline-variant bg-white p-6 shadow-card">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg bg-primary-fixed text-primary">
            <ShoppingBag className="h-16 w-16" />
          </div>
          <p className="mt-5 text-center text-lg font-extrabold">Terima kasih</p>
          <p className="text-center text-sm text-on-surface-variant">atas pembelian Anda</p>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_0.72fr] gap-4">
          <div className="rounded-lg border border-outline-variant bg-white p-5 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-extrabold">Terminal</p>
              <PackageCheck className="h-5 w-5 text-green-700" />
            </div>
            <div className="rounded-lg bg-surface-container-low p-4 text-center">
              <PackageCheck className="mx-auto h-8 w-8 text-green-700" />
              <p className="mt-2 text-sm font-bold">Pembayaran Berhasil</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }, (_, index) => (
                <div key={index} className="h-8 rounded bg-surface-container-high" />
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-primary p-5 text-on-primary shadow-card">
            <CreditCard className="h-7 w-7" />
            <p className="mt-8 text-xs font-semibold uppercase text-primary-fixed">Kasir Lite POS</p>
            <p className="mt-3 text-sm font-bold tracking-widest">1234 5678</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-outline-variant bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-fixed text-primary">
              <ScanBarcode className="h-6 w-6" />
            </div>
            <div>
              <p className="font-extrabold">Scanner & struk siap</p>
              <p className="text-sm text-on-surface-variant">Barcode masuk langsung ke keranjang POS.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
