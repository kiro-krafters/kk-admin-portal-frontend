import StatusDropdown from "./StatusDropdown";
import { ChatIcon, NotesIcon, PhoneIcon, SettingsIcon } from "./icons";

export type CCPTab = "phone" | "chat" | "notes" | "settings";

type Props = {
  activeTab: CCPTab;
  onTabChange: (tab: CCPTab) => void;
  statusName: string;
  statusOptions: string[];
  onStatusChange: (s: string) => void;
  phoneBadge?: boolean;
  chatBadge?: boolean;
};

export default function CCPHeader({
  activeTab,
  onTabChange,
  statusName,
  statusOptions,
  onStatusChange,
  phoneBadge,
  chatBadge,
}: Props) {
  return (
    <header className="flex items-center justify-between bg-gradient-to-r from-connect-teal-dark to-connect-teal px-3 py-2 text-white">
      <StatusDropdown
        current={statusName}
        options={statusOptions}
        onChange={onStatusChange}
      />
      <nav className="flex items-center gap-1">
        <TabButton
          label="Phone"
          active={activeTab === "phone"}
          badge={phoneBadge}
          onClick={() => onTabChange("phone")}
        >
          <PhoneIcon className="h-5 w-5" />
        </TabButton>
        <TabButton
          label="Chat"
          active={activeTab === "chat"}
          badge={chatBadge}
          onClick={() => onTabChange("chat")}
        >
          <ChatIcon className="h-5 w-5" />
        </TabButton>
        <span className="mx-1 h-5 w-px bg-white/20" />
        <TabButton
          label="Notes"
          active={activeTab === "notes"}
          onClick={() => onTabChange("notes")}
        >
          <NotesIcon className="h-5 w-5" />
        </TabButton>
        <TabButton
          label="Settings"
          active={activeTab === "settings"}
          onClick={() => onTabChange("settings")}
        >
          <SettingsIcon className="h-5 w-5" />
        </TabButton>
      </nav>
    </header>
  );
}

function TabButton({
  active,
  onClick,
  label,
  badge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`relative flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-white text-connect-teal-dark"
          : "text-white/80 hover:bg-white/10"
      }`}
    >
      {children}
      {badge && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-connect-error opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-connect-error" />
        </span>
      )}
    </button>
  );
}
