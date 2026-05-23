import { useEffect, useMemo, useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import type { QuickConnectEntry } from "../../Utils/connect";
import { CloseIcon, PhoneIcon, SearchIconSmall } from "./icons";

type Props = {
  onClose: () => void;
  onDialed?: () => void;
};

const TYPE_LABEL: Record<string, string> = {
  phone_number: "Phone",
  queue: "Queue",
  agent: "Agent",
};

const TYPE_COLOR: Record<string, string> = {
  phone_number: "bg-connect-teal-soft text-connect-teal-dark",
  queue: "bg-connect-blue-soft text-connect-blue-dark",
  agent: "bg-connect-warning-soft text-connect-warning",
};

export default function QuickConnectsPanel({ onClose, onDialed }: Props) {
  const {
    quickConnects,
    quickConnectsLoading,
    refreshQuickConnects,
    dialQuickConnect,
    status,
  } = useConnect();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "ready" && quickConnects.length === 0) {
      refreshQuickConnects();
    }
  }, [status, quickConnects.length, refreshQuickConnects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickConnects;
    return quickConnects.filter(
      (qc) =>
        qc.name.toLowerCase().includes(q) ||
        qc.phoneNumber?.toLowerCase().includes(q)
    );
  }, [quickConnects, query]);

  const handleDial = async (qc: QuickConnectEntry) => {
    setError(null);
    try {
      await dialQuickConnect(qc);
      onDialed?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to dial");
    }
  };

  return (
    <section className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-connect-border px-4 py-3">
        <h2 className="text-base font-semibold text-connect-text">
          Quick connects
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded p-1 text-connect-text-secondary hover:bg-connect-bg-alt"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-connect-border px-4 py-2">
        <label className="relative block">
          <SearchIconSmall className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-connect-text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quick connects"
            className="w-full rounded border border-connect-border py-1 pl-7 pr-2 text-sm focus:border-connect-teal focus:outline-none"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto">
        {quickConnectsLoading && (
          <p className="px-4 py-6 text-center text-xs text-connect-text-secondary">
            Loading…
          </p>
        )}
        {!quickConnectsLoading && filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-connect-text-secondary">
            {status === "ready"
              ? "No quick connects available for your routing profile."
              : "Sign in to Amazon Connect to load quick connects."}
          </div>
        )}
        <ul className="divide-y divide-connect-border/60">
          {filtered.map((qc) => (
            <li key={qc.endpointId}>
              <button
                type="button"
                onClick={() => handleDial(qc)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-connect-bg-alt"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-connect-text">
                    {qc.name}
                  </p>
                  {qc.phoneNumber && (
                    <p className="truncate text-xs text-connect-text-secondary">
                      {qc.phoneNumber}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    TYPE_COLOR[qc.type] ??
                    "bg-connect-bg-alt text-connect-text-secondary"
                  }`}
                >
                  {TYPE_LABEL[qc.type] ?? qc.type}
                </span>
                <PhoneIcon className="h-4 w-4 shrink-0 text-connect-teal" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <p className="border-t border-connect-error/40 bg-connect-error-soft px-3 py-2 text-xs text-connect-error">
          {error}
        </p>
      )}
    </section>
  );
}
