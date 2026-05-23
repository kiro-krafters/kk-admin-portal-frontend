import type { FlaggedContact } from '../../mock/contactLens';
import { MOCK_SENTIMENT, MOCK_FLAGGED_CONTACTS } from '../../mock/contactLens';

const SENTIMENT_BG: Record<string, string> = {
  positive: 'bg-connect-success-soft text-connect-success',
  neutral:  'bg-connect-bg-alt text-connect-text-secondary',
  negative: 'bg-connect-error-soft text-connect-error',
};

const SENTIMENT_DOT: Record<string, string> = {
  positive: 'bg-connect-success',
  neutral:  'bg-connect-text-disabled',
  negative: 'bg-connect-error',
};

export default function ContactLensTab() {
  const s = MOCK_SENTIMENT;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: 'Avg Sentiment', value: `${s.avgSentiment}%`, sub: 'Positive tone', cls: 'text-connect-success' },
          { label: 'Interruptions', value: s.interruptions, sub: 'Low risk', cls: 'text-connect-warning' },
          { label: 'Non-Talk Time', value: `${s.nonTalkTime}%`, sub: 'Acceptable range', cls: 'text-connect-text' },
          { label: 'Issues Flagged', value: s.issuesFlagged, sub: 'Needs review', cls: 'text-connect-error' },
        ].map(card => (
          <article key={card.label} className="rounded-xl border border-connect-border bg-connect-bg p-5 shadow-connect-card">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">{card.label}</div>
            <div className={`text-3xl font-semibold ${card.cls}`}>{card.value}</div>
            <div className="mt-1 text-xs text-connect-text-secondary">{card.sub}</div>
          </article>
        ))}
      </div>

      {/* Sentiment Distribution + Flagged contacts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Distribution chart */}
        <div className="rounded-xl border border-connect-border bg-connect-bg p-6 shadow-connect-card">
          <h3 className="mb-4 text-sm font-semibold text-connect-text">Sentiment Distribution</h3>
          <div className="mb-6 flex h-3 overflow-hidden rounded-full">
            <div className="bg-connect-success" style={{ width: `${s.positive}%` }} />
            <div className="bg-connect-text-disabled" style={{ width: `${s.neutral}%` }} />
            <div className="bg-connect-error" style={{ width: `${s.negative}%` }} />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Positive', pct: s.positive, bar: 'bg-connect-success', txt: 'text-connect-success' },
              { label: 'Neutral',  pct: s.neutral,  bar: 'bg-connect-text-disabled', txt: 'text-connect-text-secondary' },
              { label: 'Negative', pct: s.negative, bar: 'bg-connect-error', txt: 'text-connect-error' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${row.bar}`} />
                <span className="flex-1 text-xs text-connect-text">{row.label}</span>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-connect-bg-alt">
                  <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${row.pct}%` }} />
                </div>
                <span className={`w-8 text-right text-xs font-semibold ${row.txt}`}>{row.pct}%</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-connect-border-soft pt-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
              Evaluation Score Avg
            </div>
            <div className="text-3xl font-semibold text-connect-text">
              72
              <span className="ml-1 text-base font-medium text-connect-text-secondary">/ 100</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-connect-bg-alt">
              <div className="h-full rounded-full bg-connect-teal" style={{ width: '72%' }} />
            </div>
          </div>
        </div>

        {/* Flagged contacts */}
        <div className="col-span-2 overflow-hidden rounded-xl border border-connect-border bg-connect-bg shadow-connect-card">
          <div className="flex items-center justify-between border-b border-connect-border-soft px-6 py-4">
            <h3 className="text-sm font-semibold text-connect-text">Flagged Contacts</h3>
            <button className="rounded-md bg-connect-bg-alt px-3 py-1.5 text-xs font-semibold text-connect-text-secondary hover:bg-connect-border hover:text-connect-text">
              View All Transcripts
            </button>
          </div>
          <div className="divide-y divide-connect-border-soft">
            {MOCK_FLAGGED_CONTACTS.map(contact => (
              <FlaggedContactRow key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlaggedContactRow({ contact }: { contact: FlaggedContact }) {
  return (
    <div className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-connect-bg-soft">
      <div className={`mt-0.5 flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase ${SENTIMENT_BG[contact.sentiment]}`}>
        {contact.sentiment}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-connect-text">{contact.customer}</span>
          <span className="font-mono text-[10px] text-connect-text-secondary">{contact.id}</span>
        </div>
        <div className="mt-0.5 text-xs text-connect-text-secondary">
          Agent: {contact.agentName} · {contact.queue} · {contact.time} · {contact.duration}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-connect-warning-soft px-2.5 py-1.5">
          <span className="text-connect-warning">⚠</span>
          <span className="text-xs font-medium text-connect-warning">{contact.flag}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <div
            className={`text-sm font-semibold ${
              contact.evaluationScore >= 80
                ? 'text-connect-success'
                : contact.evaluationScore >= 65
                ? 'text-connect-warning'
                : 'text-connect-error'
            }`}
          >
            {contact.evaluationScore}
          </div>
          <div className="text-[10px] text-connect-text-secondary">Eval Score</div>
        </div>
        <button
          className="rounded-md bg-connect-teal-soft px-3 py-1 text-xs font-semibold text-connect-teal-dark transition-colors hover:bg-connect-teal hover:text-white"
          onClick={() => {
            // TODO: open transcript viewer modal with Contact Lens output
            alert(`View transcript for ${contact.id} — Contact Lens S3 output will load here.`);
          }}
        >
          View Transcript
        </button>
      </div>
    </div>
  );
}
