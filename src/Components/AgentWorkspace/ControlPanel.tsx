import { useConnect } from "../../Utils/ConnectProvider";
import {
  MicIcon,
  MicOffIcon,
  PauseIcon,
  PhoneOffIcon,
  PlayIcon,
} from "../CCP/icons";
import { CheckIcon, XIcon } from "./WorkspaceIcons";
import ContactHistory from "./ContactHistory";
import NotesPanel from "./NotesPanel";
import SentimentMeter from "./SentimentMeter";
import TransferMenu from "./TransferMenu";

export default function ControlPanel() {
  const {
    contact,
    isMuted,
    isOnHold,
    accept,
    reject,
    hangUp,
    toggleMute,
    toggleHold,
  } = useConnect();

  const isVoice = contact?.channel === "voice";
  const isIncoming = contact?.state === "incoming";
  const isConnected = contact?.state === "connected";

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-3 overflow-y-auto border-l border-connect-border bg-connect-bg-soft p-3">
      <section className="rounded-lg border border-connect-border bg-white p-3 shadow-connect-card">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          Controls
        </h3>

        {!contact && (
          <p className="text-[12px] text-connect-text-secondary">
            No active contact.
          </p>
        )}

        {isIncoming && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={accept}
              className="flex items-center justify-center gap-1.5 rounded-md bg-connect-success px-3 py-2 text-sm font-medium text-white hover:bg-connect-success/90"
            >
              <CheckIcon className="h-4 w-4" />
              Accept
            </button>
            <button
              type="button"
              onClick={reject}
              className="flex items-center justify-center gap-1.5 rounded-md bg-connect-error px-3 py-2 text-sm font-medium text-white hover:bg-connect-error/90"
            >
              <XIcon className="h-4 w-4" />
              Reject
            </button>
          </div>
        )}

        {contact && !isIncoming && (
          <div className="space-y-2">
            {isVoice && (
              <div className="grid grid-cols-2 gap-2">
                <ToggleButton
                  active={isMuted}
                  label={isMuted ? "Unmute" : "Mute"}
                  onClick={toggleMute}
                  disabled={!isConnected}
                  Icon={isMuted ? MicOffIcon : MicIcon}
                />
                <ToggleButton
                  active={isOnHold}
                  label={isOnHold ? "Resume" : "Hold"}
                  onClick={toggleHold}
                  disabled={!isConnected}
                  Icon={isOnHold ? PlayIcon : PauseIcon}
                />
              </div>
            )}

            <TransferMenu disabled={!isConnected} />

            <button
              type="button"
              onClick={hangUp}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-connect-error px-3 py-2 text-sm font-medium text-white hover:bg-connect-error/90"
            >
              <PhoneOffIcon className="h-4 w-4" />
              End contact
            </button>
          </div>
        )}
      </section>

      <SentimentMeter />
      <NotesPanel />
      <ContactHistory />
    </aside>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
  disabled,
  Icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-connect-teal text-white hover:bg-connect-teal-dark"
          : "border border-connect-border bg-white text-connect-text hover:bg-connect-bg-alt"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
