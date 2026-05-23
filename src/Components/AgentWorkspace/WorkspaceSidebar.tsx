import AgentProfile from "./AgentProfile";
import QueueList from "./QueueList";
import QuickConnectsList from "./QuickConnectsList";
import StatusSelector from "./StatusSelector";
import TodayStats from "./TodayStats";

export default function WorkspaceSidebar() {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-3 overflow-y-auto border-r border-connect-border bg-connect-bg-soft p-3">
      <AgentProfile />
      <StatusSelector />
      <TodayStats />
      <QueueList />
      <QuickConnectsList />
    </aside>
  );
}
