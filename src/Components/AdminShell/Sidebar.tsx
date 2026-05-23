import { NavLink } from "react-router";
import {
  AnalyticsIcon,
  ChannelsIcon,
  DashboardIcon,
  ManagerIcon,
  RoutingIcon,
  SettingsIcon,
  SupervisorIcon,
  UsersIcon,
  WorkspaceIcon,
} from "./AdminIcons";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: { to: string; label: string }[];
};

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: DashboardIcon },
  { to: "/workspace", label: "Agent workspace", icon: WorkspaceIcon },
  { to: "/users", label: "Users", icon: UsersIcon },
  {
    to: "/routing",
    label: "Routing",
    icon: RoutingIcon,
    children: [
      { to: "/routing/queues", label: "Queues" },
      { to: "/routing/quick-connects", label: "Quick connects" },
      { to: "/routing/profiles", label: "Routing profiles" },
    ],
  },
  {
    to: "/channels",
    label: "Channels",
    icon: ChannelsIcon,
    children: [
      { to: "/channels/phone-numbers", label: "Phone numbers" },
      { to: "/channels/flows", label: "Contact flows" },
    ],
  },
  { to: "/supervisor", label: "Supervisor", icon: SupervisorIcon },
  { to: "/manager", label: "Manager", icon: ManagerIcon },
  { to: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-connect-border bg-connect-bg-soft">
      <div className="border-b border-connect-border-soft px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          Admin console
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 text-sm">
        {NAV.map((item) => (
          <SidebarItem key={item.to} item={item} />
        ))}
      </nav>
      <div className="border-t border-connect-border-soft px-4 py-3">
        <div className="rounded-md bg-connect-teal-50 px-3 py-2">
          <p className="text-[11px] font-semibold text-connect-teal-dark">
            Build: {import.meta.env.MODE}
          </p>
          <p className="text-[10px] text-connect-text-secondary">
            v0.1.0 · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;

  if (!hasChildren) {
    return (
      <NavLink
        to={item.to}
        end={item.to === "/"}
        className={({ isActive }) =>
          `flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${
            isActive
              ? "bg-connect-teal-soft font-semibold text-connect-teal-dark"
              : "text-connect-text hover:bg-white hover:shadow-connect-card"
          }`
        }
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </NavLink>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-connect-text-secondary">
        <Icon className="h-3.5 w-3.5" />
        {item.label}
      </div>
      <div className="ml-1.5 mt-0.5 flex flex-col gap-0.5 border-l border-connect-border-soft pl-3">
        {item.children!.map((child) => (
          <NavLink
            key={child.to}
            to={child.to}
            className={({ isActive }) =>
              `rounded-md px-2 py-1.5 transition-colors ${
                isActive
                  ? "bg-connect-teal-soft font-semibold text-connect-teal-dark"
                  : "text-connect-text hover:bg-white hover:shadow-connect-card"
              }`
            }
          >
            {child.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
