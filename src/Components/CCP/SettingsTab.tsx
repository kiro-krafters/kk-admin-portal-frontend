import { useConnect } from "../../Utils/ConnectProvider";

const INSTANCE_URL =
  (import.meta.env.VITE_CONNECT_INSTANCE_URL as string | undefined) ?? "";
const REGION =
  (import.meta.env.VITE_CONNECT_REGION as string | undefined) ?? "us-east-1";

export default function SettingsTab() {
  const {
    agentName,
    agentEmail,
    agentRole,
    agentExtension,
    status,
    debugCCP,
    toggleDebugCCP,
    refreshQuickConnects,
  } = useConnect();

  return (
    <section className="flex h-full flex-col gap-3 overflow-y-auto bg-white p-3">
      <Group title="Agent">
        <Row label="Name" value={agentName ?? "—"} />
        <Row label="Email" value={agentEmail ?? "—"} />
        <Row label="Routing profile" value={agentRole} />
        <Row label="Extension" value={agentExtension ?? "—"} />
        <Row
          label="Status"
          value={status}
          valueClass={
            status === "ready"
              ? "text-connect-success"
              : status === "error"
              ? "text-connect-error"
              : "text-connect-warning"
          }
        />
      </Group>

      <Group title="Instance">
        <Row label="URL" value={INSTANCE_URL || "Not set"} mono />
        <Row label="Region" value={REGION} mono />
      </Group>

      <Group title="Audio & devices">
        <p className="px-3 pb-2 text-[11px] text-connect-text-secondary">
          Microphone, speaker and ringer selection are managed by the embedded
          Amazon Connect softphone. Toggle the inline CCP below to access them.
        </p>
      </Group>

      <Group title="Developer">
        <label className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-connect-text">
          <span>Show embedded CCP iframe</span>
          <input
            type="checkbox"
            checked={debugCCP}
            onChange={toggleDebugCCP}
            className="h-4 w-4 accent-connect-teal"
          />
        </label>
        <button
          type="button"
          onClick={() => refreshQuickConnects()}
          className="mx-3 mb-3 mt-1 rounded-md border border-connect-border bg-white px-3 py-1.5 text-xs font-medium text-connect-text hover:bg-connect-bg-alt"
        >
          Refresh quick connects
        </button>
      </Group>
    </section>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-connect-border bg-white shadow-connect-card">
      <h3 className="border-b border-connect-border bg-connect-bg-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  valueClass,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-1.5 text-sm">
      <span className="text-connect-text-secondary">{label}</span>
      <span
        className={`max-w-[55%] truncate text-right font-medium text-connect-text ${
          mono ? "font-mono text-xs" : ""
        } ${valueClass ?? ""}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
