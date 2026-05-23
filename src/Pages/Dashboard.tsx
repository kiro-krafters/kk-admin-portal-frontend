import { useCCPWindow } from "../Utils/CCPWindowContext";
import { useConnect } from "../Utils/ConnectProvider";
import {
  AnalyticsIcon,
  PhoneFabIcon,
  RoutingIcon,
  UsersIcon,
} from "../Components/AdminShell/AdminIcons";
import { QuickConnectIcon } from "../Components/CCP/icons";

type Metric = {
  label: string;
  value: string;
  delta?: string;
  tone: "teal" | "orange" | "blue" | "purple";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: number[];
};

const METRICS: Metric[] = [
  {
    label: "Contacts in queue",
    value: "7",
    delta: "+2 vs avg",
    tone: "teal",
    icon: RoutingIcon,
    trend: [3, 4, 6, 5, 7, 6, 8, 7],
  },
  {
    label: "Longest wait",
    value: "1:34",
    delta: "Above target",
    tone: "orange",
    icon: AnalyticsIcon,
    trend: [40, 55, 60, 70, 80, 75, 95, 94],
  },
  {
    label: "Service level (30s)",
    value: "82%",
    delta: "+4% today",
    tone: "blue",
    icon: AnalyticsIcon,
    trend: [70, 72, 75, 74, 78, 80, 81, 82],
  },
  {
    label: "Agents available",
    value: "12 / 18",
    delta: "67% capacity",
    tone: "purple",
    icon: UsersIcon,
    trend: [10, 11, 12, 13, 12, 12, 11, 12],
  },
];

const TONE_CLASSES: Record<
  Metric["tone"],
  { iconBg: string; iconColor: string; chip: string; trend: string }
> = {
  teal: {
    iconBg: "bg-connect-teal-soft",
    iconColor: "text-connect-teal-dark",
    chip: "bg-connect-teal-soft text-connect-teal-dark",
    trend: "stroke-connect-teal",
  },
  orange: {
    iconBg: "bg-connect-orange-soft",
    iconColor: "text-connect-warning",
    chip: "bg-connect-orange-soft text-connect-warning",
    trend: "stroke-connect-orange",
  },
  blue: {
    iconBg: "bg-connect-blue-soft",
    iconColor: "text-connect-blue-dark",
    chip: "bg-connect-blue-soft text-connect-blue-dark",
    trend: "stroke-connect-blue",
  },
  purple: {
    iconBg: "bg-connect-purple-soft",
    iconColor: "text-connect-purple",
    chip: "bg-connect-purple-soft text-connect-purple",
    trend: "stroke-connect-purple",
  },
};

const QUEUES = [
  {
    name: "kk_policy_inquiries_dev",
    inQueue: 3,
    longest: "0:47",
    agents: 6,
    sla: 0.91,
  },
  {
    name: "kk_claims_dev",
    inQueue: 4,
    longest: "1:34",
    agents: 4,
    sla: 0.74,
  },
  {
    name: "kk_billing_dev",
    inQueue: 0,
    longest: "—",
    agents: 2,
    sla: 1,
  },
];

const RECENT_CONTACTS = [
  {
    id: "c-1841",
    customer: "+1 415 555 0182",
    channel: "Voice",
    queue: "Claims",
    outcome: "Resolved",
    duration: "4:12",
  },
  {
    id: "c-1840",
    customer: "+44 20 7946 0958",
    channel: "Chat",
    queue: "Policy",
    outcome: "Transferred",
    duration: "7:55",
  },
  {
    id: "c-1839",
    customer: "+91 80 4567 0011",
    channel: "Voice",
    queue: "Billing",
    outcome: "Resolved",
    duration: "2:08",
  },
  {
    id: "c-1838",
    customer: "+1 212 555 0117",
    channel: "Voice",
    queue: "Claims",
    outcome: "Voicemail",
    duration: "0:41",
  },
];

