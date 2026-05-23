import "amazon-connect-streams";

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

export function dialPhoneNumber(rawNumber: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const number = rawNumber.replace(/\s|-/g, "");
    if (!number) {
      reject(new Error("Phone number is empty"));
      return;
    }
    connect.agent((agent) => {
      const endpoint = connect.Endpoint.byPhoneNumber(number);
      agent.connect(endpoint, {
        success: () => resolve(),
        failure: (err) => reject(new Error(String(err))),
      });
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

export function setAgentState(stateName: string): void {
  connect.agent((agent) => {
    const target = agent
      .getAgentStates()
      .find((s) => s.name.toLowerCase() === stateName.toLowerCase());
    if (target) agent.setState(target);
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
