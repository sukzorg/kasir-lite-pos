import {
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Database,
  Package,
  ReceiptText,
  Settings,
  Store,
  Truck,
  Users,
  WalletCards,
  X
} from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useFallbackQuery } from "../../api/useFallbackQuery";
import { isModuleEnabled } from "../../config/plans";
import { fallbackDashboard } from "../../data/fallback";
import { currency, shortDateTime } from "../../lib/format";
import { defaultStore, useAuthStore } from "../../store/auth";
import type { DashboardSummary, StoreSetting } from "../../types";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Penjualan", path: "/pos", icon: ReceiptText },
  { label: "Transaksi", path: "/transactions", icon: WalletCards },
  { label: "Produk", path: "/products", icon: Package },
  { label: "Stok", path: "/inventory", icon: Boxes },
  { label: "Pelanggan", path: "/customers", icon: Users },
  { label: "Supplier", path: "/suppliers", icon: Truck },
  { label: "Laporan", path: "/reports", icon: BarChart3 },
  { label: "Master Data", path: "/master-data", icon: Database, ownerOnly: true },
  { label: "Pengaturan", path: "/settings", icon: Settings }
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pos": "Penjualan Baru",
  "/transactions": "Riwayat Transaksi",
  "/products": "Manajemen Produk",
  "/inventory": "Manajemen Stok",
  "/customers": "Manajemen Pelanggan",
  "/suppliers": "Manajemen Supplier",
  "/reports": "Laporan Penjualan",
  "/master-data": "Master Data",
  "/settings": "Pengaturan Toko",
  "/upgrade": "Full Version"
};

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const storeQuery = useFallbackQuery<StoreSetting>(["settings", "store"], "/settings/store", defaultStore);
  const dashboardQuery = useFallbackQuery<DashboardSummary>(
    ["layout", "dashboard-summary"],
    "/dashboard/summary",
    fallbackDashboard
  );
  const store = storeQuery.data ?? defaultStore;
  const dashboard = dashboardQuery.data ?? fallbackDashboard;
  const title = pageTitles[location.pathname] ?? "Kasir Lite POS";
  const visibleNavigation = navigation.filter((item) => !item.ownerOnly || user?.role.name === "Owner");
  const notifications = [
    ...dashboard.lowStock.slice(0, 3).map((product) => ({
      id: `stock-${product.id}`,
      title: `Stok ${product.name} menipis`,
      description: `Sisa ${product.stock} ${product.unit}, minimum ${product.minimumStock}.`
    })),
    ...dashboard.recentSales.slice(0, 2).map((sale) => ({
      id: `sale-${sale.id}`,
      title: `Transaksi ${sale.transactionNumber}`,
      description: `${currency(sale.grandTotal)} - ${shortDateTime(sale.createdAt)}`
    }))
  ];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-outline-variant bg-surface-container-lowest p-4 transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-primary">Kasir Lite POS</h1>
            <p className="text-[10px] font-semibold uppercase text-on-surface-variant">Management System</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-on-surface-variant hover:bg-surface-container lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const locked = !isModuleEnabled(item.path);
            const target = locked ? `/upgrade?module=${encodeURIComponent(item.path)}` : item.path;
            const active =
              location.pathname === item.path ||
              (location.pathname === "/upgrade" && new URLSearchParams(location.search).get("module") === item.path);
            return (
              <Link
                key={item.path}
                to={target}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-fixed text-on-primary-fixed-variant"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {locked ? (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                    <LockKeyhole className="h-3 w-3" />
                    Full
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-lg bg-surface-container p-4">
          <p className="truncate text-sm font-semibold text-on-surface">{user?.name ?? "Demo User"}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{user?.role.name ?? "Owner"}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {mobileOpen ? <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

      <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 lg:left-60 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="truncate text-lg font-bold text-primary">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-surface-container px-3 py-1.5 text-sm font-medium text-on-surface-variant sm:flex">
            <Store className="h-4 w-4 text-primary" />
            <span className="max-w-40 truncate">{store.name}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="relative">
            <button
              type="button"
              className="relative rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
              aria-label="Notifikasi stok dan transaksi"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((current) => !current)}
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              ) : null}
            </button>
            {notificationsOpen ? (
              <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-lg border border-outline-variant bg-white shadow-2xl">
                <div className="border-b border-outline-variant px-4 py-3">
                  <p className="font-extrabold">Notifikasi</p>
                  <p className="text-xs text-on-surface-variant">Stok dan transaksi terbaru.</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-5 text-sm text-on-surface-variant">Belum ada notifikasi baru.</p>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="border-b border-outline-variant px-4 py-3 last:border-b-0">
                        <p className="text-sm font-bold">{notification.title}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{notification.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold leading-tight">{user?.name ?? "Admin"}</p>
            <p className="text-[10px] uppercase text-on-surface-variant">{user?.role.name ?? "Owner"}</p>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col pt-16 lg:pl-60">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="border-t border-outline-variant bg-surface-container-lowest px-4 py-3 text-center text-xs font-semibold text-on-surface-variant">
          Copyright (c) 2026 tumbuhapp.com
        </footer>
      </main>
    </div>
  );
}
