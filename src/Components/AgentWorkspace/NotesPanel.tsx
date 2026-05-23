import { useEffect, useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import { NoteIcon } from "./WorkspaceIcons";

export default function NotesPanel() {
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

  const handleSave = () => {
    if (!contact) return;
    saveNote(contact.contactId, draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <section className="rounded-lg border border-connect-border bg-white p-3 shadow-connect-card">
      <header className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          <NoteIcon className="h-3.5 w-3.5" />
          Notes
        </h3>
        {saved && (
          <span className="text-[10px] font-semibold text-connect-success">
            Saved
          </span>
        )}
      </header>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={!contact}
        rows={4}
        placeholder={
          contact
            ? "Add a note for this contact…"
            : "Notes can be added when a contact is active."
        }
        className="w-full resize-none rounded-md border border-connect-border bg-connect-bg-soft px-2 py-1.5 text-sm text-connect-text placeholder:text-connect-text-disabled focus:border-connect-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-connect-teal/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={!contact}
        className="mt-2 w-full rounded-md bg-connect-teal px-3 py-1.5 text-sm font-medium text-white hover:bg-connect-teal-dark disabled:cursor-not-allowed disabled:bg-connect-bg-alt disabled:text-connect-text-disabled"
      >
        Save note
      </button>
    </section>
  );
}
