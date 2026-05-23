import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../Utils/connect";

type Props = {
  messages: ChatMessage[];
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatTranscript({ messages }: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-sm text-connect-text-secondary">
        <p className="font-medium text-connect-text">No messages yet</p>
        <p className="mt-1 text-xs text-connect-text-disabled">
          Say hi — chat messages will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} m={m} />
      ))}
      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({ m }: { m: ChatMessage }) {
  if (m.from === "system") {
    return (
      <div className="self-center rounded-full bg-connect-bg-alt px-3 py-1 text-[11px] text-connect-text-secondary">
        {m.content}
      </div>
    );
  }
  const isAgent = m.from === "agent";
  return (
    <div
      className={`flex max-w-[80%] flex-col gap-1 ${
        isAgent ? "self-end items-end" : "self-start items-start"
      }`}
    >
      <div
        className={`rounded-2xl px-3 py-2 text-sm ${
          isAgent
            ? "bg-connect-teal text-white"
            : "bg-connect-bg-alt text-connect-text"
        }`}
      >
        {m.content}
      </div>
      <p className="px-1 text-[10px] text-connect-text-disabled">
        {isAgent ? "You" : m.participantRole?.toLowerCase() ?? "customer"} ·{" "}
        {formatTime(m.timestamp)}
      </p>
    </div>
  );
}
