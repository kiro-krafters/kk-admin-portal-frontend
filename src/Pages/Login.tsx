import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../Utils/AuthProvider";

type ChallengeState = {
  username: string;
  cognitoSession: string;
};

export default function Login() {
  const { isAuthenticated, signIn, completeChallenge } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && !challenge) return <Navigate to={from} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (challenge) {
        await completeChallenge(
          challenge.username,
          newPassword,
          challenge.cognitoSession
        );
        navigate(from, { replace: true });
        return;
      }
      const result = await signIn(username.trim(), password);
      if (result.kind === "new-password-required") {
        setChallenge({
          username: result.username,
          cognitoSession: result.session,
        });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-connect-bg-alt px-4">
      <div className="w-full max-w-md rounded-xl border border-connect-border bg-white p-8 shadow-connect-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-connect-teal-dark via-connect-teal to-connect-sky text-sm font-bold text-white">
            KK
          </div>
          <div>
            <h1 className="text-lg font-semibold text-connect-text">
              KK Contact Center
            </h1>
            <p className="text-xs text-connect-text-secondary">
              Sign in to continue
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {!challenge ? (
            <>
              <Field label="Email or username">
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-connect-border bg-white px-3 py-2 text-sm text-connect-text focus:border-connect-teal focus:outline-none focus:ring-2 focus:ring-connect-teal/20"
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-connect-border bg-white px-3 py-2 text-sm text-connect-text focus:border-connect-teal focus:outline-none focus:ring-2 focus:ring-connect-teal/20"
                />
              </Field>
            </>
          ) : (
            <>
              <p className="rounded-md bg-connect-blue-soft px-3 py-2 text-xs text-connect-blue-dark">
                Your account requires a new password before first sign-in.
              </p>
              <Field label="New password">
                <input
                  type="password"
                  required
                  autoFocus
                  autoComplete="new-password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-md border border-connect-border bg-white px-3 py-2 text-sm text-connect-text focus:border-connect-teal focus:outline-none focus:ring-2 focus:ring-connect-teal/20"
                />
              </Field>
            </>
          )}

          {error && (
            <p className="rounded-md bg-connect-warning-soft px-3 py-2 text-xs text-connect-warning">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-connect-teal px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-connect-teal-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Signing in…"
              : challenge
              ? "Set new password"
              : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-[11px] text-connect-text-secondary">
          Demo accounts: <code className="font-mono">agent1@demo.com</code>,{" "}
          <code className="font-mono">manager1@demo.com</code>,{" "}
          <code className="font-mono">admin1@demo.com</code> (pwd:{" "}
          <code className="font-mono">Demo@1234</code>)
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-connect-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}
