import { useEffect, useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import ActiveCall from "./ActiveCall";
import CCPHeader, { type CCPTab } from "./CCPHeader";
import ConnectionBanner from "./ConnectionBanner";
import NumberPad from "./NumberPad";
import Placeholder from "./Placeholder";
import QuickConnectsPanel from "./QuickConnectsPanel";

const DEFAULT_STATES = ["Available", "Offline", "Break", "Lunch"];

type PhoneView = "dialer" | "quick-connects";

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

  const [activeTab, setActiveTab] = useState<CCPTab>("phone");
  const [phoneView, setPhoneView] = useState<PhoneView>("dialer");
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("Offline");

  useEffect(() => {
    if (currentState?.name) setSelectedStatus(currentState.name);
  }, [currentState?.name]);

  useEffect(() => {
    if (contact) setActiveTab("phone");
  }, [contact]);

  const options = (
    availableStates.length > 0
      ? availableStates.map((s) => s.name)
      : DEFAULT_STATES
  ).filter((s, i, arr) => arr.indexOf(s) === i);

  const handleStatusChange = (next: string) => {
    setSelectedStatus(next);
    changeState(next);
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
        statusName={selectedStatus}
        statusOptions={options}
        onStatusChange={handleStatusChange}
      />

      <ConnectionBanner status={status} agentName={agentName} />

      <div className="flex-1 overflow-hidden">
        {activeTab === "phone" && contact && <ActiveCall />}
        {activeTab === "phone" && !contact && phoneView === "dialer" && (
          <NumberPad
            onClose={() => setPhoneView("dialer")}
            onCall={handleCall}
            disableCall={status !== "ready"}
            onQuickConnects={() => setPhoneView("quick-connects")}
          />
        )}
        {activeTab === "phone" && !contact && phoneView === "quick-connects" && (
          <QuickConnectsPanel
            onClose={() => setPhoneView("dialer")}
            onDialed={() => setPhoneView("dialer")}
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
        <div className="border-t border-connect-error/40 bg-connect-error-soft px-3 py-2 text-xs text-connect-error">
          {error}
        </div>
      )}
    </div>
  );
}
