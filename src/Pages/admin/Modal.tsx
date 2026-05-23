import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full ${SIZE[size]} overflow-hidden rounded-xl bg-white shadow-2xl`}
      >
        <header className="flex items-center justify-between border-b border-connect-border px-5 py-3">
          <h2 className="text-sm font-semibold text-connect-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-connect-text-secondary hover:bg-connect-bg-alt hover:text-connect-text"
          >
            ✕
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-connect-border bg-connect-bg-soft px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
