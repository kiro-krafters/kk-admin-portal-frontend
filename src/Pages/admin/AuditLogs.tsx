import { Fragment, useCallback, useEffect, useState } from "react";
import { listAuditLogs, type AuditLog } from "../../Utils/adminApi";
import AdminPageShell, {
  Card,
  EmptyRow,
  ErrorBanner,
  LoadingRow,
  PrimaryButton,
  SecondaryButton,
} from "./AdminShell";

export default function AuditLogsAdmin() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [adminId, setAdminId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(50);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let startIso: string | undefined;
      let endIso: string | undefined;
      if (startDate) {
        const t = Date.parse(`${startDate}T00:00:00Z`);
        startIso = Number.isFinite(t) ? new Date(t).toISOString() : undefined;
      }
      if (endDate) {
        const t = Date.parse(`${endDate}T23:59:59Z`);
        if (Number.isFinite(t)) {
          // Never send a future timestamp — the API rejects ranges past now.
          endIso = new Date(Math.min(t, Date.now())).toISOString();
        }
      }
      const res = await listAuditLogs({
        adminId: adminId || undefined,
        startDate: startIso,
        endDate: endIso,
        limit,
      });
      setLogs(res.logs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [adminId, startDate, endDate, limit]);

  useEffect(() => {
    refresh();
    // Only auto-refresh on first load; subsequent runs are user-triggered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminPageShell
      title="Audit logs"
      description="Every mutating admin action is recorded with the actor, resource, and before/after values."
    >
      <ErrorBanner error={error} />

      <Card>
        <header className="border-b border-connect-border px-5 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <Field label="Admin email">
              <input
                placeholder="admin1@demo.com"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Start date">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="End date">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Limit">
              <input
                type="number"
                min={1}
                max={500}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <div className="flex items-end gap-2">
              <PrimaryButton onClick={refresh}>Apply</PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  setAdminId("");
                  setStartDate("");
                  setEndDate("");
                  setLimit(50);
                }}
              >
                Reset
              </SecondaryButton>
            </div>
          </div>
        </header>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-connect-text-secondary">
              <th className="px-5 py-2 font-medium">When</th>
              <th className="px-5 py-2 font-medium">Admin</th>
              <th className="px-5 py-2 font-medium">Action</th>
              <th className="px-5 py-2 font-medium">Resource</th>
              <th className="px-5 py-2 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRow cols={5} />
            ) : logs.length === 0 ? (
              <EmptyRow cols={5} label="No audit entries match the filters." />
            ) : (
              logs.map((log) => {
                const ts = log.timestampAction.split("#")[0];
                const key = `${log.adminId}-${log.timestampAction}`;
                const open = expanded === key;
                return (
                  <Fragment key={key}>
                    <tr
                      onClick={() => setExpanded(open ? null : key)}
                      className="cursor-pointer border-t border-connect-border-soft hover:bg-connect-bg-soft"
                    >
                      <td className="px-5 py-3 text-xs text-connect-text-secondary">
                        {new Date(ts).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-xs">{log.adminId}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-connect-purple-soft px-2 py-0.5 text-[10px] font-semibold text-connect-purple">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-connect-text-secondary">
                        <span className="text-connect-text">
                          {log.resourceType}
                        </span>{" "}
                        · <code className="font-mono">{log.resourceId}</code>
                      </td>
                      <td className="px-5 py-3 text-xs text-connect-text-secondary">
                        {log.ip ?? "—"}
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-t border-connect-border-soft bg-connect-bg-soft">
                        <td colSpan={5} className="px-5 py-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Diff title="Before" value={log.oldValue} />
                            <Diff title="After" value={log.newValue} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </AdminPageShell>
  );
}

function Diff({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-connect-text-secondary">
        {title}
      </p>
      <pre className="overflow-x-auto rounded-md border border-connect-border bg-white p-2 font-mono text-[11px] text-connect-text">
        {value === null || value === undefined
          ? "—"
          : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-connect-border bg-white px-2.5 py-1.5 text-sm text-connect-text focus:border-connect-teal focus:outline-none focus:ring-2 focus:ring-connect-teal/20";

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
