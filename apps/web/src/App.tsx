import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { isModuleEnabled } from "./config/plans";
import { useAuthStore } from "./store/auth";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LoginPage } from "./pages/LoginPage";
import { MasterDataPage } from "./pages/MasterDataPage";
import { PosPage } from "./pages/PosPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { UpgradePage } from "./pages/UpgradePage";

function ProtectedRoutes() {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function ModuleGate({ path, children }: { path: string; children: ReactElement }) {
  if (!isModuleEnabled(path)) {
    return <Navigate to={`/upgrade?module=${encodeURIComponent(path)}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<PosPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route
          path="/customers"
          element={
            <ModuleGate path="/customers">
              <CustomersPage />
            </ModuleGate>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ModuleGate path="/suppliers">
              <SuppliersPage />
            </ModuleGate>
          }
        />
        <Route
          path="/reports"
          element={
            <ModuleGate path="/reports">
              <ReportsPage />
            </ModuleGate>
          }
        />
        <Route
          path="/master-data"
          element={
            <ModuleGate path="/master-data">
              <MasterDataPage />
            </ModuleGate>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
