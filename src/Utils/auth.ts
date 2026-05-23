/**
 * Cognito auth using the official amazon-cognito-identity-js SDK with the
 * USER_SRP_AUTH (Secure Remote Password) flow. SRP is enabled by default on
 * every Cognito app client, so this works without any Cognito console
 * configuration. Tokens are persisted in localStorage so a refresh keeps the
 * user signed in until expiry.
 */
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  type CognitoUserSession,
} from "amazon-cognito-identity-js";

const REGION =
  (import.meta.env.VITE_COGNITO_REGION as string | undefined) ?? "us-east-1";
const USER_POOL_ID =
  (import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined) ??
  "us-east-1_wu6MlqiRs";
const CLIENT_ID =
  (import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined) ??
  "5mkstu44ijertt5aeqdbh9dvf8";

void REGION; // Pool already encodes region via its ID; kept for future use.

const STORAGE_KEY = "kk_admin_auth";

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});

type StoredAuth = {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  username: string;
  groups: string[];
  email?: string;
};

export type AuthSession = StoredAuth;

let cached: StoredAuth | null = null;

function load(): StoredAuth | null {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    cached = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function persist(auth: StoredAuth | null) {
  cached = auth;
  if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  else localStorage.removeItem(STORAGE_KEY);
}

export function getIdToken(): string | null {
  return load()?.idToken ?? null;
}

export function getSession(): AuthSession | null {
  return load();
}

export function isAuthenticated(): boolean {
  return !!getIdToken();
}

export class CognitoError extends Error {
  type: string;
  constructor(type: string, message: string) {
    super(message);
    this.type = type;
    this.name = "CognitoError";
  }
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json))) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

function buildSession(
  cognitoSession: CognitoUserSession,
  fallbackUsername: string
): StoredAuth {
  const idJwt = cognitoSession.getIdToken().getJwtToken();
  const accessJwt = cognitoSession.getAccessToken().getJwtToken();
  const refreshJwt = cognitoSession.getRefreshToken().getToken();
  const claims = decodeJwt(idJwt) ?? {};
  const groups = Array.isArray(claims["cognito:groups"])
    ? (claims["cognito:groups"] as string[])
    : [];
  const username =
    (claims["cognito:username"] as string | undefined) ?? fallbackUsername;
  const email = claims.email as string | undefined;
  // Cognito ID tokens carry an `exp` claim (seconds since epoch).
  const exp = typeof claims.exp === "number" ? (claims.exp as number) : 0;
  const expiresAt = exp
    ? exp * 1000
    : Date.now() + cognitoSession.getIdToken().getExpiration() * 1000;
  return {
    idToken: idJwt,
    accessToken: accessJwt,
    refreshToken: refreshJwt,
    expiresAt,
    username,
    email,
    groups,
  };
}

// New-password challenges require the *same* CognitoUser instance to call
// `completeNewPasswordChallenge`. We stash it in this module keyed by a
// short opaque token so the existing two-step API (signIn → completeNewPassword)
// can stay intact.
const pendingChallenges = new Map<string, { user: CognitoUser; username: string }>();

function makeChallengeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export type LoginResult =
  | { kind: "session"; session: AuthSession }
  | { kind: "new-password-required"; session: string; username: string };

export function signIn(
  username: string,
  password: string
): Promise<LoginResult> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });
    cognitoUser.setAuthenticationFlowType("USER_SRP_AUTH");

    const details = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    cognitoUser.authenticateUser(details, {
      onSuccess: (session) => {
        const built = buildSession(session, username);
        persist(built);
        resolve({ kind: "session", session: built });
      },
      onFailure: (err) => {
        const type = (err && (err as { code?: string }).code) ?? "AuthError";
        const message = (err && (err as Error).message) ?? String(err);
        reject(new CognitoError(type, message));
      },
      newPasswordRequired: () => {
        const id = makeChallengeId();
        pendingChallenges.set(id, { user: cognitoUser, username });
        resolve({ kind: "new-password-required", session: id, username });
      },
    });
  });
}

export function completeNewPassword(
  username: string,
  newPassword: string,
  challengeId: string
): Promise<AuthSession> {
  const entry = pendingChallenges.get(challengeId);
  if (!entry) {
    return Promise.reject(
      new CognitoError(
        "InvalidChallenge",
        "Password-change session expired — please sign in again."
      )
    );
  }
  return new Promise((resolve, reject) => {
    entry.user.completeNewPasswordChallenge(
      newPassword,
      {},
      {
        onSuccess: (session) => {
          pendingChallenges.delete(challengeId);
          const built = buildSession(session, entry.username || username);
          persist(built);
          resolve(built);
        },
        onFailure: (err) => {
          const type = (err && (err as { code?: string }).code) ?? "AuthError";
          const message = (err && (err as Error).message) ?? String(err);
          reject(new CognitoError(type, message));
        },
      }
    );
  });
}

export function signOut() {
  const current = userPool.getCurrentUser();
  if (current) current.signOut();
  persist(null);
}

export function getRoleLabel(session: AuthSession | null): string {
  if (!session) return "Guest";
  if (session.groups.includes("kk_admins_dev")) return "Admin";
  if (session.groups.includes("kk_managers_dev")) return "Manager";
  if (session.groups.includes("kk_supervisors_dev")) return "Supervisor";
  if (session.groups.includes("kk_agents_dev")) return "Agent";
  return "User";
}
