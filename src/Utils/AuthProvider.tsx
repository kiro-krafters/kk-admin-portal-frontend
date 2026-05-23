import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  completeNewPassword,
  getSession,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  type AuthSession,
  type LoginResult,
} from "./auth";

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<LoginResult>;
  completeChallenge: (
    username: string,
    newPassword: string,
    cognitoSession: string
  ) => Promise<AuthSession>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getSession());

  // If the token expires while the tab is open, drop the session so the
  // next protected render kicks the user back to /login.
  useEffect(() => {
    if (!session) return;
    const ms = session.expiresAt - Date.now();
    if (ms <= 0) {
      setSession(null);
      return;
    }
    const t = window.setTimeout(() => setSession(null), ms);
    return () => window.clearTimeout(t);
  }, [session]);

  const signIn = useCallback(async (username: string, password: string) => {
    const result = await cognitoSignIn(username, password);
    if (result.kind === "session") setSession(result.session);
    return result;
  }, []);

  const completeChallenge = useCallback(
    async (username: string, newPassword: string, cognitoSession: string) => {
      const s = await completeNewPassword(username, newPassword, cognitoSession);
      setSession(s);
      return s;
    },
    []
  );

  const signOut = useCallback(() => {
    cognitoSignOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: !!session,
      signIn,
      completeChallenge,
      signOut,
    }),
    [session, signIn, completeChallenge, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
