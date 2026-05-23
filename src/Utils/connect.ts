import "amazon-connect-streams";
import "amazon-connect-chatjs";

declare global {
  interface Window {
    connect: typeof connect;
  }
}

export type ConnectInitOptions = {
  instanceUrl: string;
  region?: string;
  loginPopup?: boolean;
  softphone?: boolean;
};

let initialized = false;

export function initializeCCP(
  container: HTMLDivElement,
  {
    instanceUrl,
    region = "us-east-1",
    loginPopup = true,
    softphone = true,
  }: ConnectInitOptions
): void {
  if (initialized) return;
  initialized = true;

  connect.core.initCCP(container, {
    ccpUrl: `${instanceUrl.replace(/\/$/, "")}/connect/ccp-v2`,
    loginPopup,
    loginPopupAutoClose: true,
    loginOptions: {
      autoClose: true,
      height: 600,
      width: 400,
    },
    region,
    softphone: {
      allowFramedSoftphone: softphone,
      disableRingtone: false,
    },
    pageOptions: {
      enableAudioDeviceSettings: true,
      enablePhoneTypeSettings: true,
    },
  });
}

function findAgentState(
  agent: connect.Agent,
  name: string
): connect.AgentStateDefinition | undefined {
  return agent
    .getAgentStates()
    .find((s) => s.name.toLowerCase() === name.toLowerCase());
}

/**
 * Connect rejects outbound `agent.connect()` calls when the agent isn't in a
 * routable state. Most freshly-loaded agents land in "Offline", which is why
 * clicking Call appears to do nothing. We optimistically flip to Available
 * first when needed, then dial.
 */
export function dialPhoneNumber(rawNumber: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const number = rawNumber.replace(/\s|-/g, "");
    if (!number) {
      reject(new Error("Phone number is empty"));
      return;
    }
    if (!/^\+\d{7,15}$/.test(number)) {
      reject(
        new Error(
          `Number "${number}" is not E.164 (needs +<country><subscriber>, 7–15 digits).`
        )
      );
      return;
    }

    connect.agent((agent) => {
      const startState = agent.getState()?.name ?? "(unknown)";
      // eslint-disable-next-line no-console
      console.info("[CCP] dial attempt", { number, agentState: startState });

      const doDial = () => {
        let endpoint: connect.Endpoint;
        try {
          endpoint = connect.Endpoint.byPhoneNumber(number);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[CCP] failed to create endpoint", err);
          reject(new Error(`Invalid phone number: ${number}`));
          return;
        }
        agent.connect(endpoint, {
          success: () => {
            // eslint-disable-next-line no-console
            console.info("[CCP] dial success", { number });
            resolve();
          },
          failure: (err) => {
            // eslint-disable-next-line no-console
            console.error("[CCP] dial failure", err);
            const msg =
              typeof err === "string"
                ? err
                : err && typeof err === "object"
                ? JSON.stringify(err)
                : "Unknown failure from agent.connect";
            reject(new Error(msg));
          },
        });
      };

      // Auto-flip Offline → Available, otherwise outbound is blocked silently.
      if (startState.toLowerCase() === "offline") {
        const available = findAgentState(agent, "Available");
        if (!available) {
          reject(
            new Error(
              "Agent has no Available state in routing profile — cannot place outbound."
            )
          );
          return;
        }
        // eslint-disable-next-line no-console
        console.info("[CCP] switching state Offline → Available before dialing");
        agent.setState(available, {
          success: () => doDial(),
          failure: (err) => {
            // eslint-disable-next-line no-console
            console.error("[CCP] setState(Available) failed", err);
            reject(
              new Error(
                "Could not switch the agent to Available before dialing."
              )
            );
          },
        });
        return;
      }

      doDial();
    });
  });
}

export function hangUpCurrentContact(): void {
  connect.agent((agent) => {
    const contacts = agent.getContacts();
    contacts.forEach((c) => {
      const conn = c.getAgentConnection();
      if (conn) conn.destroy();
    });
  });
}

export function setAgentState(stateName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    connect.agent((agent) => {
      const target = agent
        .getAgentStates()
        .find((s) => s.name.toLowerCase() === stateName.toLowerCase());
      if (!target) {
        reject(
          new Error(
            `State "${stateName}" is not in the agent's routing profile.`
          )
        );
        return;
      }
      // eslint-disable-next-line no-console
      console.info("[CCP] setState", stateName);
      agent.setState(target, {
        success: () => {
          // eslint-disable-next-line no-console
          console.info("[CCP] setState success", stateName);
          resolve();
        },
        failure: (err) => {
          // eslint-disable-next-line no-console
          console.error("[CCP] setState failure", err);
          reject(new Error(typeof err === "string" ? err : String(err)));
        },
      });
    });
  });
}

