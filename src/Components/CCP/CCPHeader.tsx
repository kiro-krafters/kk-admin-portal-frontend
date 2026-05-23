import StatusDropdown from "./StatusDropdown";
import { ChatIcon, NotesIcon, PhoneIcon, SettingsIcon } from "./icons";

export type CCPTab = "phone" | "chat" | "notes" | "settings";

type Props = {
  activeTab: CCPTab;
  onTabChange: (tab: CCPTab) => void;
  statusName: string;
  statusOptions: string[];
  onStatusChange: (s: string) => void;
};

export default function CCPHeader({
  activeTab,
  onTabChange,
  statusName,
  statusOptions,
  onStatusChange,
}: Props) {
  return (
    <header className="flex items-center justify-between bg-connect-navy-deep px-3 py-2 text-white">
      <StatusDropdown
        current={statusName}
        options={statusOptions}
        onChange={onStatusChange}
      />
      <nav className="flex items-center gap-1">
        <TabButton
          label="Phone"
          active={activeTab === "phone"}
          onClick={() => onTabChange("phone")}
        >
          <PhoneIcon className="h-5 w-5" />
        </TabButton>
        <TabButton
          label="Chat"
          active={activeTab === "chat"}
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
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-white text-connect-teal-dark"
          : "text-white/80 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
