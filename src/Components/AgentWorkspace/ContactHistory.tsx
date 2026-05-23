import { useConnect } from "../../Utils/ConnectProvider";
import { formatSeconds } from "../../Utils/useElapsed";
import { HistoryIcon } from "./WorkspaceIcons";

export default function ContactHistory() {
  const { contactHistory } = useConnect();
  return (
    <section className="rounded-lg border border-connect-border bg-white p-3 shadow-connect-card">
      <header className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          <HistoryIcon className="h-3.5 w-3.5" />
          Recent contacts
        </h3>
        <span className="text-[10px] text-connect-text-disabled">Demo</span>
      </header>
      <ul className="divide-y divide-connect-border-soft">
        {contactHistory.slice(0, 3).map((c) => (
          <li key={c.contactId} className="py-2">
            <div className="flex items-center justify-between text-[11px] text-connect-text-secondary">
              <span className="font-mono">{c.contactId}</span>
              <span>{c.channel}</span>
            </div>
            <p className="mt-0.5 text-sm font-medium text-connect-text">
              {c.outcome}
            </p>
            <p className="text-[11px] text-connect-text-secondary">
              {c.startedAt} · {formatSeconds(c.durationSeconds)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
