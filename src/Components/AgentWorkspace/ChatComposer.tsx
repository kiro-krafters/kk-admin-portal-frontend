import { useState, type KeyboardEvent } from "react";
import { SendIcon } from "./WorkspaceIcons";

type Props = {
  disabled?: boolean;
  onSend: (text: string) => Promise<void> | void;
  onTyping?: () => void;
};

export default function ChatComposer({ disabled, onSend, onTyping }: Props) {
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
    <div className="flex items-end gap-2 border-t border-connect-border bg-white px-4 py-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        rows={1}
        disabled={disabled}
        placeholder={
          disabled ? "Chat will activate once the contact is connected" : "Type a message…"
        }
        className="max-h-32 flex-1 resize-none rounded-md border border-connect-border bg-connect-bg-soft px-3 py-2 text-sm text-connect-text placeholder:text-connect-text-disabled focus:border-connect-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-connect-teal/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="button"
        onClick={send}
        disabled={disabled || busy || text.trim().length === 0}
        className="flex h-9 items-center gap-1.5 rounded-md bg-connect-teal px-3 text-sm font-medium text-white shadow-sm hover:bg-connect-teal-dark disabled:cursor-not-allowed disabled:bg-connect-bg-alt disabled:text-connect-text-disabled disabled:shadow-none"
      >
        <SendIcon className="h-3.5 w-3.5" />
        Send
      </button>
    </div>
  );
}
