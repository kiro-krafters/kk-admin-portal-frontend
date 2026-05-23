import { useEffect, useMemo, useRef, useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import type { QuickConnectEntry } from "../../Utils/connect";
import { ChevronDown } from "../CCP/icons";
import { TransferIcon } from "./WorkspaceIcons";

export default function TransferMenu({ disabled }: { disabled?: boolean }) {
  const { quickConnects, transfer } = useConnect();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickConnects;
    return quickConnects.filter(
      (qc) =>
        qc.name.toLowerCase().includes(q) ||
        qc.phoneNumber?.toLowerCase().includes(q)
    );
  }, [quickConnects, query]);

  const handleTransfer = async (qc: QuickConnectEntry) => {
    setError(null);
    setBusyId(qc.endpointId);
    try {
      await transfer(qc);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to transfer");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-connect-border bg-white px-3 py-2 text-sm font-medium text-connect-text hover:border-connect-teal disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex items-center gap-2">
          <TransferIcon className="h-4 w-4 text-connect-teal" />
          Transfer
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-connect-text-secondary" />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-md border border-connect-border bg-white shadow-lg">
          <div className="border-b border-connect-border p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quick connects"
              className="w-full rounded border border-connect-border px-2 py-1 text-sm focus:border-connect-teal focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1 text-sm">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-[11px] text-connect-text-secondary">
                No matches
              </li>
            )}
            {filtered.map((qc) => (
              <li key={qc.endpointId}>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => handleTransfer(qc)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-connect-bg-alt disabled:opacity-60"
                >
                  <span className="min-w-0">
                    <p className="truncate text-sm font-medium text-connect-text">
                      {qc.name}
                    </p>
                    {qc.phoneNumber && (
                      <p className="truncate text-[11px] text-connect-text-secondary">
                        {qc.phoneNumber}
                      </p>
                    )}
                  </span>
                  {busyId === qc.endpointId && (
                    <span className="text-[10px] text-connect-text-secondary">
                      …
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {error && (
            <p className="border-t border-connect-error/30 bg-connect-error-soft px-3 py-1.5 text-[11px] text-connect-error">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
