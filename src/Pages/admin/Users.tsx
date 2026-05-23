import { useCallback, useEffect, useMemo, useState } from "react";
import {
  changeUserGroup,
  COGNITO_GROUP_LABELS,
  COGNITO_GROUPS,
  createUser,
  deleteUser,
  listRoutingProfiles,
  listSecurityProfiles,
  listUsers,
  updateUser,
  type AdminUser,
  type CognitoGroup,
  type CreateUserInput,
  type RoutingProfile,
  type SecurityProfile,
  type UpdateUserInput,
} from "../../Utils/adminApi";
import AdminPageShell, {
  Card,
  DangerButton,
  EmptyRow,
  ErrorBanner,
  LoadingRow,
  PrimaryButton,
  SecondaryButton,
} from "./AdminShell";
import Modal from "./Modal";

type DialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; user: AdminUser }
  | { mode: "role"; user: AdminUser }
  | { mode: "delete"; user: AdminUser };

export default function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [routingProfiles, setRoutingProfiles] = useState<RoutingProfile[]>([]);
  const [securityProfiles, setSecurityProfiles] = useState<SecurityProfile[]>(
    []
  );
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, rp, sp] = await Promise.all([
        listUsers({ maxResults: 100 }),
        listRoutingProfiles(),
        listSecurityProfiles(),
      ]);
      setUsers(u.users);
      setNextToken(u.nextToken);
      setRoutingProfiles(rp.routingProfiles);
      setSecurityProfiles(sp.securityProfiles);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadMore = async () => {
    if (!nextToken) return;
    try {
      const u = await listUsers({ maxResults: 100, nextToken });
      setUsers((prev) => [...prev, ...u.users]);
      setNextToken(u.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.Username.toLowerCase().includes(q) ||
        u.Email.toLowerCase().includes(q) ||
        `${u.FirstName} ${u.LastName}`.toLowerCase().includes(q)
    );
  }, [users, search]);

  const routingProfileName = (id: string) =>
    routingProfiles.find((r) => r.RoutingProfileId === id)?.Name ?? id;

  return (
    <AdminPageShell
      title="Users"
      description="Agents, supervisors, managers, and admins synced with Amazon Connect and Cognito."
      actions={
        <>
          <SecondaryButton onClick={refresh}>Refresh</SecondaryButton>
          <PrimaryButton onClick={() => setDialog({ mode: "create" })}>
            + New user
          </PrimaryButton>
        </>
      }
    >
      <ErrorBanner error={error} />

      <Card>
        <header className="flex items-center justify-between gap-4 border-b border-connect-border px-5 py-3">
          <input
            type="search"
            placeholder="Search by name, email, username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-md border border-connect-border bg-connect-bg-soft px-3 py-1.5 text-sm focus:border-connect-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-connect-teal/20"
          />
          <span className="text-xs text-connect-text-secondary">
            {filtered.length} of {users.length}
          </span>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-connect-text-secondary">
              <th className="px-5 py-2 font-medium">User</th>
              <th className="px-5 py-2 font-medium">Email</th>
              <th className="px-5 py-2 font-medium">Role</th>
              <th className="px-5 py-2 font-medium">Routing profile</th>
              <th className="px-5 py-2 font-medium">Status</th>
              <th className="px-5 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRow cols={6} />
            ) : filtered.length === 0 ? (
              <EmptyRow cols={6} label="No users found." />
            ) : (
              filtered.map((u) => (
                <tr
                  key={u.UserId}
                  className="border-t border-connect-border-soft hover:bg-connect-bg-soft"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-connect-text">
                      {u.FirstName} {u.LastName}
                    </div>
                    <div className="font-mono text-[11px] text-connect-text-secondary">
                      {u.Username}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-connect-text">{u.Email}</td>
                  <td className="px-5 py-3">
                    <RoleBadge group={u.CognitoGroup} />
                  </td>
                  <td className="px-5 py-3 text-xs text-connect-text-secondary">
                    {routingProfileName(u.RoutingProfileId)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge enabled={u.Enabled} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDialog({ mode: "edit", user: u })}
                        className="rounded px-2 py-1 text-xs font-medium text-connect-blue hover:bg-connect-blue-soft"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDialog({ mode: "role", user: u })}
                        className="rounded px-2 py-1 text-xs font-medium text-connect-teal-dark hover:bg-connect-teal-soft"
                      >
                        Role
                      </button>
                      <button
                        type="button"
                        onClick={() => setDialog({ mode: "delete", user: u })}
                        className="rounded px-2 py-1 text-xs font-medium text-connect-warning hover:bg-connect-warning-soft"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {nextToken && (
          <div className="border-t border-connect-border px-5 py-3 text-center">
            <SecondaryButton onClick={loadMore}>Load more</SecondaryButton>
          </div>
        )}
      </Card>

      {dialog.mode === "create" && (
        <CreateUserDialog
          routingProfiles={routingProfiles}
          securityProfiles={securityProfiles}
          onClose={() => setDialog({ mode: "closed" })}
          onSaved={() => {
            setDialog({ mode: "closed" });
            refresh();
          }}
        />
      )}
      {dialog.mode === "edit" && (
        <EditUserDialog
          user={dialog.user}
          routingProfiles={routingProfiles}
          onClose={() => setDialog({ mode: "closed" })}
          onSaved={() => {
            setDialog({ mode: "closed" });
            refresh();
          }}
        />
      )}
      {dialog.mode === "role" && (
        <ChangeRoleDialog
          user={dialog.user}
          onClose={() => setDialog({ mode: "closed" })}
          onSaved={() => {
            setDialog({ mode: "closed" });
            refresh();
          }}
        />
      )}
      {dialog.mode === "delete" && (
        <DeleteUserDialog
          user={dialog.user}
          onClose={() => setDialog({ mode: "closed" })}
          onSaved={() => {
            setDialog({ mode: "closed" });
            refresh();
          }}
        />
      )}
    </AdminPageShell>
  );
}

