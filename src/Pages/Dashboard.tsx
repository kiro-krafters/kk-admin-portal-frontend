import { useConnect } from "../Utils/ConnectProvider";

type Metric = {
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "good" | "warn";
};

const QUEUE_METRICS: Metric[] = [
  { label: "Contacts in queue", value: "7", delta: "+2 vs avg", tone: "warn" },
  { label: "Longest wait", value: "1:34", tone: "warn" },
  { label: "Service level (30s)", value: "82%", delta: "+4%", tone: "good" },
  { label: "Agents available", value: "12 / 18", tone: "good" },
];

const QUEUES = [
  { name: "kk_policy_inquiries_dev", inQueue: 3, longest: "0:47", agents: 6 },
  { name: "kk_claims_dev", inQueue: 4, longest: "1:34", agents: 4 },
  { name: "kk_billing_dev", inQueue: 0, longest: "—", agents: 2 },
];

export default function Dashboard() {
  const { agentName, status } = useConnect();

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-connect-bg-alt p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-connect-text">
            Welcome{agentName ? `, ${agentName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-connect-text-secondary">
            Real-time view of your insurance contact center.
          </p>
        </div>
        <span
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            status === "ready"
              ? "bg-connect-success-soft text-connect-success"
              : "bg-connect-warning-soft text-connect-warning"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              status === "ready" ? "bg-connect-success" : "bg-connect-warning"
            }`}
          />
          {status === "ready"
            ? "CCP connected"
            : status === "initializing"
            ? "Signing in…"
            : status === "missing-config"
            ? "Instance URL not set"
            : "CCP error"}
        </span>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {QUEUE_METRICS.map((m) => (
          <article
            key={m.label}
            className="rounded-md border border-connect-border bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wider text-connect-text-secondary">
              {m.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-connect-text">
              {m.value}
            </p>
            {m.delta && (
              <p
                className={`mt-0.5 text-xs ${
                  m.tone === "good"
                    ? "text-connect-success"
                    : m.tone === "warn"
                    ? "text-connect-warning"
                    : "text-connect-text-secondary"
                }`}
              >
                {m.delta}
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="rounded-md border border-connect-border bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-connect-border px-4 py-3">
          <h2 className="text-sm font-semibold text-connect-text">Queues</h2>
          <button className="text-xs font-medium text-connect-blue hover:underline">
            View all
          </button>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-connect-text-secondary">
              <th className="px-4 py-2 font-medium">Queue</th>
              <th className="px-4 py-2 font-medium">In queue</th>
              <th className="px-4 py-2 font-medium">Longest wait</th>
              <th className="px-4 py-2 font-medium">Agents available</th>
            </tr>
          </thead>
          <tbody>
            {QUEUES.map((q) => (
              <tr
                key={q.name}
                className="border-t border-connect-border hover:bg-connect-bg-soft"
              >
                <td className="px-4 py-2 font-mono text-xs text-connect-text">
                  {q.name}
                </td>
                <td className="px-4 py-2">{q.inQueue}</td>
                <td className="px-4 py-2">{q.longest}</td>
                <td className="px-4 py-2">{q.agents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-md border border-connect-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-connect-text">Open the CCP</h2>
        <p className="mt-1 text-sm text-connect-text-secondary">
          Use the floating phone button at the bottom-right to launch the agent
          softphone. It connects to your Amazon Connect instance and lets you
          place outbound calls, accept inbound contacts, and use Quick connects.
        </p>
      </section>
    </div>
  );
}
