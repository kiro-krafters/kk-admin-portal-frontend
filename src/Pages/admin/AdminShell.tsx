import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AdminPageShell({
  title,
  description,
  actions,
  children,
}: Props) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-connect-bg-alt p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-connect-text">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-connect-text-secondary">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-connect-border bg-white shadow-connect-card">
      {children}
    </div>
  );
}

export function ErrorBanner({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <div className="mb-3 rounded-md border border-connect-warning/30 bg-connect-warning-soft px-3 py-2 text-xs text-connect-warning">
      {error.message}
    </div>
  );
}

export function LoadingRow({ cols, label = "Loading…" }: { cols: number; label?: string }) {
  return (
    <tr>
      <td
        colSpan={cols}
        className="px-5 py-6 text-center text-xs text-connect-text-secondary"
      >
        {label}
      </td>
    </tr>
  );
}

export function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td
        colSpan={cols}
        className="px-5 py-6 text-center text-xs text-connect-text-secondary"
      >
        {label}
      </td>
    </tr>
  );
}

export function PrimaryButton({
  onClick,
  children,
  type = "button",
  disabled,
}: {
  onClick?: () => void;
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md bg-connect-teal px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-connect-teal-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  onClick,
  children,
  type = "button",
  disabled,
}: {
  onClick?: () => void;
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-connect-border bg-white px-3 py-1.5 text-sm font-medium text-connect-text hover:border-connect-teal hover:text-connect-teal-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function Pagination({
  total,
  pageSize,
  page,
  onPageChange,
  label = "rows",
}: {
  total: number;
  pageSize: number;
  /** 1-indexed page number */
  page: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  const safeTotal = Math.max(0, total);
  const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = safeTotal === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safeTotal, safePage * pageSize);

  const btn =
    "rounded-md border border-connect-border bg-white px-2 py-1 font-medium text-connect-text-secondary hover:border-connect-teal hover:text-connect-teal-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-connect-border disabled:hover:text-connect-text-secondary";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-connect-border-soft bg-connect-bg-soft px-5 py-2 text-[11px] text-connect-text-secondary">
      <span>
        {safeTotal === 0
          ? `No ${label}`
          : `Showing ${start}–${end} of ${safeTotal} ${label}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={btn}
          disabled={safePage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          «
        </button>
        <button
          type="button"
          className={btn}
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          ‹ Prev
        </button>
        <span className="px-2 font-medium text-connect-text">
          Page {safePage} of {totalPages}
        </span>
        <button
          type="button"
          className={btn}
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next ›
        </button>
        <button
          type="button"
          className={btn}
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}

export function DangerButton({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-connect-warning/40 bg-white px-3 py-1.5 text-sm font-medium text-connect-warning hover:bg-connect-warning-soft disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
