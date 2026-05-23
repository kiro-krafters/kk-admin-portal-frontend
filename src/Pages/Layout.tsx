import { Outlet } from "react-router";
import FloatingCCP from "../Components/CCP/FloatingCCP";
import Sidebar from "../Components/AdminShell/Sidebar";
import TopBar from "../Components/AdminShell/TopBar";
import { ConnectProvider, useConnect } from "../Utils/ConnectProvider";

const INSTANCE_URL =
  (import.meta.env.VITE_CONNECT_INSTANCE_URL as string | undefined) ?? "";
const REGION =
  (import.meta.env.VITE_CONNECT_REGION as string | undefined) ?? "us-east-1";

export default function Layout() {
  return (
    <ConnectProvider instanceUrl={INSTANCE_URL} region={REGION}>
      <Shell />
    </ConnectProvider>
  );
}

function Shell() {
  const { agentName } = useConnect();
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-connect-bg-alt text-connect-text">
      <TopBar agentName={agentName} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
      <FloatingCCP />
    </div>
  );
}
