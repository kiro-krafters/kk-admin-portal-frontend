import ContactPanel from "../Components/AgentWorkspace/ContactPanel";
import ControlPanel from "../Components/AgentWorkspace/ControlPanel";
import WorkspaceSidebar from "../Components/AgentWorkspace/WorkspaceSidebar";

export default function AgentWorkspace() {
  return (
    <div className="flex h-full flex-1 overflow-hidden">
      <WorkspaceSidebar />
      <ContactPanel />
      <ControlPanel />
    </div>
  );
}