function RoleBadge({ group }: { group: string }) {
  const label = COGNITO_GROUP_LABELS[group] ?? group;
  const tone =
    group === "kk_admins_dev"
      ? "bg-connect-purple-soft text-connect-purple"
      : group === "kk_managers_dev"
      ? "bg-connect-blue-soft text-connect-blue-dark"
      : group === "kk_supervisors_dev"
      ? "bg-connect-teal-soft text-connect-teal-dark"
      : "bg-connect-bg-alt text-connect-text-secondary";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
      {label}
    </span>
  );
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        enabled
          ? "bg-connect-success-soft text-connect-success"
          : "bg-connect-bg-alt text-connect-text-secondary"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          enabled ? "bg-connect-success" : "bg-connect-text-secondary"
        }`}
      />
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

/* ----------------- Create User ----------------- */

function CreateUserDialog({
  routingProfiles,
  securityProfiles,
  onClose,
  onSaved,
}: {
  routingProfiles: RoutingProfile[];
  securityProfiles: SecurityProfile[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CreateUserInput>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    routingProfileId: routingProfiles[0]?.RoutingProfileId ?? "",
    securityProfileId: securityProfiles[0]?.Id ?? "",
    cognitoGroup: "kk_agents_dev",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await createUser({
        ...form,
        phoneNumber: form.phoneNumber || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title="Create user"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submit} disabled={busy}>
            {busy ? "Creating…" : "Create user"}
          </PrimaryButton>
        </>
      }
    >
      <ErrorBanner error={error} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Username">
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="First name">
          <input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="Last name">
          <input
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="Phone (E.164)">
          <input
            placeholder="+12125550100"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="Temporary password">
          <input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="Role / Cognito group">
          <select
            value={form.cognitoGroup}
            onChange={(e) =>
              setForm({
                ...form,
                cognitoGroup: e.target.value as CognitoGroup,
              })
            }
            className={inputCls}
          >
            {COGNITO_GROUPS.map((g) => (
              <option key={g} value={g}>
                {COGNITO_GROUP_LABELS[g]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Routing profile">
          <select
            value={form.routingProfileId}
            onChange={(e) =>
              setForm({ ...form, routingProfileId: e.target.value })
            }
            className={inputCls}
          >
            {routingProfiles.map((r) => (
              <option key={r.RoutingProfileId} value={r.RoutingProfileId}>
                {r.Name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Security profile">
          <select
            value={form.securityProfileId}
            onChange={(e) =>
              setForm({ ...form, securityProfileId: e.target.value })
            }
            className={inputCls}
          >
            {securityProfiles.map((s) => (
              <option key={s.Id} value={s.Id}>
                {s.Name}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </Modal>
  );
}

/* ----------------- Edit User ----------------- */

function EditUserDialog({
  user,
  routingProfiles,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  routingProfiles: RoutingProfile[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<UpdateUserInput>({
    firstName: user.FirstName,
    lastName: user.LastName,
    email: user.Email,
    phoneNumber: user.PhoneNumber ?? "",
    routingProfileId: user.RoutingProfileId,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateUser(user.UserId, form);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title={`Edit · ${user.Username}`}
      onClose={onClose}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submit} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </PrimaryButton>
        </>
      }
    >
      <ErrorBanner error={error} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First name">
          <input
            value={form.firstName ?? ""}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="Last name">
          <input
            value={form.lastName ?? ""}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="Phone (E.164)">
          <input
            value={form.phoneNumber ?? ""}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className={inputCls}
          />
        </FormField>
        <FormField label="Routing profile">
          <select
            value={form.routingProfileId ?? ""}
            onChange={(e) =>
              setForm({ ...form, routingProfileId: e.target.value })
            }
            className={inputCls}
          >
            {routingProfiles.map((r) => (
              <option key={r.RoutingProfileId} value={r.RoutingProfileId}>
                {r.Name}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </Modal>
  );
}

/* ----------------- Change Role ----------------- */

function ChangeRoleDialog({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [group, setGroup] = useState<CognitoGroup>(
    (user.CognitoGroup as CognitoGroup) ?? "kk_agents_dev"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await changeUserGroup(user.UserId, {
        group,
        previousGroup: user.CognitoGroup as CognitoGroup,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title={`Change role · ${user.Username}`}
      onClose={onClose}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={submit}
            disabled={busy || group === user.CognitoGroup}
          >
            {busy ? "Saving…" : "Update role"}
          </PrimaryButton>
        </>
      }
    >
      <ErrorBanner error={error} />
      <p className="mb-3 text-xs text-connect-text-secondary">
        Current role:{" "}
        <strong>
          {COGNITO_GROUP_LABELS[user.CognitoGroup] ?? user.CognitoGroup}
        </strong>
      </p>
      <FormField label="New role">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value as CognitoGroup)}
          className={inputCls}
        >
          {COGNITO_GROUPS.map((g) => (
            <option key={g} value={g}>
              {COGNITO_GROUP_LABELS[g]}
            </option>
          ))}
        </select>
      </FormField>
    </Modal>
  );
}

/* ----------------- Delete User ----------------- */

function DeleteUserDialog({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteUser(user.UserId);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title={`Delete user · ${user.Username}`}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <DangerButton onClick={submit} disabled={busy}>
            {busy ? "Deleting…" : "Delete user"}
          </DangerButton>
        </>
      }
    >
      <ErrorBanner error={error} />
      <p className="text-sm text-connect-text">
        This will remove <strong>{user.Username}</strong> from Amazon Connect
        and disable them in Cognito. This action is irreversible.
      </p>
    </Modal>
  );
}

/* ----------------- Form primitives ----------------- */

const inputCls =
  "w-full rounded-md border border-connect-border bg-white px-3 py-2 text-sm text-connect-text focus:border-connect-teal focus:outline-none focus:ring-2 focus:ring-connect-teal/20";

function FormField({
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