export function acceptCurrentContact(): void {
  connect.agent((agent) => {
    const contact = agent.getContacts()[0];
    if (contact) contact.accept();
  });
}

export function rejectCurrentContact(): void {
  connect.agent((agent) => {
    const contact = agent.getContacts()[0];
    if (!contact) return;
    const conn = contact.getAgentConnection();
    if (conn) conn.destroy();
  });
}

export function toggleMute(currentlyMuted: boolean): void {
  connect.agent((agent) => {
    if (currentlyMuted) agent.unmute();
    else agent.mute();
  });
}

export function toggleHold(currentlyOnHold: boolean): void {
  connect.agent((agent) => {
    const contact = agent.getContacts()[0];
    if (!contact) return;
    const conn = contact.getAgentConnection();
    if (!conn) return;
    if (currentlyOnHold) conn.resume();
    else conn.hold();
  });
}

export type QuickConnectEntry = {
  endpointId: string;
  name: string;
  type: string; // 'phone_number' | 'queue' | 'agent'
  phoneNumber?: string;
  raw: connect.Endpoint;
};

export function fetchQuickConnects(): Promise<QuickConnectEntry[]> {
  return new Promise((resolve, reject) => {
    connect.agent((agent) => {
      const routingProfile = agent.getRoutingProfile();
      const queueArns = (routingProfile?.queues ?? [])
        .map((q) => q.queueARN)
        .filter(Boolean);
      if (queueArns.length === 0) {
        resolve([]);
        return;
      }
      agent.getEndpoints(queueArns, {
        success: (data) => {
          const list = (data?.endpoints ?? []).map((ep) => ({
            endpointId: ep.endpointId ?? ep.endpointARN ?? ep.name ?? "",
            name: ep.name ?? ep.phoneNumber ?? "Unknown",
            type: String(ep.type ?? "phone_number"),
            phoneNumber: ep.phoneNumber,
            raw: ep,
          }));
          resolve(list);
        },
        failure: (err) => reject(new Error(String(err))),
      });
    });
  });
}

export function dialEndpoint(endpoint: connect.Endpoint): Promise<void> {
  return new Promise((resolve, reject) => {
    connect.agent((agent) => {
      agent.connect(endpoint, {
        success: () => resolve(),
        failure: (err) => reject(new Error(String(err))),
      });
    });
  });
}

export function sendDigit(digit: string): void {
  connect.agent((agent) => {
    const contact = agent.getContacts()[0];
    if (!contact) return;
    const conn = contact.getAgentConnection();
    if (conn) conn.sendDigits(digit);
  });
}

/* ---------- Chat ---------- */

export type ChatMessage = {
  id: string;
  from: "agent" | "customer" | "system";
  participantRole?: string;
  content: string;
  contentType: string;
  timestamp: number;
};

/** Returns the chat session media controller for a chat contact. */
export async function getChatSession(contact: connect.Contact): Promise<any> {
  // The controller object is added by amazon-connect-chatjs once loaded.
  // Streams' Contact connection exposes getMediaController() at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = contact.getAgentConnection() as any;
  if (!conn?.getMediaController) {
    throw new Error("Chat media controller not available on this connection");
  }
  return await conn.getMediaController();
}

export async function sendChatMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chatSession: any,
  text: string
): Promise<void> {
  if (!text.trim()) return;
  await chatSession.sendMessage({
    message: text,
    contentType: "text/plain",
  });
}

export async function sendTypingEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chatSession: any
): Promise<void> {
  try {
    await chatSession.sendEvent({
      contentType: "application/vnd.amazonaws.connect.event.typing",
    });
  } catch {
    /* best-effort */
  }
}

/* ---------- Transfer ---------- */

export function transferToEndpoint(
  contact: connect.Contact,
  endpoint: connect.Endpoint
): Promise<void> {
  return new Promise((resolve, reject) => {
    contact.addConnection(endpoint, {
      success: () => resolve(),
      failure: (err) => reject(new Error(String(err))),
    });
  });
}

/* ---------- Contact attributes ---------- */

export function readContactAttributes(
  contact: connect.Contact
): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attrs = contact.getAttributes() as any;
  const out: Record<string, string> = {};
  if (attrs && typeof attrs === "object") {
    for (const [k, v] of Object.entries(attrs)) {
      // streams represents each attribute as { name, value }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (v as any)?.value ?? v;
      out[k] = String(value ?? "");
    }
  }
  return out;
}
