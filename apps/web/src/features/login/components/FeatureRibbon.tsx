import type { LucideIcon } from "lucide-react";
import { BarChart3, Clock3, ShieldCheck, Users } from "lucide-react";

const features: Array<{ title: string; subtitle: string; icon: LucideIcon }> = [
  { title: "Cepat & Efisien", subtitle: "Transaksi lebih cepat", icon: Clock3 },
  { title: "Laporan Lengkap", subtitle: "Pantau bisnis kapan saja", icon: BarChart3 },
  { title: "Aman Tercatat", subtitle: "Data tersimpan rapi", icon: ShieldCheck },
  { title: "Mudah Digunakan", subtitle: "Antarmuka sederhana", icon: Users }
];

export function FeatureRibbon() {
  return (
    <section className="mx-auto mt-7 hidden w-full max-w-5xl grid-cols-4 divide-x divide-outline-variant rounded-lg border border-outline-variant bg-white/95 shadow-card xl:grid">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div key={feature.title} className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{feature.title}</p>
              <p className="truncate text-xs text-on-surface-variant">{feature.subtitle}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
