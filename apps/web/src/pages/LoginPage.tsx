import { AxiosError } from "axios";
import type { FormEvent } from "react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { FeatureRibbon } from "../features/login/components/FeatureRibbon";
import { LeftRetailScene, RightRetailScene } from "../features/login/components/RetailBackdrop";
import { LoginCard } from "../features/login/components/LoginCard";
import { useAuthStore } from "../store/auth";
import type { AuthUser } from "../types";

type LoginResponse = {
  token: string;
  user: AuthUser;
};

const meta = import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> };
const demoModeEnabled =
  meta.env?.VITE_DEMO_MODE_ENABLED === "true" ||
  (!meta.env?.PROD && meta.env?.VITE_DEMO_MODE_ENABLED !== "false");

export function LoginPage() {
  const navigate = useNavigate();
  const { token, setSession, startDemo } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (token) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post<LoginResponse>("/auth/login", { identifier, password });
      setSession(response.data.token, response.data.user);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const message =
        requestError instanceof AxiosError
          ? requestError.response?.data?.message ?? "Login gagal. Periksa koneksi API atau akun."
          : "Login gagal. Periksa koneksi API atau akun.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleDemo() {
    startDemo();
    navigate("/dashboard", { replace: true });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#f9f9ff_0%,#ecedf7_48%,#f9f9ff_100%)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-[1700px] grid-cols-1 xl:grid-cols-[minmax(320px,0.8fr)_minmax(520px,620px)_minmax(320px,0.8fr)]">
        <LeftRetailScene />

        <section className="flex min-h-screen flex-col justify-center px-5 py-8 sm:px-8">
          <LoginCard
            identifier={identifier}
            password={password}
            showPassword={showPassword}
            loading={loading}
            error={error}
            remember={remember}
            onIdentifierChange={setIdentifier}
            onPasswordChange={setPassword}
            onTogglePassword={() => setShowPassword((current) => !current)}
            onRememberChange={setRemember}
            onSubmit={handleSubmit}
            onDemo={handleDemo}
            demoEnabled={demoModeEnabled}
          />
          <footer className="mt-5 text-center text-xs font-semibold text-on-surface-variant">
            Copyright (c) 2026 tumbuhapp.com
          </footer>
          <FeatureRibbon />
        </section>

        <RightRetailScene />
      </div>
    </main>
  );
}
