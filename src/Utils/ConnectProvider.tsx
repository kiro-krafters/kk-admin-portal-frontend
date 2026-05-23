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
  clearCurrentContact,
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
  state: string;
  phoneNumber: string | null;
  isInbound: boolean;
  startedAt: number;
  acceptedAt: number | null;
  queueName: string | null;
  queueArn: string | null;
};

export type ConnectionStatus =
  | "missing-config"
  | "initializing"
  | "ready"
  | "error";

export type QueueMetric = {
  queueId: string;
  queueArn: string;
  name: string;
  inQueue: number; // currently assigned to THIS agent for this queue
};

export type AgentStats = {
  contactsHandled: number;
  avgHandleSeconds: number;
  openContacts: number;
  queueCount: number;
};

export type ContactHistoryEntry = {
  contactId: string;
  channel: string;
  startedAt: number;
  durationSeconds: number;
  outcome: string;
  queueName: string | null;
};

type ConnectContextValue = {
  status: ConnectionStatus;
  agentName: string | null;
  agentEmail: string | null;
  agentRole: string; // routing-profile name when available
  agentExtension: string | null;
  currentState: AgentStateInfo | null;
  availableStates: AgentStateInfo[];
  contact: ContactInfo | null;
  contactAttributes: Record<string, string>;
  isMuted: boolean;
  isOnHold: boolean;
  quickConnects: QuickConnectEntry[];
  quickConnectsLoading: boolean;
  dialableCountries: string[];
  queueMetrics: QueueMetric[];
  agentStats: AgentStats;
  contactHistory: ContactHistoryEntry[];
  /** null = Contact Lens not wired (requires server-side stream subscription). */
  sentiment: { score: number; label: "positive" | "neutral" | "negative" } | null;
  chatMessages: ChatMessage[];
  notes: Record<string, string>;
  dial: (number: string) => Promise<void>;
  dialQuickConnect: (entry: QuickConnectEntry) => Promise<void>;
  refreshQuickConnects: () => Promise<void>;
  hangUp: () => void;
  closeContact: () => void;
  changeState: (name: string) => Promise<void>;
  debugCCP: boolean;
  toggleDebugCCP: () => void;
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
  /** Full CCP URL from the backend (overrides the URL derived from instanceUrl). */
  ccpUrl?: string;
  region?: string;
  loginPopup?: boolean;
  loginPopupAutoClose?: boolean;
  softphone?: boolean;
  children: ReactNode;
  headless?: boolean;
};

function snapshotContact(
  c: connect.Contact,
  startedAt: number,
  acceptedAt: number | null
): ContactInfo {
  const conn = c.getActiveInitialConnection() ?? c.getInitialConnection();
  const endpoint = conn?.getEndpoint();
  const q = (() => {
    try {
      return c.getQueue();
    } catch {
      return undefined;
    }
  })();
  return {
    contactId: c.getContactId(),
    channel: c.getType(),
    state: c.getState().type,
    phoneNumber: endpoint?.phoneNumber ?? null,
    isInbound: c.isInbound(),
    startedAt,
    acceptedAt,
    queueName: q?.name ?? null,
    queueArn: q?.queueARN ?? null,
  };
}

