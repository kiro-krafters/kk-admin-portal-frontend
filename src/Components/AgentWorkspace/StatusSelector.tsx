import { useEffect, useRef, useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import { ChevronDown } from "../CCP/icons";

const DEFAULT_STATES = ["Available", "Break", "Lunch", "Offline"];

const STATE_DOT: Record<string, string> = {
  Available: "bg-connect-success",
  Break: "bg-connect-warning",
  Lunch: "bg-connect-orange",
  Offline: "bg-connect-text-disabled",
};

export default function StatusSelector() {
  const { currentState, availableStates, changeState, status } = useConnect();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const options = (
    availableStates.length > 0
      ? availableStates.map((s) => s.name)
      : DEFAULT_STATES
  ).filter((s, i, arr) => arr.indexOf(s) === i);

  // Truth comes from the agent — never an optimistic copy.
  const actual = currentState?.name ?? "Offline";
  const display = pending ?? actual;
  const showSyncing = pending !== null && pending !== actual;

  const handleSelect = async (opt: string) => {
    setOpen(false);
    setError(null);
    setPending(opt);
    try {
      await changeState(opt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change status");
    } finally {
      // Wait a tick so the onStateChange event has a chance to land.
      window.setTimeout(() => setPending(null), 250);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={status !== "ready"}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-connect-border bg-white px-3 py-2 text-sm font-medium text-connect-text shadow-connect-card hover:border-connect-teal disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              STATE_DOT[display] ?? "bg-connect-text-disabled"
            } ${showSyncing ? "animate-pulse" : ""}`}
          />
          <span>{display}</span>
          {showSyncing && (
            <span className="text-[10px] uppercase tracking-wider text-connect-text-disabled">
              syncing…
            </span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 text-connect-text-secondary" />
      </button>

      {open && (
        <ul className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-md border border-connect-border bg-white shadow-lg">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  opt === actual
                    ? "bg-connect-teal-soft text-connect-teal-dark"
                    : "hover:bg-connect-bg-alt"
                }`}
                onClick={() => handleSelect(opt)}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    STATE_DOT[opt] ?? "bg-connect-text-disabled"
                  }`}
                />
                {opt}
                {opt === actual && (
                  <span className="ml-auto text-[10px] font-semibold text-connect-text-secondary">
                    current
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-1 text-[11px] text-connect-error">{error}</p>
      )}
    </div>
  );
}
