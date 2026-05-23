import { useEffect, useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import { NotesIcon } from "./icons";

export default function NotesTab() {
  const { contact, notes, saveNote } = useConnect();
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (contact) {
      setDraft(notes[contact.contactId] ?? "");
      setSaved(false);
    } else {
      setDraft("");
    }
  }, [contact, notes]);

  if (!contact) {
    return (
      <section className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-connect-bg-alt text-connect-text-secondary">
          <NotesIcon className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-base font-semibold text-connect-text">
          No active contact
        </h2>
        <p className="mt-1 max-w-xs text-sm text-connect-text-secondary">
          Notes are tied to an active contact. They'll be attached to the
          contact ID and available in transcripts.
        </p>
      </section>
    );
  }

  const handleSave = () => {
    saveNote(contact.contactId, draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <section className="flex h-full flex-col bg-white p-3">
      <header className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-connect-text">
            Contact notes
          </h2>
          <p className="text-[11px] text-connect-text-secondary">
            Contact <span className="font-mono">{contact.contactId.slice(0, 8)}…</span>
          </p>
        </div>
        {saved && (
          <span className="rounded-full bg-connect-success-soft px-2 py-0.5 text-[10px] font-semibold text-connect-success">
            Saved
          </span>
        )}
      </header>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a note for this contact…"
        className="flex-1 resize-none rounded-md border border-connect-border bg-connect-bg-soft px-2 py-1.5 text-sm text-connect-text placeholder:text-connect-text-disabled focus:border-connect-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-connect-teal/20"
      />
      <button
        type="button"
        onClick={handleSave}
        className="mt-2 w-full rounded-md bg-connect-teal px-3 py-1.5 text-sm font-medium text-white hover:bg-connect-teal-dark"
      >
        Save note
      </button>
    </section>
  );
}
