import { useCallback, useEffect, useState } from "react";
import { listContactFlows, type ContactFlow } from "../../Utils/adminApi";
import AdminPageShell, {
  Card,
  EmptyRow,
  ErrorBanner,
  LoadingRow,
  SecondaryButton,
} from "./AdminShell";

export default function ContactFlowsAdmin() {
  const [flows, setFlows] = useState<ContactFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listContactFlows();
      setFlows(res.contactFlows);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AdminPageShell
      title="Contact flows"
      description="Read-only list of contact flows configured in Amazon Connect. Editing requires the Connect admin console."
      actions={<SecondaryButton onClick={refresh}>Refresh</SecondaryButton>}
    >
      <ErrorBanner error={error} />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-connect-text-secondary">
              <th className="px-5 py-2 font-medium">Name</th>
              <th className="px-5 py-2 font-medium">Type</th>
              <th className="px-5 py-2 font-medium">State</th>
              <th className="px-5 py-2 font-medium">Flow ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRow cols={4} />
            ) : flows.length === 0 ? (
              <EmptyRow cols={4} label="No contact flows found." />
            ) : (
              flows.map((f) => (
                <tr
                  key={f.Id}
                  className="border-t border-connect-border-soft hover:bg-connect-bg-soft"
                >
                  <td className="px-5 py-3 font-medium text-connect-text">
                    {f.Name}
                  </td>
                  <td className="px-5 py-3 text-xs text-connect-text-secondary">
                    {f.Type}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        f.State === "ACTIVE"
                          ? "bg-connect-success-soft text-connect-success"
                          : "bg-connect-bg-alt text-connect-text-secondary"
                      }`}
                    >
                      {f.State}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-connect-text-secondary">
                    {f.Id}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </AdminPageShell>
  );
}
