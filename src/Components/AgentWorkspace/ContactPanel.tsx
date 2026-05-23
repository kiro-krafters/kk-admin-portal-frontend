import { useCCPWindow } from "../../Utils/CCPWindowContext";
import { useConnect } from "../../Utils/ConnectProvider";
import { PhoneFabIcon } from "../AdminShell/AdminIcons";
import { ChatIcon } from "../CCP/icons";
import ContactCard from "./ContactCard";
import VoiceCallPanel from "./VoiceCallPanel";

export default function ContactPanel() {
  const { contact, contactAttributes, isMuted, isOnHold, status } =
    useConnect();
  const { open: openCCP, openNumberPad } = useCCPWindow();

  if (!contact) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-3 bg-connect-bg-alt p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-connect-teal-dark shadow-connect-card">
          <PhoneFabIcon className="h-7 w-7" />
        </div>
        <h2 className="text-base font-semibold text-connect-text">
          No active contact
        </h2>
        <p className="max-w-sm text-sm text-connect-text-secondary">
          When a customer is routed to you, the contact details and conversation
          will appear here. You can also start an outbound call from the number
          pad.
        </p>
        <button
          type="button"
          onClick={openNumberPad}
          disabled={status !== "ready"}
          className="mt-1 flex items-center gap-2 rounded-md bg-connect-teal px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-connect-teal-dark disabled:cursor-not-allowed disabled:bg-connect-bg-alt disabled:text-connect-text-disabled disabled:shadow-none"
        >
          <PhoneFabIcon className="h-4 w-4" />
          Open number pad
        </button>
      </section>
    );
  }

  const isChat = contact.channel === "chat";

  return (
    <section className="flex flex-1 flex-col gap-3 overflow-hidden bg-connect-bg-alt p-3">
      <ContactCard contact={contact} attributes={contactAttributes} />

      {isChat ? (
        <ChatInCCPHint onOpenCCP={openCCP} />
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-connect-border bg-white shadow-connect-card">
          <VoiceCallPanel
            contact={contact}
            isMuted={isMuted}
            isOnHold={isOnHold}
          />
        </div>
      )}
    </section>
  );
}

function ChatInCCPHint({ onOpenCCP }: { onOpenCCP: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-connect-border bg-white p-6 text-center shadow-connect-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-connect-teal-soft text-connect-teal-dark">
        <ChatIcon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-connect-text">
          Chat is open in the CCP
        </h3>
        <p className="mt-1 max-w-xs text-xs text-connect-text-secondary">
          Read and reply to this conversation from the CCP panel. Customer
          details stay here on the workspace.
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenCCP}
        className="mt-1 rounded-md bg-connect-teal px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-connect-teal-dark"
      >
        Open CCP
      </button>
    </div>
  );
}
