import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "orange" | "red" | "gray";
};

const toneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  blue: "bg-primary-fixed text-on-primary-fixed-variant",
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-error-container text-error",
  gray: "bg-surface-container-high text-on-surface-variant"
};

export function StatCard({ title, value, subtitle, icon: Icon, tone = "blue" }: StatCardProps) {
  return (
    <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-card">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${toneClass[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-on-surface-variant">{title}</p>
          <p className="mt-1 truncate text-xl font-bold text-on-surface">{value}</p>
          {subtitle ? <p className="mt-1 text-xs text-on-surface-variant">{subtitle}</p> : null}
        </div>
      </div>
    </article>
  );
}
