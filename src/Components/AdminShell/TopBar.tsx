import { BellIcon, HelpIcon, SearchIcon } from "./AdminIcons";

type Props = {
  instanceAlias?: string;
  agentName?: string | null;
};

export default function TopBar({
  instanceAlias = "kk-contact-center-dev",
  agentName,
}: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-connect-navy-deep/40 bg-connect-navy px-4 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-connect-orange text-xs font-bold text-connect-navy">
          KK
        </div>
        <span className="text-sm font-semibold tracking-wide">
          Amazon Connect
        </span>
        <span className="hidden text-xs text-white/60 md:inline">
          / {instanceAlias}
        </span>
      </div>

      <div className="hidden flex-1 justify-center px-8 md:flex">
        <label className="relative w-full max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          <input
            type="search"
            placeholder="Search users, queues, flows…"
            className="w-full rounded-md border border-white/15 bg-white/5 py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-white/50 focus:border-connect-teal focus:bg-white/10 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex items-center gap-1">
        <IconButton label="Help">
          <HelpIcon className="h-5 w-5" />
        </IconButton>
        <IconButton label="Notifications">
          <BellIcon className="h-5 w-5" />
        </IconButton>
        <div className="ml-2 flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/10">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-connect-teal text-xs font-semibold text-white">
            {(agentName ?? "AG").slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden text-left lg:block">
            <p className="text-xs font-semibold leading-tight">
              {agentName ?? "Agent"}
            </p>
            <p className="text-[10px] text-white/60">Administrator</p>
          </div>
        </div>
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
      className="flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}
