import { Outlet, useLocation } from "react-router";
import FloatingCCP from "../Components/CCP/FloatingCCP";
import Sidebar from "../Components/AdminShell/Sidebar";
import TopBar from "../Components/AdminShell/TopBar";
import { CCPWindowProvider } from "../Utils/CCPWindowContext";
import { ConnectProvider } from "../Utils/ConnectProvider";

// Connect instance config. Single source of truth is `VITE_CONNECT_INSTANCE_URL`
// in `.env`; the CCP URL is derived from it so the two never drift apart.
// Override individual pieces via `.env` if needed:
//   VITE_CONNECT_INSTANCE_URL=https://<alias>.my.connect.aws
//   VITE_CONNECT_CCP_URL=https://<alias>.my.connect.aws/ccp-v2  (explicit override)
//   VITE_CONNECT_REGION=us-east-1
const INSTANCE_URL =
  (import.meta.env.VITE_CONNECT_INSTANCE_URL as string | undefined) ??
  "https://ai-app-development-2026.my.connect.aws";

function ccpPathFor(instanceUrl: string): string {
  // Modern `.my.connect.aws` instances expose CCP at `/ccp-v2`; the legacy
  // `.awsapps.com` instances use `/connect/ccp-v2`.
  try {
    return /\.my\.connect\.aws$/i.test(new URL(instanceUrl).host)
      ? "/ccp-v2"
      : "/connect/ccp-v2";
  } catch {
    return "/ccp-v2";
  }
}

const CCP_URL =
  (import.meta.env.VITE_CONNECT_CCP_URL as string | undefined) ??
  `${INSTANCE_URL.replace(/\/$/, "")}${ccpPathFor(INSTANCE_URL)}`;

const REGION =
  (import.meta.env.VITE_CONNECT_REGION as string | undefined) ?? "us-east-1";

const LOGIN_POPUP = true;
const LOGIN_POPUP_AUTO_CLOSE = true;
const ALLOW_FRAMED_SOFTPHONE = true;

export default function Layout() {
  return (
    <ConnectProvider
      instanceUrl={INSTANCE_URL}
      ccpUrl={CCP_URL}
      region={REGION}
      loginPopup={LOGIN_POPUP}
      loginPopupAutoClose={LOGIN_POPUP_AUTO_CLOSE}
      softphone={ALLOW_FRAMED_SOFTPHONE}
    >
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
      <FloatingCCP hideIdleFab={onWorkspace} />
    </div>
  );
}
