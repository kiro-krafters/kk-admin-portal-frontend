import { useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import { useElapsed } from "../../Utils/useElapsed";
import Dialpad from "./Dialpad";
import {
  KeypadIcon,
  MicIcon,
  MicOffIcon,
  PauseIcon,
  PhoneOffIcon,
  PlayIcon,
} from "./icons";

export default function ActiveCall() {
  const { contact, isMuted, isOnHold, hangUp, toggleMute, toggleHold, accept, reject, sendDtmf } =
    useConnect();
  const [showKeypad, setShowKeypad] = useState(false);

  const elapsed = useElapsed(
    contact?.state === "connected" ? contact.startedAt : null
  );

  if (!contact) return null;

  const isIncoming = contact.state === "incoming";
  const isConnecting = contact.state === "connecting";
  const isConnected = contact.state === "connected";

  const stateLabel = isIncoming
    ? "Incoming call"
    : isConnecting
    ? contact.isInbound
      ? "Connecting…"
      : "Calling…"
    : isConnected
    ? elapsed
    : contact.state;

  return (
    <section className="flex h-full flex-col bg-white">
      <div className="flex flex-col items-center gap-2 px-4 pt-8 pb-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-connect-teal-soft text-3xl font-semibold text-connect-teal-dark">
          {(contact.phoneNumber ?? "?").slice(-2)}
        </div>
        <p className="mt-1 text-sm font-medium uppercase tracking-wide text-connect-text-secondary">
          {stateLabel}
        </p>
        <p className="text-lg font-semibold text-connect-text">
          {contact.phoneNumber ?? "Unknown caller"}
        </p>
      </div>

      {showKeypad && isConnected && (
        <div className="flex flex-1 min-h-0 flex-col px-4 pb-2">
          <Dialpad onPress={(d) => sendDtmf(d)} />
        </div>
      )}

      {!showKeypad && <div className="flex-1" />}

      <div className="border-t border-connect-border px-4 py-4">
        {isIncoming ? (
          <div className="flex items-center justify-around">
            <CircleButton tone="danger" onClick={reject} label="Reject">
              <PhoneOffIcon className="h-6 w-6" />
            </CircleButton>
            <CircleButton tone="success" onClick={accept} label="Accept">
              <MicIcon className="h-6 w-6" />
            </CircleButton>
          </div>
        ) : (
          <>
            {isConnected && (
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
