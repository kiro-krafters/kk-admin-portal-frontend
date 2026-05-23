import { createBrowserRouter } from "react-router";
import Layout from "./Pages/Layout";
import Dashboard from "./Pages/Dashboard";
import StubPage from "./Pages/StubPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      {
        path: "users",
        element: (
          <StubPage
            title="Users"
            description="Manage agents, supervisors, and managers — assign routing profiles, security profiles, and hierarchy."
          />
        ),
      },
      {
        path: "routing/queues",
        element: (
          <StubPage
            title="Queues"
            description="Standard and agent queues that route contacts to agents."
          />
        ),
      },
      {
        path: "routing/quick-connects",
        element: (
          <StubPage
            title="Quick connects"
            description="Pre-configured destinations agents can transfer to — external phone numbers, queues, or agents."
          />
        ),
      },
      {
        path: "routing/profiles",
        element: (
          <StubPage
            title="Routing profiles"
            description="Define which queues and channels each agent handles, with concurrency limits."
          />
        ),
      },
      {
        path: "channels/phone-numbers",
        element: (
          <StubPage
            title="Phone numbers"
            description="Claim phone numbers and attach them to contact flows."
          />
        ),
      },
      {
        path: "channels/flows",
        element: (
          <StubPage
            title="Contact flows"
            description="Design the IVR, prompts, branching, and routing logic for each channel."
          />
        ),
      },
      {
        path: "analytics",
        element: (
          <StubPage
            title="Analytics & insights"
            description="Real-time dashboards, historical metrics, and Contact Lens conversation analytics."
          />
        ),
      },
      {
        path: "settings",
        element: (
          <StubPage
            title="Settings"
            description="Instance settings, telephony options, and integrations."
          />
        ),
      },
    ],
  },
]);
