import { useConnect } from "../../Utils/ConnectProvider";

export default function QueueList() {
  const { queueMetrics, status } = useConnect();

  return (
    <section>
      <header className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          Routing-profile queues
        </h3>
        <span className="text-[10px] text-connect-text-disabled">
          {queueMetrics.length} total
        </span>
      </header>
      {queueMetrics.length === 0 ? (
        <p className="rounded-lg border border-dashed border-connect-border bg-white px-3 py-3 text-center text-[11px] text-connect-text-secondary">
          {status === "ready"
            ? "No queues are attached to this agent's routing profile."
            : "Sign in to load your routing profile."}
        </p>
      ) : (
        <ul className="rounded-lg border border-connect-border bg-white shadow-connect-card">
          {queueMetrics.map((q, idx) => (
            <li
              key={q.queueArn}
              className={`flex items-center justify-between px-3 py-2 ${
                idx !== 0 ? "border-t border-connect-border-soft" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-connect-text">
                  {q.name}
                </p>
                <p className="truncate font-mono text-[10px] text-connect-text-disabled">
                  {q.queueArn.split("/").pop()}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  q.inQueue > 0
                    ? "bg-connect-teal-soft text-connect-teal-dark"
                    : "bg-connect-bg-alt text-connect-text-secondary"
                }`}
                title="Contacts currently routed to you from this queue. Live queue depth requires the GetCurrentMetricData API."
              >
                {q.inQueue}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
