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
import "amazon-connect-chatjs";
import {
  acceptCurrentContact,
  dialEndpoint,
  dialPhoneNumber,
  fetchQuickConnects,
  getChatSession,
  hangUpCurrentContact,
  initializeCCP,
  readContactAttributes,
  rejectCurrentContact,
  sendChatMessage as sendChatMessageRaw,
  sendDigit,
  sendTypingEvent,
  setAgentState,
  toggleHold as toggleHoldRaw,
  toggleMute as toggleMuteRaw,
  transferToEndpoint,
  type ChatMessage,
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
  acceptedAt: number | null;
};

export type ConnectionStatus =
  | "missing-config"
  | "initializing"
  | "ready"
  | "error";

export type QueueMetric = {
  queueId: string;
  name: string;
  inQueue: number;
  longestWait: string;
};

export type AgentStats = {
  contactsHandled: number;
  csatPercent: number;
  avgHandleSeconds: number;
  inQueueCount: number;
};

export type ContactHistoryEntry = {
  contactId: string;
  channel: string;
  startedAt: string;
  durationSeconds: number;
  outcome: string;
};

type ConnectContextValue = {
  status: ConnectionStatus;
  agentName: string | null;
  agentEmail: string | null;
  agentRole: string;
  currentState: AgentStateInfo | null;
  availableStates: AgentStateInfo[];
  contact: ContactInfo | null;
  contactAttributes: Record<string, string>;
  isMuted: boolean;
  isOnHold: boolean;
  quickConnects: QuickConnectEntry[];
  quickConnectsLoading: boolean;
  queueMetrics: QueueMetric[];
  agentStats: AgentStats;
  contactHistory: ContactHistoryEntry[];
  sentiment: { score: number; label: "positive" | "neutral" | "negative" } | null;
  chatMessages: ChatMessage[];
  notes: Record<string, string>;
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
  sendChat: (text: string) => Promise<void>;
  notifyTyping: () => void;
  transfer: (endpoint: QuickConnectEntry) => Promise<void>;
  saveNote: (contactId: string, text: string) => void;
};

const ConnectContext = createContext<ConnectContextValue | null>(null);

type ProviderProps = {
  instanceUrl: string;
  region?: string;
  children: ReactNode;
  headless?: boolean;
};

function snapshotContact(
  c: connect.Contact,
  acceptedAt: number | null
): ContactInfo {
  const conn = c.getActiveInitialConnection() ?? c.getInitialConnection();
  const endpoint = conn?.getEndpoint();
  return {
    contactId: c.getContactId(),
    channel: c.getType(),
    state: c.getState().type,
    phoneNumber: endpoint?.phoneNumber ?? null,
    isInbound: c.isInbound(),
    startedAt: Date.now(),
    acceptedAt,
  };
}

// Mocked stats / history until backend metrics endpoints are wired.
const MOCK_AGENT_STATS: AgentStats = {
  contactsHandled: 23,
  csatPercent: 92,
  avgHandleSeconds: 247,
  inQueueCount: 7,
};

const MOCK_QUEUE_METRICS: QueueMetric[] = [
  { queueId: "q-policy", name: "Policy inquiries", inQueue: 3, longestWait: "0:47" },
  { queueId: "q-claims", name: "Claims", inQueue: 4, longestWait: "1:34" },
  { queueId: "q-billing", name: "Billing", inQueue: 0, longestWait: "—" },
];

