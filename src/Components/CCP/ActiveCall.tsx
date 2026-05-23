import { useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import { useElapsed } from "../../Utils/useElapsed";
import Dialpad from "./Dialpad";
import {
  CloseIcon,
  KeypadIcon,
  MicIcon,
  MicOffIcon,
  PauseIcon,
  PhoneOffIcon,
  PlayIcon,
} from "./icons";

export default function ActiveCall() {
  const {
    contact,
    isMuted,
    isOnHold,
    hangUp,
    closeContact,
    toggleMute,
    toggleHold,
    accept,
    reject,
    sendDtmf,
  } = useConnect();
  const [showKeypad, setShowKeypad] = useState(false);

  const elapsed = useElapsed(
    contact?.state === "connected" ? contact.acceptedAt ?? contact.startedAt : null
  );

  if (!contact) return null;
  // Chat is rendered by ChatPanel; this view is voice/task only.
  if (contact.channel === "chat") return null;

  const isConnected = contact.state === "connected";
  const isEnded =
    contact.state === "ended" ||
    contact.state === "missed" ||
    contact.state === "error";
  // Show Accept/Reject for any inbound contact that hasn't been accepted yet
  // — Streams may surface ringing contacts as either "incoming" or "connecting".
  const canAccept =
    contact.isInbound &&
    contact.acceptedAt === null &&
    !isConnected &&
    !isEnded;
  const isConnectingOutbound =
    !contact.isInbound && contact.state === "connecting";

  const stateLabel = canAccept
    ? "Incoming call"
    : isEnded
    ? contact.state === "missed"
      ? "Missed call"
      : "Call ended"
    : isConnectingOutbound
    ? "Calling…"
    : isConnected
    ? elapsed
    : contact.state;

  return (
    <section className="flex h-full flex-col bg-white">
      <div className="flex flex-col items-center gap-2 px-4 pt-8 pb-4">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold ${
            canAccept
              ? "bg-connect-success-soft text-connect-success"
              : isEnded
              ? "bg-connect-bg-alt text-connect-text-secondary"
              : "bg-connect-teal-soft text-connect-teal-dark"
          }`}
        >
          {(contact.phoneNumber ?? "?").slice(-2)}
        </div>
        <p className="mt-1 text-sm font-medium uppercase tracking-wide text-connect-text-secondary">
          {stateLabel}
        </p>
        <p className="text-lg font-semibold text-connect-text">
          {contact.phoneNumber ?? (contact.channel === "voice" ? "Unknown caller" : contact.channel)}
        </p>
        {contact.queueName && (
          <p className="text-[11px] text-connect-text-secondary">
            via {contact.queueName}
          </p>
        )}
      </div>

      {showKeypad && isConnected && (
        <div className="flex flex-1 min-h-0 flex-col px-4 pb-2">
          <Dialpad onPress={(d) => sendDtmf(d)} />
        </div>
      )}

      {!showKeypad && <div className="flex-1" />}

      <div className="border-t border-connect-border px-4 py-4">
        {canAccept ? (
          <div className="flex items-center justify-around">
            <CircleButton tone="danger" onClick={reject} label="Reject">
              <PhoneOffIcon className="h-6 w-6" />
            </CircleButton>
            <CircleButton tone="success" onClick={accept} label="Accept">
              <MicIcon className="h-6 w-6" />
            </CircleButton>
          </div>
        ) : isEnded ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-connect-text-secondary">
              Finish your notes, then close the contact to take new calls.
            </p>
            <button
              type="button"
              onClick={closeContact}
              className="flex items-center gap-2 rounded-md bg-connect-teal px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-connect-teal-dark"
            >
              <CloseIcon className="h-4 w-4" />
              Close contact
            </button>
          </div>
        ) : (
          <>
            {isConnected && contact.channel === "voice" && (
              <div className="mb-4 flex items-center justify-around">
                <CircleButton
                  tone={isMuted ? "active" : "neutral"}
                  onClick={toggleMute}
                  label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <MicOffIcon className="h-5 w-5" />
                  ) : (
                    <MicIcon className="h-5 w-5" />
                  )}
                </CircleButton>
                <CircleButton
                  tone={isOnHold ? "active" : "neutral"}
                  onClick={toggleHold}
                  label={isOnHold ? "Resume" : "Hold"}
                >
                  {isOnHold ? (
                    <PlayIcon className="h-5 w-5" />
                  ) : (
                    <PauseIcon className="h-5 w-5" />
                  )}
                </CircleButton>
                <CircleButton
                  tone={showKeypad ? "active" : "neutral"}
                  onClick={() => setShowKeypad((v) => !v)}
                  label="Keypad"
                >
                  <KeypadIcon className="h-5 w-5" />
                </CircleButton>
              </div>
            )}
            <div className="flex justify-center">
              <CircleButton tone="danger" onClick={hangUp} label="End call">
                <PhoneOffIcon className="h-6 w-6" />
              </CircleButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function CircleButton({
  tone,
  onClick,
  label,
  children,
}: {
  tone: "neutral" | "active" | "success" | "danger";
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const palette: Record<typeof tone, string> = {
    neutral:
      "bg-connect-bg-alt text-connect-text hover:bg-connect-border/70",
    active: "bg-connect-teal text-white hover:bg-connect-teal-dark",
    success: "bg-connect-success text-white hover:bg-connect-success/90",
    danger: "bg-connect-error text-white hover:bg-connect-error/90",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${palette[tone]}`}
    >
      {children}
    </button>
  );
}
