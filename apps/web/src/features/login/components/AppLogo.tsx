import { Store } from "lucide-react";

export function AppLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const iconInner = size === "lg" ? "h-9 w-9" : size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const titleSize = size === "lg" ? "text-5xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex flex-col items-center text-center">
      <div className={`flex ${iconSize} items-center justify-center rounded-lg bg-primary text-on-primary shadow-card`}>
        <Store className={iconInner} />
      </div>
      <h1 className={`mt-4 font-extrabold tracking-normal text-primary ${titleSize}`}>Kasir Lite POS</h1>
      <p className="mt-1 text-sm font-medium text-on-surface-variant">
        Sistem kasir ringan, cepat, dan mudah digunakan
      </p>
    </div>
  );
}
