import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { X } from "lucide-react";

export function Card({
  children,
  className = ""
}: PropsWithChildren<{
  className?: string;
}>) {
  return (
    <section
      className={`rounded-lg border border-outline-variant bg-surface-container-lowest shadow-card ${className}`}
    >
      {children}
    </section>
  );
}

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
>) {
  const styles = {
    primary: "bg-primary text-on-primary hover:bg-primary-container",
    secondary:
      "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container",
    ghost: "text-on-surface-variant hover:bg-surface-container",
    danger: "bg-error text-white hover:bg-red-700"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  label,
  className = "",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  className = ""
}: PropsWithChildren<{ label: string; className?: string }>) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium text-on-surface ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function StatusChip({
  children,
  tone = "neutral"
}: PropsWithChildren<{ tone?: "green" | "red" | "yellow" | "blue" | "neutral" }>) {
  const styles = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    neutral: "bg-surface-container text-on-surface-variant"
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[tone]}`}>
      {children}
    </span>
  );
}

export function StatCard({
  title,
  value,
  icon,
  helper,
  tone = "blue"
}: {
  title: string;
  value: string;
  icon: ReactNode;
  helper?: string;
  tone?: "blue" | "green" | "orange" | "red" | "gray";
}) {
  const tones = {
    blue: "bg-primary-fixed text-on-primary-fixed-variant",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-error-container text-error",
    gray: "bg-secondary-container text-secondary"
  };

  return (
    <Card className="flex min-h-32 items-center gap-4 p-6">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{title}</p>
        <p className="mt-1 truncate text-2xl font-bold text-on-surface">{value}</p>
        {helper ? <p className="mt-1 text-xs text-on-surface-variant">{helper}</p> : null}
      </div>
    </Card>
  );
}

export function Modal({
  title,
  children,
  onClose,
  footer
}: PropsWithChildren<{ title: string; onClose: () => void; footer?: ReactNode }>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
          <IconButton label="Tutup" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-3 border-t border-outline-variant px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
