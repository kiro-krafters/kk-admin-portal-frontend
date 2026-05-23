import { useEffect, useState } from "react";
import { useCCPWindow } from "../../Utils/CCPWindowContext";
import { useConnect } from "../../Utils/ConnectProvider";
import ActiveCall from "./ActiveCall";
import CCPHeader, { type CCPTab } from "./CCPHeader";
import ConnectionBanner from "./ConnectionBanner";
import NumberPad from "./NumberPad";
import Placeholder from "./Placeholder";
import QuickConnectsPanel from "./QuickConnectsPanel";

const DEFAULT_STATES = ["Available", "Offline", "Break", "Lunch"];

export default function CCP() {
  const {
    status,
    agentName,
    currentState,
    availableStates,
    contact,
    changeState,
    dial,
  } = useConnect();
  const { view, setView } = useCCPWindow();

  const [activeTab, setActiveTab] = useState<CCPTab>("phone");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contact) setActiveTab("phone");
  }, [contact]);

  const options = (
    availableStates.length > 0
      ? availableStates.map((s) => s.name)
      : DEFAULT_STATES
  ).filter((s, i, arr) => arr.indexOf(s) === i);

  // Drive the picker from the real agent state — no optimistic local copy.
  const statusName = currentState?.name ?? "Offline";

  const handleStatusChange = async (next: string) => {
    setError(null);
    try {
      await changeState(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change status");
    }
  };

  const handleCall = async (phoneNumber: string) => {
    setError(null);
    try {
      await dial(phoneNumber);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place call");
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <CCPHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        statusName={statusName}
        statusOptions={options}
        onStatusChange={handleStatusChange}
      />

      <ConnectionBanner status={status} agentName={agentName} />

      <div className="flex-1 overflow-hidden">
        {activeTab === "phone" && contact && <ActiveCall />}
        {activeTab === "phone" && !contact && view === "dialer" && (
          <NumberPad
            onClose={() => setView("dialer")}
            onCall={handleCall}
            disableCall={status !== "ready"}
            onQuickConnects={() => setView("quick-connects")}
          />
        )}
        {activeTab === "phone" && !contact && view === "quick-connects" && (
          <QuickConnectsPanel
            onClose={() => setView("dialer")}
            onDialed={() => setView("dialer")}
          />
        )}
        {activeTab === "chat" && (
          <Placeholder
            title="Chat"
            message="Chat contacts will appear here when routed to this agent."
          />
        )}
        {activeTab === "notes" && (
          <Placeholder
            title="Contact notes"
            message="Notes for the active contact will appear here."
          />
        )}
        {activeTab === "settings" && (
          <Placeholder
            title="Settings"
            message="Audio devices and CCP preferences."
          />
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 border-t-2 border-connect-error bg-connect-error-soft px-3 py-2.5 text-xs">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-connect-error text-[10px] font-bold text-white">
            !
          </span>
          <div className="flex-1">
            <p className="font-semibold text-connect-error">Call failed</p>
            <p className="mt-0.5 break-words text-connect-error">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-connect-error underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