export default function Dashboard() {
  const { agentName, status } = useConnect();
  const { openNumberPad, openQuickConnects } = useCCPWindow();

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-connect-bg-alt p-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl bg-connect-hero p-6 text-white shadow-connect-card">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/80">
              {status === "ready" ? "Connected" : "Sign in to take calls"}
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              Welcome{agentName ? `, ${agentName.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="mt-1 max-w-md text-sm text-white/80">
              Your insurance contact center at a glance. Open the number pad to
              place an outbound call, or jump straight to Quick connects.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openNumberPad}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-connect-teal-dark shadow-sm hover:bg-white/90"
            >
              <PhoneFabIcon className="h-4 w-4" />
              Open number pad
            </button>
            <button
              type="button"
              onClick={openQuickConnects}
              className="flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              <QuickConnectIcon className="h-4 w-4" />
              Quick connects
            </button>
          </div>
        </div>
      </section>

      {/* Metric cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => {
          const tone = TONE_CLASSES[m.tone];
          const Icon = m.icon;
          return (
            <article
              key={m.label}
              className="group rounded-xl border border-connect-border bg-white p-4 shadow-connect-card transition hover:shadow-connect-card-hover"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone.iconBg} ${tone.iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {m.delta && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.chip}`}
                  >
                    {m.delta}
                  </span>
                )}
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
                {m.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-connect-text">
                {m.value}
              </p>
              <Sparkline data={m.trend} className={tone.trend} />
            </article>
          );
        })}
      </section>

      {/* Queues + Recent */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-connect-border bg-white shadow-connect-card lg:col-span-2">
          <header className="flex items-center justify-between border-b border-connect-border px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold text-connect-text">
                Queues
              </h2>
              <p className="text-xs text-connect-text-secondary">
                Service-level performance for the last 30 minutes
              </p>
            </div>
            <button className="text-xs font-medium text-connect-blue hover:underline">
              View all
            </button>
          </header>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-connect-text-secondary">
                <th className="px-5 py-2 font-medium">Queue</th>
                <th className="px-5 py-2 font-medium">In queue</th>
                <th className="px-5 py-2 font-medium">Longest wait</th>
                <th className="px-5 py-2 font-medium">Agents</th>
                <th className="px-5 py-2 font-medium">SLA</th>
              </tr>
            </thead>
            <tbody>
              {QUEUES.map((q) => (
                <tr
                  key={q.name}
                  className="border-t border-connect-border-soft hover:bg-connect-bg-soft"
                >
                  <td className="px-5 py-3 font-mono text-xs text-connect-text">
                    {q.name}
                  </td>
                  <td className="px-5 py-3 font-semibold text-connect-text">
                    {q.inQueue}
                  </td>
                  <td className="px-5 py-3 text-connect-text">{q.longest}</td>
                  <td className="px-5 py-3 text-connect-text">{q.agents}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-connect-bg-alt">
                        <div
                          className={`h-full ${
                            q.sla >= 0.9
                              ? "bg-connect-success"
                              : q.sla >= 0.8
                              ? "bg-connect-teal"
                              : "bg-connect-warning"
                          }`}
                          style={{ width: `${Math.round(q.sla * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-connect-text">
                        {Math.round(q.sla * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-connect-border bg-white shadow-connect-card">
          <header className="border-b border-connect-border px-5 py-3">
            <h2 className="text-sm font-semibold text-connect-text">
              Recent contacts
            </h2>
            <p className="text-xs text-connect-text-secondary">
              Last handled across the team
            </p>
          </header>
          <ul className="divide-y divide-connect-border-soft">
            {RECENT_CONTACTS.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-connect-bg-soft"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-connect-text">
                    {c.customer}
                  </p>
                  <p className="text-[11px] text-connect-text-secondary">
                    {c.channel} · {c.queue} · {c.duration}
                  </p>
                </div>
                <OutcomeChip outcome={c.outcome} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function OutcomeChip({ outcome }: { outcome: string }) {
  const map: Record<string, string> = {
    Resolved: "bg-connect-success-soft text-connect-success",
    Transferred: "bg-connect-blue-soft text-connect-blue-dark",
    Voicemail: "bg-connect-warning-soft text-connect-warning",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        map[outcome] ?? "bg-connect-bg-alt text-connect-text-secondary"
      }`}
    >
      {outcome}
    </span>
  );
}

function Sparkline({
  data,
  className = "",
}: {
  data: number[];
  className?: string;
}) {
  const width = 100;
  const height = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 h-7 w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      />
    </svg>
  );
}
