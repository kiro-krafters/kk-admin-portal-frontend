import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import { useElapsed } from "../../Utils/useElapsed";
import {
  ChatIcon,
  CloseIcon,
  PhoneOffIcon,
} from "./icons";

export default function ChatPanel() {
  const {
    contact,
    chatMessages,
    contactAttributes,
    sendChat,
    notifyTyping,
    accept,
    reject,
    hangUp,
    closeContact,
  } = useConnect();

  if (!contact || contact.channel !== "chat") {
    return (
      <section className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-connect-teal-soft text-connect-teal-dark">
          <ChatIcon className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-base font-semibold text-connect-text">
          No chat in progress
        </h2>
        <p className="mt-1 max-w-xs text-sm text-connect-text-secondary">
          Inbound chat contacts routed by Amazon Connect will appear here.
        </p>
      </section>
    );
  }

  const canAccept =
    contact.isInbound &&
    contact.acceptedAt === null &&
    contact.state !== "connected" &&
    contact.state !== "ended" &&
    contact.state !== "missed";
  const isConnected = contact.state === "connected";
  const isEnded =
    contact.state === "ended" ||
    contact.state === "missed" ||
    contact.state === "error";

  if (canAccept)
    return (
      <IncomingChat onAccept={accept} onReject={reject} attributes={contactAttributes} />
    );

  return (
    <section className="flex h-full flex-col bg-white">
      <ChatHeader
        attributes={contactAttributes}
        ended={isEnded}
        onEnd={hangUp}
        onClose={closeContact}
      />
      <div className="flex-1 overflow-hidden">
        <ChatTranscript messages={chatMessages} />
      </div>
      {isEnded ? (
        <EndedFooter onClose={closeContact} />
      ) : (
        <Composer disabled={!isConnected} onSend={sendChat} onTyping={notifyTyping} />
      )}
    </section>
  );
}

function EndedFooter({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 border-t border-connect-border bg-connect-bg-soft px-3 py-3 text-center">
      <p className="text-[11px] text-connect-text-secondary">
        Chat ended. Add notes, then close the contact.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-2 rounded-md bg-connect-teal px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-connect-teal-dark"
      >
        <CloseIcon className="h-3.5 w-3.5" />
        Close contact
      </button>
    </div>
  );
}

function ChatHeader({
  attributes,
  ended,
  onEnd,
  onClose,
}: {
  attributes: Record<string, string>;
  ended: boolean;
  onEnd: () => void;
  onClose: () => void;
}) {
  const { contact } = useConnect();
  const elapsed = useElapsed(
    ended ? null : contact?.acceptedAt ?? contact?.startedAt ?? null
  );
  const name =
    attributes.customerName ||
    attributes.CustomerName ||
    attributes.name ||
    "Customer";
  return (
    <header className="flex items-center justify-between border-b border-connect-border bg-connect-bg-soft px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase ${
            ended
              ? "bg-connect-bg-alt text-connect-text-secondary"
              : "bg-connect-teal-soft text-connect-teal-dark"
          }`}
        >
          {name.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-connect-text">{name}</p>
          <p className="text-[11px] text-connect-text-secondary">
            {ended ? "Chat ended" : `Chat · ${elapsed}`}
          </p>
        </div>
      </div>
      {ended ? (
        <button
          type="button"
          onClick={onClose}
          title="Close contact"
          aria-label="Close contact"
          className="flex h-8 items-center gap-1.5 rounded-md bg-connect-teal px-2.5 text-xs font-semibold text-white hover:bg-connect-teal-dark"
        >
          <CloseIcon className="h-3.5 w-3.5" />
          Close
        </button>
      ) : (
        <button
          type="button"
          onClick={onEnd}
          title="End chat"
          aria-label="End chat"
          className="flex h-8 items-center gap-1.5 rounded-md bg-connect-error px-2.5 text-xs font-semibold text-white hover:bg-connect-error/90"
        >
          <PhoneOffIcon className="h-3.5 w-3.5" />
          End
        </button>
      )}
    </header>
  );
}

function IncomingChat({
  onAccept,
  onReject,
  attributes,
}: {
  onAccept: () => void;
  onReject: () => void;
  attributes: Record<string, string>;
}) {
  const name =
    attributes.customerName ||
    attributes.CustomerName ||
    attributes.name ||
    "New chat";
  return (
    <section className="flex h-full flex-col items-center justify-center gap-4 bg-white px-6">
      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-connect-teal-soft text-connect-teal-dark">
        <span className="absolute inset-0 animate-ping rounded-full bg-connect-teal/30" />
        <ChatIcon className="h-9 w-9" />
      </span>
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          Incoming chat
        </p>
        <p className="mt-1 text-lg font-semibold text-connect-text">{name}</p>
      </div>
      <div className="flex w-full items-center justify-around pt-2">
        <button
          type="button"
          onClick={onReject}
          aria-label="Reject"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-connect-error text-white hover:bg-connect-error/90"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={onAccept}
          aria-label="Accept"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-connect-success text-white hover:bg-connect-success/90"
        >
          <ChatIcon className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}

function ChatTranscript({
  messages,
}: {
  messages: ReturnType<typeof useConnect>["chatMessages"];
}) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center text-xs text-connect-text-secondary">
        <p className="font-medium text-connect-text">Waiting for the first message</p>
        <p className="mt-1 text-connect-text-disabled">
          Messages from the customer will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto px-3 py-3">
      {messages.map((m) => {
        if (m.from === "system") {
          return (
            <div
              key={m.id}
              className="self-center rounded-full bg-connect-bg-alt px-2 py-0.5 text-[10px] text-connect-text-secondary"
            >
              {m.content}
            </div>
          );
        }
        const isAgent = m.from === "agent";
        return (
          <div
            key={m.id}
            className={`flex max-w-[85%] flex-col gap-0.5 ${
              isAgent ? "self-end items-end" : "self-start items-start"
            }`}
          >
            <div
              className={`rounded-2xl px-2.5 py-1.5 text-sm leading-snug ${
                isAgent
                  ? "bg-connect-teal text-white"
                  : "bg-connect-bg-alt text-connect-text"
              }`}
            >
              {m.content}
            </div>
            <span className="px-1 text-[9px] text-connect-text-disabled">
              {new Date(m.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

function Composer({
  disabled,
  onSend,
  onTyping,
}: {
  disabled: boolean;
  onSend: (text: string) => Promise<void> | void;
  onTyping?: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy || disabled) return;
    setBusy(true);
    try {
      await onSend(trimmed);
      setText("");
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    } else {
      onTyping?.();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-connect-border bg-white px-3 py-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        rows={1}
        disabled={disabled}
        placeholder={disabled ? "Waiting for connection…" : "Type a message…"}
        className="max-h-24 flex-1 resize-none rounded-md border border-connect-border bg-connect-bg-soft px-2.5 py-1.5 text-sm text-connect-text placeholder:text-connect-text-disabled focus:border-connect-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-connect-teal/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="button"
        onClick={send}
        disabled={disabled || busy || text.trim().length === 0}
        className="h-8 rounded-md bg-connect-teal px-3 text-xs font-semibold text-white hover:bg-connect-teal-dark disabled:cursor-not-allowed disabled:bg-connect-bg-alt disabled:text-connect-text-disabled"
      >
        Send
      </button>
    </div>
  );
}
