export type AppPlan = "free" | "full";

const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };

export const appPlan: AppPlan = meta.env?.VITE_APP_PLAN === "free" ? "free" : "full";

export const freeModulePaths = new Set([
  "/dashboard",
  "/pos",
  "/transactions",
  "/products",
  "/inventory",
  "/settings"
]);

export const paidModuleLabels: Record<string, string> = {
  "/customers": "Manajemen Pelanggan",
  "/suppliers": "Manajemen Supplier",
  "/reports": "Laporan Lanjutan",
  "/master-data": "Master Data"
};

export function isModuleEnabled(path: string) {
  return appPlan === "full" || freeModulePaths.has(path) || path === "/upgrade";
}
