import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "amazon-connect-streams";
import {
  acceptCurrentContact,
  dialEndpoint,
  dialPhoneNumber,
  fetchQuickConnects,
  hangUpCurrentContact,
  initializeCCP,
  rejectCurrentContact,
  sendDigit,
  setAgentState,
  toggleHold as toggleHoldRaw,
  toggleMute as toggleMuteRaw,
  type QuickConnectEntry,
} from "./connect";

type AgentStateInfo = { name: string; type?: string };

export type ContactInfo = {
  contactId: string;
  channel: string; // 'voice' | 'chat' | 'task'
  state: string; // 'incoming' | 'connecting' | 'connected' | 'ended' | ...
  phoneNumber: string | null;
  isInbound: boolean;
  startedAt: number;
};

export type ConnectionStatus =
  | "missing-config"
  | "initializing"
  | "ready"
  | "error";

type ConnectContextValue = {
  status: ConnectionStatus;
  agentName: string | null;
  currentState: AgentStateInfo | null;
  availableStates: AgentStateInfo[];
  contact: ContactInfo | null;
  isMuted: boolean;
  isOnHold: boolean;
  quickConnects: QuickConnectEntry[];
  quickConnectsLoading: boolean;
  dial: (number: string) => Promise<void>;
  dialQuickConnect: (entry: QuickConnectEntry) => Promise<void>;
  refreshQuickConnects: () => Promise<void>;
  hangUp: () => void;
  changeState: (name: string) => void;
  accept: () => void;
  reject: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  sendDtmf: (digit: string) => void;
};

const ConnectContext = createContext<ConnectContextValue | null>(null);

type ProviderProps = {
  instanceUrl: string;
  region?: string;
  children: ReactNode;
  headless?: boolean;
};

function snapshotContact(c: connect.Contact): ContactInfo {
  const conn = c.getActiveInitialConnection() ?? c.getInitialConnection();
  const endpoint = conn?.getEndpoint();
  return {
    contactId: c.getContactId(),
    channel: c.getType(),
    state: c.getState().type,
    phoneNumber: endpoint?.phoneNumber ?? null,
    isInbound: c.isInbound(),
    startedAt: Date.now(),
  };
}

export function ConnectProvider({
  instanceUrl,
  region,
  children,
  headless = true,
}: ProviderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(
    instanceUrl ? "initializing" : "missing-config"
  );
  const [agentName, setAgentName] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<AgentStateInfo | null>(null);
  const [availableStates, setAvailableStates] = useState<AgentStateInfo[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [quickConnects, setQuickConnects] = useState<QuickConnectEntry[]>([]);
  const [quickConnectsLoading, setQuickConnectsLoading] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !instanceUrl) return;
    try {
      initializeCCP(containerRef.current, { instanceUrl, region });
    } catch (e) {
      console.error("Failed to initialize CCP", e);
      setStatus("error");
      return;
    }

    connect.agent((agent) => {
      setStatus("ready");
      setAgentName(agent.getName());
      setAvailableStates(
        agent.getAgentStates().map((s) => ({ name: s.name, type: s.type }))
      );
      const s = agent.getState();
      setCurrentState({ name: s.name, type: s.type });

      agent.onStateChange((evt) => {
        setCurrentState({ name: evt.newState, type: evt.newState });
      });

      agent.onMuteToggle((obj) => {
        setIsMuted(Boolean(obj.muted));
      });
    });

    connect.contact((c) => {
      const update = () => {
        setContact(snapshotContact(c));
        const conn = c.getAgentConnection();
        if (conn && "isOnHold" in conn) {
          try {
            setIsOnHold(Boolean(conn.isOnHold()));
          } catch {
            /* noop */
          }
        }
      };
      update();
      c.onIncoming(update);
      c.onConnecting(update);
      c.onAccepted(update);
      c.onConnected(update);
      c.onEnded(() => {
        setContact(null);
        setIsMuted(false);
        setIsOnHold(false);
      });
      c.onDestroy(() => {
        setContact(null);
        setIsMuted(false);
        setIsOnHold(false);
      });
    });
  }, [instanceUrl, region]);

  const refreshQuickConnects = useCallback(async () => {
    setQuickConnectsLoading(true);
    try {
      const list = await fetchQuickConnects();
      setQuickConnects(list);
    } catch (err) {
      console.warn("Failed to fetch quick connects", err);
      setQuickConnects([]);
    } finally {
      setQuickConnectsLoading(false);
    }
  }, []);

  // Auto-load quick connects once an agent is ready.
  useEffect(() => {
    if (status === "ready") {
      refreshQuickConnects();
    }
  }, [status, refreshQuickConnects]);

  const dial = useCallback((number: string) => dialPhoneNumber(number), []);
  const dialQuickConnect = useCallback(
    (entry: QuickConnectEntry) => dialEndpoint(entry.raw),
    []
  );
  const hangUp = useCallback(() => hangUpCurrentContact(), []);
  const changeState = useCallback((name: string) => setAgentState(name), []);
  const accept = useCallback(() => acceptCurrentContact(), []);
  const reject = useCallback(() => rejectCurrentContact(), []);
  const toggleMute = useCallback(() => toggleMuteRaw(isMuted), [isMuted]);
  const toggleHold = useCallback(() => {
    toggleHoldRaw(isOnHold);
    setIsOnHold((v) => !v);
  }, [isOnHold]);
  const sendDtmf = useCallback((d: string) => sendDigit(d), []);

  const value = useMemo<ConnectContextValue>(
    () => ({
      status,
      agentName,
      currentState,
      availableStates,
      contact,
      isMuted,
      isOnHold,
      quickConnects,
      quickConnectsLoading,
      dial,
      dialQuickConnect,
      refreshQuickConnects,
      hangUp,
      changeState,
      accept,
      reject,
      toggleMute,
      toggleHold,
      sendDtmf,
    }),
    [
      status,
      agentName,
      currentState,
      availableStates,
      contact,
      isMuted,
      isOnHold,
      quickConnects,
      quickConnectsLoading,
      dial,
      dialQuickConnect,
      refreshQuickConnects,
      hangUp,
      changeState,
      accept,
      reject,
      toggleMute,
      toggleHold,
      sendDtmf,
    ]
  );

  return (
    <ConnectContext.Provider value={value}>
      <div
        ref={containerRef}
        id="connect-ccp-container"
        className={
          headless
            ? "fixed -left-[9999px] top-0 h-[1px] w-[1px] overflow-hidden"
            : "h-[600px] w-[400px]"
        }
        aria-hidden={headless}
      />
      {children}
    </ConnectContext.Provider>
  );
}

export function useConnect(): ConnectContextValue {
  const ctx = useContext(ConnectContext);
  if (!ctx) {
    throw new Error("useConnect must be used inside <ConnectProvider>");
  }
  return ctx;
}
