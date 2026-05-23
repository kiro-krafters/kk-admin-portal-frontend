import { useCallback, useEffect, useState } from "react";
import {
  createRoutingProfile,
  listQueues,
  listRoutingProfiles,
  updateRoutingProfile,
  type AdminQueue,
  type CreateRoutingProfileInput,
  type MediaConcurrency,
  type QueueConfig,
  type RoutingProfile,
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

type Dialog =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; profile: RoutingProfile };

export default function RoutingProfilesAdmin() {
  const [profiles, setProfiles] = useState<RoutingProfile[]>([]);
  const [queues, setQueues] = useState<AdminQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialog, setDialog] = useState<Dialog>({ mode: "closed" });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rp, q] = await Promise.all([listRoutingProfiles(), listQueues()]);
      setProfiles(rp.routingProfiles);
      setQueues(q.queues);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const queueName = (id: string) =>
    queues.find((q) => q.QueueId === id)?.Name ?? id;

  return (
    <AdminPageShell
      title="Routing profiles"
      description="Define the channels and queues each agent handles, and the concurrency limits per channel."
      actions={
        <>
          <SecondaryButton onClick={refresh}>Refresh</SecondaryButton>
          <PrimaryButton onClick={() => setDialog({ mode: "create" })}>
            + New profile
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
              <th className="px-5 py-2 font-medium">Default outbound queue</th>
              <th className="px-5 py-2 font-medium">Channels</th>
              <th className="px-5 py-2 font-medium">Queues</th>
              <th className="px-5 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRow cols={5} />
            ) : profiles.length === 0 ? (
              <EmptyRow cols={5} label="No routing profiles yet." />
            ) : (
              profiles.map((p) => (
                <tr
                  key={p.RoutingProfileId}
                  className="border-t border-connect-border-soft hover:bg-connect-bg-soft"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-connect-text">
                      {p.Name}
                    </div>
                    {p.Description && (
                      <div className="text-[11px] text-connect-text-secondary">
                        {p.Description}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-connect-text-secondary">
                    {queueName(p.DefaultOutboundQueueId)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.MediaConcurrencies.map((m) => (
                        <span
                          key={m.Channel}
                          className="rounded-full bg-connect-blue-soft px-2 py-0.5 text-[10px] font-semibold text-connect-blue-dark"
                        >
                          {m.Channel} × {m.Concurrency}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-connect-text-secondary">
                    {p.QueueConfigs?.length ?? 0}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDialog({ mode: "edit", profile: p })}
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

      {dialog.mode !== "closed" && (
        <RoutingProfileDialog
          mode={dialog.mode}
          queues={queues}
          profile={dialog.mode === "edit" ? dialog.profile : undefined}
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

function RoutingProfileDialog({
  mode,
  queues,
  profile,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  queues: AdminQueue[];
  profile?: RoutingProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = mode === "edit" && profile;
  const [name, setName] = useState(profile?.Name ?? "");
  const [description, setDescription] = useState(profile?.Description ?? "");
  const [defaultOutboundQueueId, setDefaultOutboundQueueId] = useState(
    profile?.DefaultOutboundQueueId ?? queues[0]?.QueueId ?? ""
  );
  const [media, setMedia] = useState<MediaConcurrency[]>(
    profile?.MediaConcurrencies ?? [
      { Channel: "VOICE", Concurrency: 1 },
      { Channel: "CHAT", Concurrency: 2 },
    ]
  );
  const [queueConfigs, setQueueConfigs] = useState<QueueConfig[]>(
    profile?.QueueConfigs ??
      (queues[0]
        ? [
            {
              QueueId: queues[0].QueueId,
              Priority: 1,
              Delay: 0,
              Channel: "VOICE",
            },
          ]
        : [])
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const body: CreateRoutingProfileInput = {
        name,
        description,
        defaultOutboundQueueId,
        mediaConcurrencies: media,
        queueConfigs,
      };
      if (isEdit) {
        await updateRoutingProfile(profile!.RoutingProfileId, body);
      } else {
        await createRoutingProfile(body);
      }
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
      title={isEdit ? `Edit · ${profile!.Name}` : "Create routing profile"}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submit} disabled={busy || !name}>
            {busy ? "Saving…" : isEdit ? "Save" : "Create"}
          </PrimaryButton>
        </>
      }
    >
      <ErrorBanner error={error} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Default outbound queue">
          <select
            value={defaultOutboundQueueId}
            onChange={(e) => setDefaultOutboundQueueId(e.target.value)}
            className={inputCls}
          >
            {queues.map((q) => (
              <option key={q.QueueId} value={q.QueueId}>
                {q.Name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description" full>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Section title="Media concurrency">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-connect-text-secondary">
              <th className="py-1">Channel</th>
              <th className="py-1">Concurrency</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {media.map((m, idx) => (
              <tr key={idx} className="border-t border-connect-border-soft">
                <td className="py-2 pr-2">
                  <select
                    value={m.Channel}
                    onChange={(e) =>
                      setMedia((prev) =>
                        prev.map((x, i) =>
                          i === idx ? { ...x, Channel: e.target.value } : x
                        )
                      )
                    }
                    className={inputCls}
                  >
                    <option>VOICE</option>
                    <option>CHAT</option>
                    <option>TASK</option>
                  </select>
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={1}
                    value={m.Concurrency}
                    onChange={(e) =>
                      setMedia((prev) =>
                        prev.map((x, i) =>
                          i === idx
                            ? { ...x, Concurrency: Number(e.target.value) }
                            : x
                        )
                      )
                    }
                    className={inputCls}
                  />
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setMedia((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-xs text-connect-warning hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <SecondaryButton
          onClick={() =>
            setMedia((prev) => [...prev, { Channel: "VOICE", Concurrency: 1 }])
          }
        >
          + Add channel
        </SecondaryButton>
      </Section>

      <Section title="Queue assignments">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-connect-text-secondary">
              <th className="py-1">Queue</th>
              <th className="py-1">Channel</th>
              <th className="py-1">Priority</th>
              <th className="py-1">Delay</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {queueConfigs.map((c, idx) => (
              <tr key={idx} className="border-t border-connect-border-soft">
                <td className="py-2 pr-2">
                  <select
                    value={c.QueueId}
                    onChange={(e) =>
                      setQueueConfigs((prev) =>
                        prev.map((x, i) =>
                          i === idx ? { ...x, QueueId: e.target.value } : x
                        )
                      )
                    }
                    className={inputCls}
                  >
                    {queues.map((q) => (
                      <option key={q.QueueId} value={q.QueueId}>
                        {q.Name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-2">
                  <select
                    value={c.Channel}
                    onChange={(e) =>
                      setQueueConfigs((prev) =>
                        prev.map((x, i) =>
                          i === idx ? { ...x, Channel: e.target.value } : x
                        )
                      )
                    }
                    className={inputCls}
                  >
                    <option>VOICE</option>
                    <option>CHAT</option>
                    <option>TASK</option>
                  </select>
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={1}
                    value={c.Priority}
                    onChange={(e) =>
                      setQueueConfigs((prev) =>
                        prev.map((x, i) =>
                          i === idx
                            ? { ...x, Priority: Number(e.target.value) }
                            : x
                        )
                      )
                    }
                    className={inputCls}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={0}
                    value={c.Delay}
                    onChange={(e) =>
                      setQueueConfigs((prev) =>
                        prev.map((x, i) =>
                          i === idx
                            ? { ...x, Delay: Number(e.target.value) }
                            : x
                        )
                      )
                    }
                    className={inputCls}
                  />
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setQueueConfigs((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-xs text-connect-warning hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <SecondaryButton
          onClick={() =>
            setQueueConfigs((prev) => [
              ...prev,
              {
                QueueId: queues[0]?.QueueId ?? "",
                Priority: 1,
                Delay: 0,
                Channel: "VOICE",
              },
            ])
          }
        >
          + Add queue
        </SecondaryButton>
      </Section>
    </Modal>
  );
}

const inputCls =
  "w-full rounded-md border border-connect-border bg-white px-2.5 py-1.5 text-sm text-connect-text focus:border-connect-teal focus:outline-none focus:ring-2 focus:ring-connect-teal/20";

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-connect-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-md border border-connect-border-soft p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-connect-text-secondary">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
