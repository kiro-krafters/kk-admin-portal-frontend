import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAnalyticsSummary,
  getHistorical,
  listQueues,
  searchContacts,
  type AdminQueue,
  type AnalyticsSummary,
  type ContactSearchRow,
  type HistoricalResponse,
} from "../../Utils/adminApi";
import AdminPageShell, {
  Card,
  EmptyRow,
  ErrorBanner,
  LoadingRow,
  Pagination,
  SecondaryButton,
} from "./AdminShell";

const HIST_PAGE_SIZE = 10;
const CONTACTS_PAGE_SIZE = 10;

/**
 * Backend responses sometimes come back camelCased instead of the PascalCased
 * ContactSearchRow shape we type — accept either to keep the table robust.
 */
type LooseContact = ContactSearchRow & {
  contactId?: string;
  channel?: string;
  initiationTimestamp?: string;
  disconnectTimestamp?: string;
  queueInfo?: { Id?: string; id?: string };
  agentInfo?: { Id?: string; id?: string };
};

type NormalContact = {
  id: string;
  channel: string;
  queueId: string | undefined;
  initiationTs: string | undefined;
};

function normalizeContact(raw: LooseContact, idx: number): NormalContact {
  const queueId =
    raw.QueueInfo?.Id ??
    raw.queueInfo?.Id ??
    raw.queueInfo?.id ??
    undefined;
  return {
    id: raw.ContactId ?? raw.contactId ?? `row-${idx}`,
    channel: raw.Channel ?? raw.channel ?? "—",
    queueId,
    initiationTs: raw.InitiationTimestamp ?? raw.initiationTimestamp,
  };
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400_000).toISOString();
}

/** Pick the start-of-day for a YYYY-MM-DD; clamps to epoch if invalid. */
function startOfDayIso(date: string): string {
  const t = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(t) ? new Date(t).toISOString() : isoDaysAgo(7);
}

/**
 * Pick the end-of-day for a YYYY-MM-DD, but never return a timestamp in the
 * future — the API rejects ranges that extend past "now". If the date is
 * today (or later), we return `Date.now()` instead of 23:59:59Z.
 */
function endOfDayIso(date: string): string {
  const eod = Date.parse(`${date}T23:59:59Z`);
  if (!Number.isFinite(eod)) return new Date().toISOString();
  return new Date(Math.min(eod, Date.now())).toISOString();
}

