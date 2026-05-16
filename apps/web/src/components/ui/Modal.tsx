import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
};

const sizeClass: Record<NonNullable<ModalProps["size"]>, string> = {
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
};

export function Modal({ title, children, onClose, footer, size = "md" }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <section className={`max-h-[92vh] w-full overflow-hidden rounded-lg bg-white shadow-2xl ${sizeClass[size]}`}>
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
          <button
            type="button"
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-outline-variant bg-surface-container-low px-6 py-4">{footer}</div> : null}
      </section>
    </div>
  );
}
