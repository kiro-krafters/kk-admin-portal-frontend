import { useCCPWindow } from "../../Utils/CCPWindowContext";
import { useConnect } from "../../Utils/ConnectProvider";
import { useAuth } from "../../Utils/AuthProvider";
import { getRoleLabel } from "../../Utils/auth";
import { PhoneFabIcon } from "./AdminIcons";
import { BellIcon, HelpIcon, SearchIcon } from "./AdminIcons";

type Props = {
  instanceAlias?: string;
};

export default function TopBar({
  instanceAlias = "kk-contact-center-dev",
}: Props) {
  const { agentName, status, contact, debugCCP, toggleDebugCCP } = useConnect();
  const { openNumberPad } = useCCPWindow();
  const { session, signOut } = useAuth();
  const displayName = session?.email ?? session?.username ?? agentName ?? "Agent";
  const roleLabel = getRoleLabel(session);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-connect-border bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-connect-teal-dark via-connect-teal to-connect-sky text-xs font-bold text-white shadow-sm">
          KK
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-connect-text">
            KK Contact Center
          </p>
          <p className="text-[11px] text-connect-text-secondary">
            Amazon Connect · {instanceAlias}
          </p>
        </div>
      </div>

      <div className="hidden flex-1 justify-center px-8 md:flex">
        <label className="relative w-full max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-connect-text-secondary" />
          <input
            type="search"
            placeholder="Search users, queues, flows…"
            className="w-full rounded-md border border-connect-border bg-connect-bg-soft py-1.5 pl-9 pr-3 text-sm text-connect-text placeholder:text-connect-text-disabled focus:border-connect-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-connect-teal/20"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openNumberPad}
          className="flex items-center gap-2 rounded-md bg-connect-teal px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-connect-teal-dark"
        >
          <PhoneFabIcon className="h-4 w-4" />
          Number pad
          {contact && (
            <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-white" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleDebugCCP}
          title="Show / hide the real Amazon Connect CCP iframe — useful for debugging the instance."
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
            debugCCP
              ? "border-connect-teal bg-connect-teal-soft text-connect-teal-dark"
              : "border-connect-border bg-white text-connect-text-secondary hover:border-connect-teal hover:text-connect-teal-dark"
          }`}
        >
          {debugCCP ? "Hide Connect CCP" : "Show Connect CCP"}
        </button>

        <span
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium md:inline-flex ${
            status === "ready"
              ? "bg-connect-success-soft text-connect-success"
              : "bg-connect-warning-soft text-connect-warning"
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              status === "ready" ? "bg-connect-success" : "bg-connect-warning"
            }`}
          />
          {status === "ready" ? "CCP online" : status === "initializing" ? "Connecting" : "CCP offline"}
        </span>

        <span className="mx-1 h-6 w-px bg-connect-border" />

        <IconButton label="Help">
          <HelpIcon className="h-5 w-5" />
        </IconButton>
        <IconButton label="Notifications">
          <BellIcon className="h-5 w-5" />
        </IconButton>
        <div className="ml-1 flex items-center gap-2 rounded-md px-2 py-1 hover:bg-connect-bg-alt">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-connect-teal to-connect-sky text-xs font-semibold text-white">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden text-left lg:block">
            <p className="text-xs font-semibold leading-tight text-connect-text">
              {displayName}
            </p>
            <p className="text-[10px] text-connect-text-secondary">
              {roleLabel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          title="Sign out"
          className="ml-1 rounded-md border border-connect-border bg-white px-2 py-1 text-[11px] font-semibold text-connect-text-secondary hover:border-connect-teal hover:text-connect-teal-dark"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-connect-text-secondary hover:bg-connect-bg-alt hover:text-connect-text"
    >
      {children}
    </button>
  );
}