export default function AnalyticsAdmin() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [historical, setHistorical] = useState<HistoricalResponse | null>(null);
  const [contacts, setContacts] = useState<ContactSearchRow[]>([]);
  const [contactCount, setContactCount] = useState(0);
  const [queues, setQueues] = useState<AdminQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [startTime, setStartTime] = useState(() =>
    isoDaysAgo(7).slice(0, 10)
  );
  const [endTime, setEndTime] = useState(() => isoDaysAgo(0).slice(0, 10));
  const [histPage, setHistPage] = useState(1);
  const [contactsPage, setContactsPage] = useState(1);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const start = startOfDayIso(startTime);
      const end = endOfDayIso(endTime);
      const [s, h, c, q] = await Promise.all([
        getAnalyticsSummary(),
        getHistorical({ startTime: start, endTime: end }),
        searchContacts({ startTime: start, endTime: end, maxResults: 50 }),
        listQueues(),
      ]);
      setSummary(s);
      setHistorical(h);
      setContacts(c.contacts);
      setContactCount(c.totalCount);
      setQueues(q.queues);
      setHistPage(1);
      setContactsPage(1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const queueName = (id?: string) =>
    queues.find((q) => q.QueueId === id)?.Name ?? id ?? "—";

  const histRows = historical?.metricResults ?? [];
  const histTotal = histRows.length;
  const pagedHistRows = useMemo(
    () =>
      histRows.slice(
        (histPage - 1) * HIST_PAGE_SIZE,
        histPage * HIST_PAGE_SIZE
      ),
    [histRows, histPage]
  );

  const normalContacts = useMemo<NormalContact[]>(
    () => (contacts as LooseContact[]).map(normalizeContact),
    [contacts]
  );
  const contactsTotal = Math.max(contactCount, normalContacts.length);
  const pagedContacts = useMemo(
    () =>
      normalContacts.slice(
        (contactsPage - 1) * CONTACTS_PAGE_SIZE,
        contactsPage * CONTACTS_PAGE_SIZE
      ),
    [normalContacts, contactsPage]
  );

  return (
    <AdminPageShell
      title="Analytics & insights"
      description="Historical metrics, contact search, and a 24h rolling summary across the contact center."
      actions={
        <>
          <input
            type="date"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded-md border border-connect-border bg-white px-2 py-1 text-xs"
          />
          <span className="text-xs text-connect-text-secondary">→</span>
          <input
            type="date"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded-md border border-connect-border bg-white px-2 py-1 text-xs"
          />
          <SecondaryButton onClick={refresh}>Refresh</SecondaryButton>
        </>
      }
    >
      <ErrorBanner error={error} />

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total contacts (24h)"
          value={summary?.totalContacts ?? "—"}
        />
        <SummaryCard
          label="Handled"
          value={summary?.contactsHandled ?? "—"}
          tone="success"
        />
        <SummaryCard
          label="Abandoned"
          value={summary?.contactsAbandoned ?? "—"}
          tone="warning"
        />
        <SummaryCard
          label="Avg handle time"
          value={
            summary
              ? `${Math.round(summary.avgHandleTimeSeconds)}s`
              : "—"
          }
          tone="blue"
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <header className="border-b border-connect-border px-5 py-3">
            <h2 className="text-sm font-semibold text-connect-text">
              Historical metrics by queue
            </h2>
            <p className="text-xs text-connect-text-secondary">
              {startTime} → {endTime}
            </p>
          </header>
          <Pagination
            total={histTotal}
            pageSize={HIST_PAGE_SIZE}
            page={histPage}
            onPageChange={setHistPage}
            label="queues"
          />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-connect-text-secondary">
                <th className="px-5 py-2 font-medium">Queue</th>
                <th className="px-5 py-2 font-medium">Channel</th>
                <th className="px-5 py-2 font-medium">Handled</th>
                <th className="px-5 py-2 font-medium">Abandoned</th>
                <th className="px-5 py-2 font-medium">AHT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRow cols={5} />
              ) : pagedHistRows.length === 0 ? (
                <EmptyRow cols={5} label="No metrics for this period." />
              ) : (
                pagedHistRows.map((row, idx) => {
                  const m = (name: string) =>
                    row.Collections.find((c) => c.Metric.Name === name)
                      ?.Value ?? 0;
                  return (
                    <tr
                      key={`${row.Dimensions.Queue?.Id ?? "q"}-${
                        row.Dimensions.Channel ?? "c"
                      }-${idx}`}
                      className="border-t border-connect-border-soft"
                    >
                      <td className="px-5 py-3 text-xs">
                        {queueName(row.Dimensions.Queue?.Id)}
                      </td>
                      <td className="px-5 py-3 text-xs text-connect-text-secondary">
                        {row.Dimensions.Channel ?? "—"}
                      </td>
                      <td className="px-5 py-3 font-semibold text-connect-text">
                        {m("CONTACTS_HANDLED")}
                      </td>
                      <td className="px-5 py-3 text-connect-warning">
                        {m("CONTACTS_ABANDONED")}
                      </td>
                      <td className="px-5 py-3 text-connect-text">
                        {Math.round(m("AVG_HANDLE_TIME"))}s
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>

        <Card>
          <header className="flex items-center justify-between border-b border-connect-border px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold text-connect-text">
                Recent contacts
              </h2>
              <p className="text-xs text-connect-text-secondary">
                Fetched {normalContacts.length} of {contactCount}
              </p>
            </div>
          </header>
          <Pagination
            total={contactsTotal}
            pageSize={CONTACTS_PAGE_SIZE}
            page={contactsPage}
            onPageChange={setContactsPage}
            label="contacts"
          />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-connect-text-secondary">
                <th className="px-5 py-2 font-medium">Contact</th>
                <th className="px-5 py-2 font-medium">Channel</th>
                <th className="px-5 py-2 font-medium">Queue</th>
                <th className="px-5 py-2 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRow cols={4} />
              ) : pagedContacts.length === 0 ? (
                <EmptyRow cols={4} label="No contacts in this window." />
              ) : (
                pagedContacts.map((c, idx) => {
                  const initiated = c.initiationTs
                    ? new Date(c.initiationTs)
                    : null;
                  return (
                    <tr
                      key={c.id || `contact-${idx}`}
                      className="border-t border-connect-border-soft hover:bg-connect-bg-soft"
                    >
                      <td
                        className="px-5 py-3 font-mono text-[11px] text-connect-text-secondary"
                        title={c.id}
                      >
                        {c.id ? `${c.id.slice(0, 8)}…` : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <span className="rounded-full bg-connect-blue-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-connect-blue-dark">
                          {c.channel}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {queueName(c.queueId)}
                      </td>
                      <td className="px-5 py-3 text-xs text-connect-text-secondary">
                        {initiated && !Number.isNaN(initiated.getTime())
                          ? initiated.toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminPageShell>
  );
}

function SummaryCard({
  label,
  value,
  tone = "teal",
}: {
  label: string;
  value: number | string;
  tone?: "teal" | "success" | "warning" | "blue";
}) {
  const map = {
    teal: "text-connect-teal-dark",
    success: "text-connect-success",
    warning: "text-connect-warning",
    blue: "text-connect-blue-dark",
  } as const;
  return (
    <article className="rounded-xl border border-connect-border bg-white p-4 shadow-connect-card">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${map[tone]}`}>{value}</p>
    </article>
  );
}
