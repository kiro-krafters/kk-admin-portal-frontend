import { useConnect } from "../../Utils/ConnectProvider";

function initialsFromIdentity(name: string | null, email: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    const local = email.split("@")[0] ?? email;
    return local.slice(0, 2).toUpperCase();
  }
  return "AG";
}

export default function AgentProfile() {
  const { agentName, agentEmail, agentRole, status } = useConnect();
  const initials = initialsFromIdentity(agentName, agentEmail);
  const displayName =
    agentName ??
    (agentEmail ? agentEmail.split("@")[0].replace(/[._-]/g, " ") : "Agent");

  return (
    <div className="flex items-center gap-3 rounded-xl border border-connect-border bg-white p-3 shadow-connect-card">
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-connect-teal to-connect-sky text-sm font-semibold text-white">
          {initials}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
            status === "ready" ? "bg-connect-success" : "bg-connect-text-disabled"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold capitalize text-connect-text">
          {displayName}
        </p>
        {agentEmail && (
          <p className="truncate text-[11px] text-connect-text-secondary">
            {agentEmail}
          </p>
        )}
        <span className="mt-1 inline-flex rounded-full bg-connect-teal-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-connect-teal-dark">
          {agentRole}
        </span>
      </div>
    </div>
  );
}
