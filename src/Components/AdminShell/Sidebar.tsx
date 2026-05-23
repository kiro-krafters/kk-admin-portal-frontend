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
} from "./AdminIcons";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: { to: string; label: string }[];
};

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: DashboardIcon },
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
    <aside className="flex w-60 shrink-0 flex-col border-r border-connect-border bg-white">
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 text-sm">
        {NAV.map((item) => (
          <SidebarItem key={item.to} item={item} />
        ))}
      </nav>
      <div className="border-t border-connect-border p-3 text-[11px] text-connect-text-secondary">
        <p className="font-semibold text-connect-text">KK Contact Center</p>
        <p>Build {import.meta.env.MODE}</p>
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
          `flex items-center gap-2 rounded-md px-2 py-1.5 ${
            isActive
              ? "bg-connect-teal-soft font-semibold text-connect-teal-dark"
              : "text-connect-text hover:bg-connect-bg-alt"
          }`
        }
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </NavLink>
    );
  }

  return (
    <div className="mt-1">
      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-connect-text-secondary">
        <Icon className="h-4 w-4" />
        {item.label}
      </div>
      <div className="ml-6 flex flex-col gap-0.5">
        {item.children!.map((child) => (
          <NavLink
            key={child.to}
            to={child.to}
            className={({ isActive }) =>
              `rounded-md px-2 py-1 ${
                isActive
                  ? "bg-connect-teal-soft font-semibold text-connect-teal-dark"
                  : "text-connect-text hover:bg-connect-bg-alt"
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
