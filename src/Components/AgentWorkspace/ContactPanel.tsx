import { useCCPWindow } from "../../Utils/CCPWindowContext";
import { useConnect } from "../../Utils/ConnectProvider";
import { PhoneFabIcon } from "../AdminShell/AdminIcons";
import ChatComposer from "./ChatComposer";
import ChatTranscript from "./ChatTranscript";
import ContactCard from "./ContactCard";
import VoiceCallPanel from "./VoiceCallPanel";

export default function ContactPanel() {
  const {
    contact,
    contactAttributes,
    chatMessages,
    isMuted,
    isOnHold,
    sendChat,
    notifyTyping,
    status,
  } = useConnect();
  const { openNumberPad } = useCCPWindow();

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

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-connect-border bg-white shadow-connect-card">
        {isChat ? (
          <>
            <div className="flex-1 overflow-hidden">
              <ChatTranscript messages={chatMessages} />
            </div>
            <ChatComposer
              disabled={contact.state !== "connected"}
              onSend={sendChat}
              onTyping={notifyTyping}
            />
          </>
        ) : (
          <VoiceCallPanel
            contact={contact}
            isMuted={isMuted}
            isOnHold={isOnHold}
          />
        )}
      </div>
    </section>
  );
}
