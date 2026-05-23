import { useConnect } from "../../Utils/ConnectProvider";
import { formatSeconds } from "../../Utils/useElapsed";

export default function TodayStats() {
  const { agentStats, status } = useConnect();

  const items = [
    {
      label: "Handled",
      value: String(agentStats.contactsHandled),
      hint: "this session",
      tone: "bg-connect-teal-soft text-connect-teal-dark",
    },
    {
      label: "AHT",
      value:
        agentStats.contactsHandled > 0
          ? formatSeconds(agentStats.avgHandleSeconds)
          : "—",
      hint: "avg handle",
      tone: "bg-connect-blue-soft text-connect-blue-dark",
    },
    {
      label: "Open",
      value: String(agentStats.openContacts),
      hint: "live contacts",
      tone: "bg-connect-success-soft text-connect-success",
    },
    {
      label: "Queues",
      value: String(agentStats.queueCount),
      hint: "in profile",
      tone: "bg-connect-purple-soft text-connect-purple",
    },
  ];

  return (
    <section>
      <header className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          Session
        </h3>
        <span className="text-[10px] text-connect-text-disabled">
          {status === "ready" ? "live" : "offline"}
        </span>
      </header>
      <div className="grid grid-cols-2 gap-2">
        {items.map((i) => (
          <div
            key={i.label}
            className="rounded-lg border border-connect-border bg-white p-2.5 shadow-connect-card"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-connect-text-secondary">
              {i.label}
            </p>
            <p className="mt-0.5 text-lg font-semibold text-connect-text">
              {i.value}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium ${i.tone}`}
            >
              {i.hint}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
