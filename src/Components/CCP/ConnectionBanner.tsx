import type { ConnectionStatus } from "../../Utils/ConnectProvider";

type Props = {
  status: ConnectionStatus;
  agentName: string | null;
};

export default function ConnectionBanner({ status, agentName }: Props) {
  if (status === "ready") {
    return (
      <div className="flex items-center gap-2 border-b border-connect-success/30 bg-connect-success-soft px-3 py-1 text-xs text-connect-success">
        <span className="inline-block h-2 w-2 rounded-full bg-connect-success" />
        <span>Connected{agentName ? ` · ${agentName}` : ""}</span>
      </div>
    );
  }

  if (status === "initializing") {
    return (
      <div className="flex items-center gap-2 border-b border-connect-warning/30 bg-connect-warning-soft px-3 py-1 text-xs text-connect-warning">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-connect-warning" />
        <span>Connecting to Amazon Connect… complete sign-in in the popup.</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="border-b border-connect-error/30 bg-connect-error-soft px-3 py-1 text-xs text-connect-error">
        Failed to initialize the CCP. Check the instance URL and Approved Origins.
      </div>
    );
  }

  return (
    <div className="border-b border-connect-border bg-connect-bg-soft px-3 py-2 text-xs text-connect-text">
      <p className="font-semibold">Connect instance URL is not set</p>
      <p className="mt-0.5 text-connect-text-secondary">
        Set <code className="rounded bg-connect-border/60 px-1">VITE_CONNECT_INSTANCE_URL</code> in
        <code className="ml-1 rounded bg-connect-border/60 px-1">.env</code> and restart the dev server.
      </p>
    </div>
  );
}
