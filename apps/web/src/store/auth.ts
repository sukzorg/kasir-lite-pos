import { create } from "zustand";
import type { AuthUser, StoreSetting } from "../types";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  startDemo: () => void;
  logout: () => void;
};

const storageKey = "kasir-lite-auth";

function readStoredSession(): Pick<AuthState, "token" | "user"> {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return { token: null, user: null };
    const parsed = JSON.parse(stored) as Pick<AuthState, "token" | "user">;
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null
    };
  } catch {
    return { token: null, user: null };
  }
}

const demoUser: AuthUser = {
  id: 1,
  name: "Admin Utama",
  email: "demo@kasirlite.test",
  username: "admin",
  role: {
    id: 1,
    name: "Owner",
    permissions: [
      "dashboard.read",
      "products.manage",
      "inventory.manage",
      "sales.create",
      "reports.read",
      "settings.manage",
      "users.manage"
    ]
  }
};

const initial = readStoredSession();

export const useAuthStore = create<AuthState>((set) => ({
  token: initial.token,
  user: initial.user,
  setSession: (token, user) => {
    localStorage.setItem(storageKey, JSON.stringify({ token, user }));
    set({ token, user });
  },
  startDemo: () => {
    localStorage.setItem(storageKey, JSON.stringify({ token: "demo-token", user: demoUser }));
    set({ token: "demo-token", user: demoUser });
  },
  logout: () => {
    localStorage.removeItem(storageKey);
    set({ token: null, user: null });
  }
}));

export const defaultStore: StoreSetting = {
  name: "Toko Sejahtera",
  address: "Jl. Sudirman No. 88, Jakarta",
  phone: "081234567890",
  email: "halo@tokosejahtera.test",
  currency: "IDR",
  taxRate: 11,
  receiptFooter: "Terima kasih sudah berbelanja."
};
