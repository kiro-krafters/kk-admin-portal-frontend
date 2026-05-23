import { useCallback, useEffect, useState } from "react";
import {
  createQueue,
  listQueues,
  updateQueue,
  type AdminQueue,
  type CreateQueueInput,
  type UpdateQueueInput,
} from "../../Utils/adminApi";
import AdminPageShell, {
  Card,
  EmptyRow,
  ErrorBanner,
  LoadingRow,
  PrimaryButton,
  SecondaryButton,
} from "./AdminShell";
import Modal from "./Modal";

const HOURS_OF_OPERATION_ID = "cb7d22b7-a3b2-4164-a568-260cd5af3378";

type Dialog =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; queue: AdminQueue };

export default function QueuesAdmin() {
  const [queues, setQueues] = useState<AdminQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialog, setDialog] = useState<Dialog>({ mode: "closed" });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listQueues();
      setQueues(res.queues);
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
      title="Queues"
      description="Standard queues route contacts to agents. Each queue maps to a routing profile and an hours-of-operation schedule."
      actions={
        <>
          <SecondaryButton onClick={refresh}>Refresh</SecondaryButton>
          <PrimaryButton onClick={() => setDialog({ mode: "create" })}>
            + New queue
          </PrimaryButton>
        </>
      }
    >
      <ErrorBanner error={error} />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-connect-text-secondary">
              <th className="px-5 py-2 font-medium">Name</th>
              <th className="px-5 py-2 font-medium">Type</th>
              <th className="px-5 py-2 font-medium">Max contacts</th>
              <th className="px-5 py-2 font-medium">Status</th>
              <th className="px-5 py-2 font-medium">Queue ID</th>
              <th className="px-5 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRow cols={6} />
            ) : queues.length === 0 ? (
              <EmptyRow cols={6} label="No queues yet." />
            ) : (
              queues.map((q) => (
                <tr
                  key={q.QueueId}
                  className="border-t border-connect-border-soft hover:bg-connect-bg-soft"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-connect-text">
                      {q.Name}
                    </div>
                    {q.Description && (
                      <div className="text-[11px] text-connect-text-secondary">
                        {q.Description}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-connect-text-secondary">
                    {q.QueueType}
                  </td>
                  <td className="px-5 py-3 text-connect-text">
                    {q.MaxContacts ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        q.Status === "ENABLED"
                          ? "bg-connect-success-soft text-connect-success"
                          : "bg-connect-bg-alt text-connect-text-secondary"
                      }`}
                    >
                      {q.Status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-connect-text-secondary">
                    {q.QueueId}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDialog({ mode: "edit", queue: q })}
                      className="rounded px-2 py-1 text-xs font-medium text-connect-blue hover:bg-connect-blue-soft"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {dialog.mode === "create" && (
        <QueueDialog
          mode="create"
          onClose={() => setDialog({ mode: "closed" })}
          onSaved={() => {
            setDialog({ mode: "closed" });
            refresh();
          }}
        />
      )}
      {dialog.mode === "edit" && (
        <QueueDialog
          mode="edit"
          queue={dialog.queue}
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

function QueueDialog(
  props:
    | { mode: "create"; onClose: () => void; onSaved: () => void }
    | {
        mode: "edit";
        queue: AdminQueue;
        onClose: () => void;
        onSaved: () => void;
      }
) {
  const isEdit = props.mode === "edit";
  const initial: CreateQueueInput = isEdit
    ? {
        name: props.queue.Name,
        hoursOfOperationId: props.queue.HoursOfOperationId,
        maxContacts: props.queue.MaxContacts,
        description: props.queue.Description ?? "",
      }
    : {
        name: "",
        hoursOfOperationId: HOURS_OF_OPERATION_ID,
        maxContacts: 10,
        description: "",
      };

  const [form, setForm] = useState<CreateQueueInput>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (isEdit) {
        const patch: UpdateQueueInput = {
          name: form.name,
          hoursOfOperationId: form.hoursOfOperationId,
          maxContacts: form.maxContacts,
          description: form.description,
        };
        await updateQueue(props.queue.QueueId, patch);
      } else {
        await createQueue(form);
      }
      props.onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title={isEdit ? `Edit · ${props.queue.Name}` : "Create queue"}
      onClose={props.onClose}
      footer={
        <>
          <SecondaryButton onClick={props.onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submit} disabled={busy || !form.name}>
            {busy ? "Saving…" : isEdit ? "Save changes" : "Create queue"}
          </PrimaryButton>
        </>
      }
    >
      <ErrorBanner error={error} />
      <div className="grid gap-3">
        <Field label="Name">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Description">
          <input
            value={form.description ?? ""}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className={inputCls}
          />
        </Field>
        <Field label="Max contacts">
          <input
            type="number"
            min={1}
            value={form.maxContacts ?? 10}
            onChange={(e) =>
              setForm({ ...form, maxContacts: Number(e.target.value) })
            }
            className={inputCls}
          />
        </Field>
        <Field label="Hours of operation ID">
          <input
            value={form.hoursOfOperationId}
            onChange={(e) =>
              setForm({ ...form, hoursOfOperationId: e.target.value })
            }
            className={`${inputCls} font-mono`}
          />
        </Field>
      </div>
    </Modal>
  );
}

const inputCls =
  "w-full rounded-md border border-connect-border bg-white px-3 py-2 text-sm text-connect-text focus:border-connect-teal focus:outline-none focus:ring-2 focus:ring-connect-teal/20";

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
