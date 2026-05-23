import { useConnect } from "../../Utils/ConnectProvider";

export default function QueueList() {
  const { queueMetrics } = useConnect();
  return (
    <section>
      <header className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          Queues
        </h3>
      </header>
      <ul className="rounded-lg border border-connect-border bg-white shadow-connect-card">
        {queueMetrics.map((q, idx) => (
          <li
            key={q.queueId}
            className={`flex items-center justify-between px-3 py-2 ${
              idx !== 0 ? "border-t border-connect-border-soft" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-connect-text">
                {q.name}
              </p>
              <p className="text-[11px] text-connect-text-secondary">
                Longest {q.longestWait}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                q.inQueue === 0
                  ? "bg-connect-bg-alt text-connect-text-secondary"
                  : q.inQueue > 3
                  ? "bg-connect-warning-soft text-connect-warning"
                  : "bg-connect-teal-soft text-connect-teal-dark"
              }`}
            >
              {q.inQueue}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
