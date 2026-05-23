import { useEffect, useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import type { QuickConnectEntry } from "../../Utils/connect";
import { PhoneIcon, QuickConnectIcon } from "../CCP/icons";

const TYPE_LABEL: Record<string, string> = {
  phone_number: "Phone",
  queue: "Queue",
  agent: "Agent",
};

export default function QuickConnectsList() {
  const {
    quickConnects,
    quickConnectsLoading,
    refreshQuickConnects,
    dialQuickConnect,
    status,
  } = useConnect();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "ready" && quickConnects.length === 0) {
      refreshQuickConnects();
    }
  }, [status, quickConnects.length, refreshQuickConnects]);

  const handleDial = async (qc: QuickConnectEntry) => {
    setError(null);
    try {
      await dialQuickConnect(qc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to dial");
    }
  };

  return (
    <section>
      <header className="mb-2 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          <QuickConnectIcon className="h-3.5 w-3.5" />
          Quick connects
        </h3>
        {quickConnectsLoading && (
          <span className="text-[10px] text-connect-text-disabled">
            Loading…
          </span>
        )}
      </header>
      <ul className="overflow-hidden rounded-lg border border-connect-border bg-white shadow-connect-card">
        {!quickConnectsLoading && quickConnects.length === 0 && (
          <li className="px-3 py-3 text-center text-[11px] text-connect-text-secondary">
            {status === "ready"
              ? "No quick connects on your routing profile."
              : "Sign in to load quick connects."}
          </li>
        )}
        {quickConnects.slice(0, 6).map((qc, idx) => (
          <li
            key={qc.endpointId}
            className={idx !== 0 ? "border-t border-connect-border-soft" : ""}
          >
            <button
              type="button"
              onClick={() => handleDial(qc)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-connect-bg-alt"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-connect-text">
                  {qc.name}
                </p>
                {qc.phoneNumber && (
                  <p className="truncate text-[11px] text-connect-text-secondary">
                    {qc.phoneNumber}
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-connect-bg-alt px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-connect-text-secondary">
                {TYPE_LABEL[qc.type] ?? qc.type}
              </span>
              <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-connect-teal" />
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p className="mt-1 text-[11px] text-connect-error">{error}</p>
      )}
    </section>
  );
}
