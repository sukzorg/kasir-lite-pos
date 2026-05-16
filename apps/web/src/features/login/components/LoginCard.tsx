import type { FormEvent } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { AppLogo } from "./AppLogo";

type LoginCardProps = {
  identifier: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  error: string;
  remember: boolean;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onRememberChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDemo: () => void;
  demoEnabled?: boolean;
};

const inputClass =
  "min-h-14 w-full rounded-lg border border-outline-variant bg-white px-4 text-base font-medium text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function LoginCard({
  identifier,
  password,
  showPassword,
  loading,
  error,
  remember,
  onIdentifierChange,
  onPasswordChange,
  onTogglePassword,
  onRememberChange,
  onSubmit,
  onDemo,
  demoEnabled = false
}: LoginCardProps) {
  return (
    <section className="w-full max-w-xl rounded-lg border border-white/80 bg-white/95 px-6 py-8 shadow-2xl sm:px-10 lg:px-12">
      <AppLogo size="lg" />

      <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="identifier">
          Email atau username
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-on-surface-variant" />
          <input
            id="identifier"
            autoComplete="username"
            className={`${inputClass} pl-14`}
            value={identifier}
            onChange={(event) => onIdentifierChange(event.target.value)}
            placeholder="Email / Username"
          />
        </div>

        <label className="sr-only" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-on-surface-variant" />
          <input
            id="password"
            autoComplete="current-password"
            className={`${inputClass} pl-14 pr-14`}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="inline-flex items-center gap-3 font-semibold">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-outline-variant accent-primary"
              checked={remember}
              onChange={(event) => onRememberChange(event.target.checked)}
            />
            Ingat saya
          </label>
          <button type="button" className="font-bold text-primary hover:text-primary-container">
            Lupa kata sandi?
          </button>
        </div>

        {error ? (
          <p className="rounded-lg bg-error-container px-4 py-3 text-sm font-semibold text-error">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-primary px-5 text-lg font-extrabold text-on-primary shadow-card transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogIn className="h-6 w-6" />
          {loading ? "Memproses..." : "Masuk"}
        </button>

        {demoEnabled ? (
          <button
            type="button"
            onClick={onDemo}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white px-5 text-sm font-extrabold text-on-surface transition hover:bg-surface-container-low"
          >
            <ShieldCheck className="h-5 w-5" />
            Masuk Mode Demo
          </button>
        ) : null}
      </form>

      <div className="mt-6 flex items-start justify-center gap-2 text-sm font-semibold text-on-surface-variant">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <span>Aman & terpercaya untuk bisnis Anda</span>
      </div>

    </section>
  );
}
