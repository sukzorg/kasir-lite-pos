import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-on-surface">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>
    </div>
  );
}