export function ConnectProvider({
  instanceUrl,
  ccpUrl,
  region,
  loginPopup,
  loginPopupAutoClose,
  softphone,
  children,
  headless = true,
}: ProviderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(
    instanceUrl ? "initializing" : "missing-config"
  );
  const [agentName, setAgentName] = useState<string | null>(null);
  const [agentEmail, setAgentEmail] = useState<string | null>(null);
  const [agentRole, setAgentRole] = useState<string>("Agent");
  const [agentExtension, setAgentExtension] = useState<string | null>(null);
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
  const [dialableCountries, setDialableCountries] = useState<string[]>([]);
  const [debugCCP, setDebugCCP] = useState(false);
  const [routingQueues, setRoutingQueues] = useState<
    { queueId: string; queueArn: string; name: string }[]
  >([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [sessionHistory, setSessionHistory] = useState<ContactHistoryEntry[]>(
    []
  );
  const [sessionTotals, setSessionTotals] = useState({
    handled: 0,
    totalHandleSeconds: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatSessionRef = useRef<any | null>(null);
  const currentContactRef = useRef<connect.Contact | null>(null);
  // Prevents attachChatSession from registering duplicate onMessage handlers
  // when both onAccepted and onConnected fire for the same chat contact.
  const attachedChatContactIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!instanceUrl && !ccpUrl) return;
    try {
      initializeCCP(containerRef.current, {
        instanceUrl,
        ccpUrl,
        region,
        loginPopup,
        loginPopupAutoClose,
        softphone,
      });
    } catch (e) {
      console.error("Failed to initialize CCP", e);
      setStatus("error");
      return;
    }

    connect.agent((agent) => {
      setStatus("ready");
      setAgentName(agent.getName());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cfg = (agent as any).getConfiguration?.() as
        | connect.AgentConfiguration
        | undefined;
      if (cfg?.username) setAgentEmail(cfg.username);
      if (cfg?.extension) setAgentExtension(cfg.extension);

      try {
        const rp = agent.getRoutingProfile();
        if (rp?.name) setAgentRole(rp.name);
        if (Array.isArray(rp?.queues)) {
          setRoutingQueues(
            rp.queues
              .filter((q) => q && q.queueARN)
              .map((q) => ({
                queueId: q.queueId ?? q.queueARN,
                queueArn: q.queueARN,
                name: q.name,
              }))
          );
        }
      } catch (err) {
        console.warn("Failed to read routing profile", err);
      }

      setAvailableStates(
        agent.getAgentStates().map((s) => ({ name: s.name, type: s.type }))
      );
      const s = agent.getState();
      setCurrentState({ name: s.name, type: s.type });

      try {
        const codes = agent.getDialableCountries();
        if (Array.isArray(codes)) {
          setDialableCountries(codes.map((c) => c.toUpperCase()));
        }
      } catch (err) {
        console.warn("getDialableCountries unavailable", err);
      }

      // The SDK fires STATE_CHANGE with `{ oldState, newState }` (strings),
      // but in some versions `newState` is missing the agent's chosen state
      // name when the change was self-initiated. Always re-read getState()
      // so the UI reflects the source of truth.
      agent.onStateChange((evt) => {
        // eslint-disable-next-line no-console
        console.info("[CCP] onStateChange", evt);
        const live = agent.getState();
        setCurrentState({
          name: live?.name ?? evt.newState,
          type: live?.type ?? evt.newState,
        });
      });

      // AGENT_UPDATE fires on every snapshot change — broader net than
      // STATE_CHANGE — so use it as a redundant source of truth.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyAgent = agent as any;
      if (typeof anyAgent.onRefresh === "function") {
        anyAgent.onRefresh(() => {
          const live = agent.getState();
          if (live) setCurrentState({ name: live.name, type: live.type });
        });
      }

      agent.onMuteToggle((obj) => {
        setIsMuted(Boolean(obj.muted));
      });
    });

    connect.contact((c) => {
      currentContactRef.current = c;
      const contactArrivedAt = Date.now();
      let contactAcceptedAt: number | null = null;

      const seedAttributes = () => setContactAttributes(readContactAttributes(c));
      const update = (newAccepted?: number) => {
        if (typeof newAccepted === "number") contactAcceptedAt = newAccepted;
        setContact(snapshotContact(c, contactArrivedAt, contactAcceptedAt));
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
        if (c.getType() === "chat") attachChatSession(c);
      });
      c.onConnected(() => {
        seedAttributes();
        update(Date.now());
        if (c.getType() === "chat") attachChatSession(c);
      });

      let historyPersisted = false;
      const persistHistory = (outcome: string) => {
        if (historyPersisted) return;
        historyPersisted = true;
        const endedAt = Date.now();
        const handleSeconds = contactAcceptedAt
          ? Math.max(0, (endedAt - contactAcceptedAt) / 1000)
          : 0;
        let queueName: string | null = null;
        try {
          queueName = c.getQueue()?.name ?? null;
        } catch {
          /* noop */
        }
        // Only record contacts the agent actually engaged with (accepted).
        if (contactAcceptedAt !== null) {
          const entry: ContactHistoryEntry = {
            contactId: c.getContactId(),
            channel: c.getType(),
            startedAt: contactArrivedAt,
            durationSeconds: handleSeconds,
            outcome,
            queueName,
          };
          setSessionHistory((prev) => [entry, ...prev].slice(0, 20));
          setSessionTotals((prev) => ({
            handled: prev.handled + 1,
            totalHandleSeconds: prev.totalHandleSeconds + handleSeconds,
          }));
        }
      };

      // Call ended but contact may still be in After-Contact-Work — keep the
      // contact in state so the UI can offer a "Close contact" action. Only
      // tear down when the SDK actually destroys the contact.
      c.onEnded(() => {
        persistHistory("Ended");
        setContact(snapshotContact(c, contactArrivedAt, contactAcceptedAt));
        // Chat session ends with the call — clear it so we don't reuse.
        teardownChat();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyC = c as any;
      if (typeof anyC.onMissed === "function") {
        anyC.onMissed(() => {
          persistHistory("Missed");
          setContact(snapshotContact(c, contactArrivedAt, contactAcceptedAt));
        });
      }

      c.onDestroy(() => {
        persistHistory("Destroyed");
        currentContactRef.current = null;
        teardownChat();
        setContact(null);
        setContactAttributes({});
        setIsMuted(false);
        setIsOnHold(false);
      });
    });
  }, [instanceUrl, ccpUrl, region, loginPopup, loginPopupAutoClose, softphone]);

  const attachChatSession = useCallback(async (c: connect.Contact) => {
    const contactId = c.getContactId();
    // Both onAccepted and onConnected fire for chat; only attach once.
    if (attachedChatContactIdRef.current === contactId) return;
    attachedChatContactIdRef.current = contactId;
    try {
      const session = await getChatSession(c);
      chatSessionRef.current = session;

      try {
        const transcript = await session.getTranscript({ maxResults: 100 });
        const items =
          transcript?.data?.Transcript ?? transcript?.Transcript ?? [];
        const seeded: ChatMessage[] = items
          .filter(
            (m: Record<string, unknown>) =>
              String(m.Type ?? "MESSAGE") === "MESSAGE" &&
              String(m.Content ?? "").length > 0
          )
          .map((m: Record<string, unknown>, idx: number) => ({
            id: String(m.Id ?? `seed-${idx}`),
            from: mapRole(String(m.ParticipantRole ?? "")),
            participantRole: String(m.ParticipantRole ?? ""),
            content: String(m.Content ?? ""),
            contentType: String(m.ContentType ?? "text/plain"),
            timestamp: Date.parse(String(m.AbsoluteTime ?? "")) || Date.now(),
          }));
        setChatMessages(seeded);
      } catch (err) {
        console.warn("Failed to load chat transcript", err);
      }

      session.onMessage((event: { data?: Record<string, unknown> }) => {
        const d = event?.data ?? {};
        if (String(d.Type ?? "MESSAGE") !== "MESSAGE") return;
        const content = String(d.Content ?? "");
        if (!content) return;
        const msg: ChatMessage = {
          id: String(d.Id ?? `${Date.now()}-${Math.random()}`),
          from: mapRole(String(d.ParticipantRole ?? "")),
          participantRole: String(d.ParticipantRole ?? ""),
          content,
          contentType: String(d.ContentType ?? "text/plain"),
          timestamp: Date.parse(String(d.AbsoluteTime ?? "")) || Date.now(),
        };
        setChatMessages((prev) => {
          // Already in the list (echo of a server-side id, or duplicate handler).
          if (prev.some((m) => m.id === msg.id)) return prev;
          // Agent's own message echoes back through onMessage — replace the
          // optimistic `local-*` entry instead of appending a second bubble.
          if (msg.from === "agent") {
            const idx = prev.findIndex(
              (m) => m.id.startsWith("local-") && m.content === msg.content
            );
            if (idx !== -1) {
              const next = prev.slice();
              next[idx] = msg;
              return next;
            }
          }
          return [...prev, msg];
        });
      });
    } catch (err) {
      console.warn("Could not attach chat session", err);
    }
  }, []);

  const teardownChat = useCallback(() => {
    chatSessionRef.current = null;
    attachedChatContactIdRef.current = null;
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
    if (status === "ready") refreshQuickConnects();
  }, [status, refreshQuickConnects]);

  const dial = useCallback((number: string) => dialPhoneNumber(number), []);
  const dialQuickConnect = useCallback(
    (entry: QuickConnectEntry) => dialEndpoint(entry.raw),
    []
  );
  const hangUp = useCallback(() => hangUpCurrentContact(), []);
  const closeContact = useCallback(() => clearCurrentContact(), []);
  const changeState = useCallback(async (name: string): Promise<void> => {
    await setAgentState(name);
    // Belt-and-braces: re-read the agent's state immediately so the UI
    // updates even if the onStateChange event never lands.
    await new Promise<void>((resolve) => {
      connect.agent((agent) => {
        const live = agent.getState();
        if (live) setCurrentState({ name: live.name, type: live.type });
        resolve();
      });
    });
  }, []);
  const toggleDebugCCP = useCallback(() => setDebugCCP((v) => !v), []);
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

  // Derived: real queue metrics from routing profile + current contact.
  const queueMetrics: QueueMetric[] = useMemo(() => {
    return routingQueues.map((q) => ({
      queueId: q.queueId,
      queueArn: q.queueArn,
      name: q.name,
      inQueue: contact?.queueArn === q.queueArn ? 1 : 0,
    }));
  }, [routingQueues, contact]);

  const agentStats: AgentStats = useMemo(
    () => ({
      contactsHandled: sessionTotals.handled,
      avgHandleSeconds:
        sessionTotals.handled > 0
          ? Math.round(
              sessionTotals.totalHandleSeconds / sessionTotals.handled
            )
          : 0,
      openContacts: contact ? 1 : 0,
      queueCount: routingQueues.length,
    }),
    [sessionTotals, contact, routingQueues.length]
  );

  const value = useMemo<ConnectContextValue>(
    () => ({
      status,
      agentName,
      agentEmail,
      agentRole,
      agentExtension,
      currentState,
      availableStates,
      contact,
      contactAttributes,
      isMuted,
      isOnHold,
      quickConnects,
      quickConnectsLoading,
      dialableCountries,
      queueMetrics,
      agentStats,
      contactHistory: sessionHistory,
      sentiment: null, // Contact Lens requires server-side stream
      chatMessages,
      notes,
      dial,
      dialQuickConnect,
      refreshQuickConnects,
      hangUp,
      closeContact,
      changeState,
      debugCCP,
      toggleDebugCCP,
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
      agentRole,
      agentExtension,
      currentState,
      availableStates,
      contact,
      contactAttributes,
      isMuted,
      isOnHold,
      quickConnects,
      quickConnectsLoading,
      dialableCountries,
      queueMetrics,
      agentStats,
      sessionHistory,
      chatMessages,
      notes,
      dial,
      dialQuickConnect,
      refreshQuickConnects,
      hangUp,
      closeContact,
      changeState,
      debugCCP,
      toggleDebugCCP,
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
        aria-hidden={!debugCCP}
        style={
          debugCCP
            ? {
                position: "fixed",
                right: 24,
                bottom: 24,
                width: 400,
                height: 600,
                border: "2px solid #2563EB",
                borderRadius: 8,
                boxShadow: "0 16px 48px rgba(15,27,45,0.25)",
                background: "#fff",
                zIndex: 100,
              }
            : headless
            ? {
                position: "fixed",
                right: 0,
                bottom: 0,
                width: 280,
                height: 200,
                opacity: 0,
                pointerEvents: "none",
                zIndex: -1,
              }
            : { width: 400, height: 600 }
        }
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
