import axios from "axios";

const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
const baseURL = meta.env?.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  timeout: 8000
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("kasir-lite-auth");
    if (stored) {
      const session = JSON.parse(stored) as { token?: string };
      if (session.token && session.token !== "demo-token") {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }
  } catch {
    localStorage.removeItem("kasir-lite-auth");
  }
  config.headers["X-Store-Id"] = localStorage.getItem("kasir-lite-store-id") ?? "1";
  return config;
});
