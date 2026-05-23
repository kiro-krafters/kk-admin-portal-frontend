import { Outlet, useLocation } from "react-router";
import FloatingCCP from "../Components/CCP/FloatingCCP";
import Sidebar from "../Components/AdminShell/Sidebar";
import TopBar from "../Components/AdminShell/TopBar";
import { CCPWindowProvider } from "../Utils/CCPWindowContext";
import { ConnectProvider } from "../Utils/ConnectProvider";

const INSTANCE_URL =
  (import.meta.env.VITE_CONNECT_INSTANCE_URL as string | undefined) ?? "";
const REGION =
  (import.meta.env.VITE_CONNECT_REGION as string | undefined) ?? "us-east-1";

export default function Layout() {
  return (
    <ConnectProvider instanceUrl={INSTANCE_URL} region={REGION}>
      <CCPWindowProvider>
        <Shell />
      </CCPWindowProvider>
    </ConnectProvider>
  );
}

function Shell() {
  const location = useLocation();
  const onWorkspace = location.pathname.startsWith("/workspace");
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-connect-bg-alt text-connect-text">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
      {!onWorkspace && <FloatingCCP />}
    </div>
  );
}
