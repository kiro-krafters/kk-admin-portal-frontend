/**
 * Typed client for every Admin Portal endpoint documented in
 * API_INTEGRATION.md. All admin routes require a Cognito JWT Bearer token —
 * the token is read from the shared auth module on each call so a single
 * source of truth (`getIdToken()`) controls auth state.
 */
import { getIdToken } from "./auth";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://t8gk26tj5c.execute-api.us-east-1.amazonaws.com/dev";

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AdminApiError";
  }
}

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: string };
type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean; query?: Record<string, string | number | undefined | null> } = {}
): Promise<T> {
  const { auth = true, query, headers, ...rest } = init;

  const url = new URL(`${BASE_URL.replace(/\/$/, "")}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const h = new Headers(headers);
  if (rest.body && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getIdToken();
    if (!token) {
      throw new AdminApiError("Not authenticated", 401);
    }
    h.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), { ...rest, headers: h });
  } catch (err) {
    throw new AdminApiError(
      err instanceof Error ? err.message : "Network error",
      0
    );
  }

  let payload: ApiEnvelope<T> | undefined;
  try {
    payload = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new AdminApiError(`HTTP ${res.status} (non-JSON response)`, res.status);
  }

  if (!res.ok || !payload.success) {
    const message =
      (payload && !payload.success && payload.error) ||
      `HTTP ${res.status}`;
    throw new AdminApiError(message, res.status);
  }
  return payload.data;
}

/* ------------------------------------------------------------------ */
/* Health                                                             */
/* ------------------------------------------------------------------ */

export type HealthData = { status: string; service: string };
export function healthCheck() {
  return request<HealthData>("/health", { auth: false });
}

/* ------------------------------------------------------------------ */
/* 1. CCP Embed Config                                                */
/* ------------------------------------------------------------------ */

export type CcpConfig = {
  ccpUrl: string;
  instanceArn: string;
  instanceId?: string;
  region?: string;
  loginPopup?: boolean;
  loginPopupAutoClose?: boolean;
  softphone?: { allowFramedSoftphone?: boolean };
  features?: { contactRecording?: { allowAgentToRecord?: boolean } };
};
export function getCcpConfig() {
  return request<CcpConfig>("/admin/ccp-config");
}

/* ------------------------------------------------------------------ */
/* User Management (2-7)                                              */
/* ------------------------------------------------------------------ */

export type CognitoGroup =
  | "kk_agents_dev"
  | "kk_supervisors_dev"
  | "kk_managers_dev"
  | "kk_admins_dev";

export type AdminUser = {
  UserId: string;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  PhoneNumber?: string;
  RoutingProfileId: string;
  SecurityProfileIds: string[];
  CognitoGroup: CognitoGroup | string;
  Enabled: boolean;
  CreatedAt?: string;
};

export function listUsers(params?: { maxResults?: number; nextToken?: string }) {
  return request<{ users: AdminUser[]; nextToken: string | null }>(
    "/admin/users",
    { query: params }
  );
}

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  routingProfileId: string;
  securityProfileId: string;
  cognitoGroup: CognitoGroup;
};
export function createUser(body: CreateUserInput) {
  return request<{ userId: string; username: string }>("/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getUser(userId: string) {
  return request<AdminUser>(`/admin/users/${encodeURIComponent(userId)}`);
}

export type UpdateUserInput = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  routingProfileId: string;
}>;
export function updateUser(userId: string, body: UpdateUserInput) {
  return request<{ updated: true }>(
    `/admin/users/${encodeURIComponent(userId)}`,
    { method: "PUT", body: JSON.stringify(body) }
  );
}

export function deleteUser(userId: string) {
  return request<{ deleted: true }>(
    `/admin/users/${encodeURIComponent(userId)}`,
    { method: "DELETE" }
  );
}

export function changeUserGroup(
  userId: string,
  body: { group: CognitoGroup; previousGroup: CognitoGroup }
) {
  return request<{ updated: true }>(
    `/admin/users/${encodeURIComponent(userId)}/group`,
    { method: "PUT", body: JSON.stringify(body) }
  );
}

/* ------------------------------------------------------------------ */
/* Queue Management (8-10)                                            */
/* ------------------------------------------------------------------ */

export type AdminQueue = {
  QueueId: string;
  Name: string;
  Description?: string;
  QueueType: string;
  HoursOfOperationId: string;
  MaxContacts: number;
  Status: "ENABLED" | "DISABLED" | string;
};
export function listQueues() {
  return request<{ queues: AdminQueue[] }>("/admin/queues");
}

export type CreateQueueInput = {
  name: string;
  hoursOfOperationId: string;
  maxContacts?: number;
  description?: string;
};
export function createQueue(body: CreateQueueInput) {
  return request<{ queueId: string; name: string }>("/admin/queues", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type UpdateQueueInput = Partial<CreateQueueInput>;
export function updateQueue(queueId: string, body: UpdateQueueInput) {
  return request<{ updated: true }>(
    `/admin/queues/${encodeURIComponent(queueId)}`,
    { method: "PUT", body: JSON.stringify(body) }
  );
}

/* ------------------------------------------------------------------ */
/* Routing Profiles (11-13)                                           */
/* ------------------------------------------------------------------ */

export type MediaConcurrency = {
  Channel: "VOICE" | "CHAT" | "TASK" | string;
  Concurrency: number;
};
export type QueueConfig = {
  QueueId: string;
  Priority: number;
  Delay: number;
  Channel: "VOICE" | "CHAT" | "TASK" | string;
};
export type RoutingProfile = {
  RoutingProfileId: string;
  Name: string;
  Description?: string;
  DefaultOutboundQueueId: string;
  MediaConcurrencies: MediaConcurrency[];
  QueueConfigs?: QueueConfig[];
};
export function listRoutingProfiles() {
  return request<{ routingProfiles: RoutingProfile[] }>(
    "/admin/routing-profiles"
  );
}

export type CreateRoutingProfileInput = {
  name: string;
  description?: string;
  defaultOutboundQueueId: string;
  mediaConcurrencies: MediaConcurrency[];
  queueConfigs: QueueConfig[];
};
export function createRoutingProfile(body: CreateRoutingProfileInput) {
  return request<{ routingProfileId: string; name: string }>(
    "/admin/routing-profiles",
    { method: "POST", body: JSON.stringify(body) }
  );
}

export type UpdateRoutingProfileInput = Partial<CreateRoutingProfileInput>;
export function updateRoutingProfile(
  routingProfileId: string,
  body: UpdateRoutingProfileInput
) {
  return request<{ updated: true }>(
    `/admin/routing-profiles/${encodeURIComponent(routingProfileId)}`,
    { method: "PUT", body: JSON.stringify(body) }
  );
}

/* ------------------------------------------------------------------ */
/* Security Profiles + Contact Flows (14-15)                          */
/* ------------------------------------------------------------------ */

export type SecurityProfile = { Id: string; Name: string };
export function listSecurityProfiles() {
  return request<{ securityProfiles: SecurityProfile[] }>(
    "/admin/security-profiles"
  );
}

export type ContactFlow = {
  Id: string;
  Name: string;
  Type: string;
  State: "ACTIVE" | "ARCHIVED" | string;
};
export function listContactFlows() {
  return request<{ contactFlows: ContactFlow[] }>("/admin/contact-flows");
}

/* ------------------------------------------------------------------ */
/* Analytics (16-18)                                                  */
/* ------------------------------------------------------------------ */

export type MetricCollection = {
  Metric: { Name: string };
  Value: number;
};
export type HistoricalRow = {
  Dimensions: {
    Queue?: { Id: string; Arn: string };
    Channel?: string;
  };
  MetricInterval?: { StartTime: string; EndTime: string };
  Collections: MetricCollection[];
};
export type HistoricalResponse = {
  startTime: string;
  endTime: string;
  metricResults: HistoricalRow[];
};
export function getHistorical(params?: { startTime?: string; endTime?: string }) {
  return request<HistoricalResponse>("/admin/analytics/historical", {
    query: params,
  });
}

export type ContactSearchRow = {
  ContactId: string;
  Channel: string;
  InitiationTimestamp: string;
  DisconnectTimestamp?: string;
  AgentInfo?: { Id: string };
  QueueInfo?: { Id: string };
};
export function searchContacts(params?: {
  startTime?: string;
  endTime?: string;
  maxResults?: number;
  nextToken?: string;
}) {
  return request<{
    contacts: ContactSearchRow[];
    totalCount: number;
    nextToken: string | null;
  }>("/admin/analytics/contacts", { query: params });
}

export type AnalyticsSummary = {
  period: string;
  totalContacts: number;
  contactsHandled: number;
  contactsAbandoned: number;
  avgHandleTimeSeconds: number;
};
export function getAnalyticsSummary() {
  return request<AnalyticsSummary>("/admin/analytics/summary");
}

/* ------------------------------------------------------------------ */
/* Audit Logs (19)                                                    */
/* ------------------------------------------------------------------ */

export type AuditLog = {
  adminId: string;
  timestampAction: string;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValue: unknown;
  newValue: unknown;
  ip?: string;
};
export function listAuditLogs(params?: {
  adminId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return request<{ logs: AuditLog[]; count: number }>("/admin/audit-logs", {
    query: params,
  });
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

export const COGNITO_GROUP_LABELS: Record<string, string> = {
  kk_agents_dev: "Agent",
  kk_supervisors_dev: "Supervisor",
  kk_managers_dev: "Manager",
  kk_admins_dev: "Admin",
};

export const COGNITO_GROUPS: CognitoGroup[] = [
  "kk_agents_dev",
  "kk_supervisors_dev",
  "kk_managers_dev",
  "kk_admins_dev",
];