const MOCK_HISTORY: ContactHistoryEntry[] = [
  {
    contactId: "c-1782",
    channel: "Voice",
    startedAt: "2026-05-22 14:22",
    durationSeconds: 287,
    outcome: "Resolved · Claim status",
  },
  {
    contactId: "c-1641",
    channel: "Chat",
    startedAt: "2026-05-20 10:08",
    durationSeconds: 412,
    outcome: "Policy change submitted",
  },
  {
    contactId: "c-1518",
    channel: "Voice",
    startedAt: "2026-05-17 17:55",
    durationSeconds: 156,
    outcome: "Premium payment",
  },
];

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
  const [agentEmail, setAgentEmail] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<AgentStateInfo | null>(null);
  const [availableStates, setAvailableStates] = useState<AgentStateInfo[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [contactAttributes, setContactAttributes] = useState<
    Record<string, string>
  >({});
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [quickConnects, setQuickConnects] = useState<QuickConnectEntry[]>([]);
  const [quickConnectsLoading, setQuickConnectsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [sentiment, setSentiment] = useState<
    { score: number; label: "positive" | "neutral" | "negative" } | null
  >(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatSessionRef = useRef<any | null>(null);
  const currentContactRef = useRef<connect.Contact | null>(null);

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
      // The streams Agent has a getConfiguration() that includes the username (login).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cfg = (agent as any).getConfiguration?.();
      if (cfg?.username) setAgentEmail(cfg.username);
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
      currentContactRef.current = c;

      const seedAttributes = () => setContactAttributes(readContactAttributes(c));
      const update = (acceptedAt?: number | null) => {
        setContact((prev) =>
          snapshotContact(
            c,
            acceptedAt !== undefined ? acceptedAt : prev?.acceptedAt ?? null
          )
        );
        const conn = c.getAgentConnection();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyConn = conn as any;
        if (anyConn && typeof anyConn.isOnHold === "function") {
          try {
            setIsOnHold(Boolean(anyConn.isOnHold()));
          } catch {
            /* noop */
          }
        }
      };

      seedAttributes();
      update();

      c.onIncoming(() => update());
      c.onConnecting(() => update());
      c.onAccepted(() => {
        seedAttributes();
        update(Date.now());
        if (c.getType() === "chat") {
          attachChatSession(c);
        }
      });
      c.onConnected(() => {
        seedAttributes();
        update(Date.now());
        if (c.getType() === "chat") {
          attachChatSession(c);
        }
      });
      c.onEnded(() => {
        teardownChat();
        setContact(null);
        setContactAttributes({});
        setIsMuted(false);
        setIsOnHold(false);
        setSentiment(null);
      });
      c.onDestroy(() => {
        teardownChat();
        setContact(null);
        setContactAttributes({});
        setIsMuted(false);
        setIsOnHold(false);
        setSentiment(null);
      });
    });
  }, [instanceUrl, region]);

  const attachChatSession = useCallback(async (c: connect.Contact) => {
    try {
      const session = await getChatSession(c);
      chatSessionRef.current = session;

      // Seed transcript if available
      try {
        const transcript = await session.getTranscript({ maxResults: 100 });
        const items = transcript?.data?.Transcript ?? transcript?.Transcript ?? [];
        const seeded: ChatMessage[] = items.map(
          (m: Record<string, unknown>, idx: number) => ({
            id: String(m.Id ?? `seed-${idx}`),
            from: mapRole(String(m.ParticipantRole ?? "")),
            participantRole: String(m.ParticipantRole ?? ""),
            content: String(m.Content ?? ""),
            contentType: String(m.ContentType ?? "text/plain"),
            timestamp: Date.parse(String(m.AbsoluteTime ?? "")) || Date.now(),
          })
        );
        setChatMessages(seeded);
      } catch (err) {
        console.warn("Failed to load chat transcript", err);
      }

      session.onMessage((event: { data?: Record<string, unknown> }) => {
        const d = event?.data ?? {};
        // Only treat MESSAGE content as chat messages; ignore typing/events here.
        if (String(d.Type ?? "MESSAGE") !== "MESSAGE") return;
        const msg: ChatMessage = {
          id: String(d.Id ?? `${Date.now()}-${Math.random()}`),
          from: mapRole(String(d.ParticipantRole ?? "")),
          participantRole: String(d.ParticipantRole ?? ""),
          content: String(d.Content ?? ""),
          contentType: String(d.ContentType ?? "text/plain"),
          timestamp:
            Date.parse(String(d.AbsoluteTime ?? "")) || Date.now(),
        };
        setChatMessages((prev) => [...prev, msg]);
      });
    } catch (err) {
      console.warn("Could not attach chat session", err);
    }
  }, []);

  const teardownChat = useCallback(() => {
    chatSessionRef.current = null;
    setChatMessages([]);
  }, []);

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

  useEffect(() => {
    if (status === "ready") {
      refreshQuickConnects();
    }
  }, [status, refreshQuickConnects]);

  // Lightweight simulated sentiment while no Contact Lens backend is wired —
  // it sways gently around neutral so the UI feels alive during a contact.
  useEffect(() => {
    if (!contact || contact.state !== "connected") {
      setSentiment(null);
      return;
    }
    let score = 0.6;
    setSentiment({ score, label: "positive" });
    const id = window.setInterval(() => {
      score = Math.max(0, Math.min(1, score + (Math.random() - 0.5) * 0.15));
      const label: "positive" | "neutral" | "negative" =
        score > 0.6 ? "positive" : score < 0.4 ? "negative" : "neutral";
      setSentiment({ score, label });
    }, 4000);
    return () => window.clearInterval(id);
  }, [contact]);

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
  const sendChat = useCallback(async (text: string) => {
    if (!chatSessionRef.current || !text.trim()) return;
    // Optimistically append the agent message; the streams onMessage callback
    // will also fire with the persisted version, so we dedupe by content+ts.
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      from: "agent",
      participantRole: "AGENT",
      content: text,
      contentType: "text/plain",
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, optimistic]);
    try {
      await sendChatMessageRaw(chatSessionRef.current, text);
    } catch (err) {
      console.warn("Failed to send chat message", err);
    }
  }, []);
  const notifyTyping = useCallback(() => {
    if (chatSessionRef.current) sendTypingEvent(chatSessionRef.current);
  }, []);
  const transfer = useCallback(async (entry: QuickConnectEntry) => {
    if (!currentContactRef.current) {
      throw new Error("No active contact to transfer");
    }
    await transferToEndpoint(currentContactRef.current, entry.raw);
  }, []);
  const saveNote = useCallback((contactId: string, text: string) => {
    setNotes((prev) => ({ ...prev, [contactId]: text }));
  }, []);

  const value = useMemo<ConnectContextValue>(
    () => ({
      status,
      agentName,
      agentEmail,
      agentRole: "Agent",
      currentState,
      availableStates,
      contact,
      contactAttributes,
      isMuted,
      isOnHold,
      quickConnects,
      quickConnectsLoading,
      queueMetrics: MOCK_QUEUE_METRICS,
      agentStats: MOCK_AGENT_STATS,
      contactHistory: MOCK_HISTORY,
      sentiment,
      chatMessages,
      notes,
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
      sendChat,
      notifyTyping,
      transfer,
      saveNote,
    }),
    [
      status,
      agentName,
      agentEmail,
      currentState,
      availableStates,
      contact,
      contactAttributes,
      isMuted,
      isOnHold,
      quickConnects,
      quickConnectsLoading,
      sentiment,
      chatMessages,
      notes,
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
      sendChat,
      notifyTyping,
      transfer,
      saveNote,
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

function mapRole(role: string): "agent" | "customer" | "system" {
  const r = role.toUpperCase();
  if (r === "AGENT") return "agent";
  if (r === "CUSTOMER") return "customer";
  return "system";
}

export function useConnect(): ConnectContextValue {
  const ctx = useContext(ConnectContext);
  if (!ctx) {
    throw new Error("useConnect must be used inside <ConnectProvider>");
  }
  return ctx;
}
