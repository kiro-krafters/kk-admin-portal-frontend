import { createBrowserRouter } from "react-router";
import AgentWorkspace from "./Pages/AgentWorkspace";
import Layout from "./Pages/Layout";
import Dashboard from "./Pages/Dashboard";
import StubPage from "./Pages/StubPage";
import Login from "./Pages/Login";
import RequireAuth from "./Utils/RequireAuth";
import UsersAdmin from "./Pages/admin/Users";
import QueuesAdmin from "./Pages/admin/Queues";
import RoutingProfilesAdmin from "./Pages/admin/RoutingProfiles";
import ContactFlowsAdmin from "./Pages/admin/ContactFlows";
import AnalyticsAdmin from "./Pages/admin/Analytics";
import AuditLogsAdmin from "./Pages/admin/AuditLogs";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    Component: RequireAuth,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "workspace", Component: AgentWorkspace },
          { path: "users", Component: UsersAdmin },
          { path: "routing/queues", Component: QueuesAdmin },
          {
            path: "routing/quick-connects",
            element: (
              <StubPage
                title="Quick connects"
                description="Pre-configured destinations agents can transfer to — external phone numbers, queues, or agents. (Backend endpoint not yet documented.)"
              />
            ),
          },
          { path: "routing/profiles", Component: RoutingProfilesAdmin },
          {
            path: "channels/phone-numbers",
            element: (
              <StubPage
                title="Phone numbers"
                description="Claim phone numbers and attach them to contact flows. (Backend endpoint not yet documented.)"
              />
            ),
          },
          { path: "channels/flows", Component: ContactFlowsAdmin },
          { path: "analytics", Component: AnalyticsAdmin },
          { path: "audit-logs", Component: AuditLogsAdmin },
          {
            path: "settings",
            element: (
              <StubPage
                title="Settings"
                description="Instance settings, telephony options, and integrations. (Backend endpoint not yet documented.)"
              />
            ),
          },
        ],
      },
    ],
  },
]);
