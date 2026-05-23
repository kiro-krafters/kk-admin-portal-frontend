import type { ContactInfo } from "../../Utils/ConnectProvider";
import { useElapsed } from "../../Utils/useElapsed";
import { HeadsetIcon } from "./WorkspaceIcons";

type Props = {
  contact: ContactInfo;
  isMuted: boolean;
  isOnHold: boolean;
};

export default function VoiceCallPanel({ contact, isMuted, isOnHold }: Props) {
  const elapsed = useElapsed(
    contact.state === "connected" ? contact.acceptedAt ?? contact.startedAt : null
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-b from-white to-connect-bg-soft px-6 py-10">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-connect-teal-soft text-connect-teal-dark">
        <HeadsetIcon className="h-10 w-10" />
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          {contact.state === "incoming"
            ? "Incoming call"
            : contact.state === "connecting"
            ? contact.isInbound
              ? "Connecting"
              : "Calling"
            : contact.state === "connected"
            ? "On call"
            : contact.state}
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-connect-text">
          {contact.state === "connected" ? elapsed : "00:00"}
        </p>
        <p className="mt-1 text-sm text-connect-text-secondary">
          {contact.phoneNumber ?? "Unknown caller"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isMuted && (
          <span className="rounded-full bg-connect-warning-soft px-2 py-0.5 text-[11px] font-semibold text-connect-warning">
            Muted
          </span>
        )}
        {isOnHold && (
          <span className="rounded-full bg-connect-blue-soft px-2 py-0.5 text-[11px] font-semibold text-connect-blue-dark">
            On hold
          </span>
        )}
      </div>
    </div>
  );
}
