import type { FlaggedContact } from '../../mock/contactLens';
import { MOCK_SENTIMENT, MOCK_FLAGGED_CONTACTS } from '../../mock/contactLens';

const SENTIMENT_COLOR: Record<string, string> = {
  positive: 'text-emerald-600',
  neutral: 'text-slate-500',
  negative: 'text-red-500',
};

const SENTIMENT_BG: Record<string, string> = {
  positive: 'bg-emerald-50 text-emerald-700',
  neutral: 'bg-slate-100 text-slate-500',
  negative: 'bg-red-50 text-red-600',
};

export default function ContactLensTab() {
  const s = MOCK_SENTIMENT;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
        {[
          { label: 'Avg Sentiment', value: `${s.avgSentiment}%`, sub: 'Positive tone', color: 'text-emerald-600' },
          { label: 'Interruptions', value: s.interruptions, sub: 'Low risk', color: 'text-amber-500' },
          { label: 'Non-Talk Time', value: `${s.nonTalkTime}%`, sub: 'Acceptable range', color: 'text-slate-700' },
          { label: 'Issues Flagged', value: s.issuesFlagged, sub: 'Needs review', color: 'text-red-500' },
        ].map(card => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">{card.label}</div>
            <div className={`text-3xl font-extrabold ${card.color}`}>{card.value}</div>
            <div className="mt-1 text-xs text-slate-400">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Sentiment Distribution + Flagged contacts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Distribution chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-slate-900">📊 Sentiment Distribution</h3>
          <div className="mb-6 flex h-4 overflow-hidden rounded-full">
            <div className="bg-emerald-400" style={{ width: `${s.positive}%` }} />
            <div className="bg-slate-300" style={{ width: `${s.neutral}%` }} />
            <div className="bg-red-400" style={{ width: `${s.negative}%` }} />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Positive', pct: s.positive, color: 'bg-emerald-400', textColor: 'text-emerald-600' },
              { label: 'Neutral', pct: s.neutral, color: 'bg-slate-300', textColor: 'text-slate-500' },
              { label: 'Negative', pct: s.negative, color: 'bg-red-400', textColor: 'text-red-500' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${row.color}`} />
                <span className="flex-1 text-xs text-slate-600">{row.label}</span>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                </div>
                <span className={`w-8 text-right text-xs font-bold ${row.textColor}`}>{row.pct}%</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Evaluation Score Avg
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              72
              <span className="ml-1 text-base font-medium text-slate-400">/ 100</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-500" style={{ width: '72%' }} />
            </div>
          </div>
        </div>

        {/* Flagged contacts */}
        <div className="col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-bold text-slate-900">🚩 Flagged Contacts</h3>
            <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200">
              📄 View All Transcripts
            </button>
          </div>
          <div className="divide-y divide-slate-50">
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
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
      <div
        className={`mt-0.5 flex-shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${
          SENTIMENT_BG[contact.sentiment]
        }`}
      >
        {contact.sentiment}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{contact.customer}</span>
          <span className="font-mono text-[10px] text-slate-400">{contact.id}</span>
        </div>
        <div className="mt-0.5 text-xs text-slate-500">
          Agent: {contact.agentName} · {contact.queue} · {contact.time} · {contact.duration}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5">
          <span className="text-amber-500">⚠</span>
          <span className="text-xs font-medium text-amber-700">{contact.flag}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <div
            className={`text-sm font-bold ${
              contact.evaluationScore >= 80
                ? 'text-emerald-600'
                : contact.evaluationScore >= 65
                ? 'text-amber-500'
                : 'text-red-500'
            }`}
          >
            {contact.evaluationScore}
          </div>
          <div className="text-[10px] text-slate-400">Eval Score</div>
        </div>
        <button
          className="rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
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
