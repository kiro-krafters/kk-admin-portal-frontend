import type { Queue } from '../../mock/queues';
import Toggle from '../../components/shared/Toggle';
import SectionCard from '../../components/shared/SectionCard';

interface Props {
  queues: Queue[];
  onChange: (id: string, open: boolean) => void;
}

export default function QueueSection({ queues, onChange }: Props) {
  return (
    <SectionCard
      icon="📋"
      iconVariant="blue"
      title="Queue Availability"
      subtitle="Toggle queues open or closed — calls connect:UpdateQueueHoursOfOperation on save"
    >
      <div className="divide-y divide-connect-border-soft">
        {queues.map(q => (
          <QueueRow key={q.id} queue={q} onChange={onChange} />
        ))}
      </div>
    </SectionCard>
  );
}

function QueueRow({ queue: q, onChange }: { queue: Queue; onChange: (id: string, open: boolean) => void }) {
  return (
    <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      {/* Status dot */}
      <div
        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${q.open ? 'bg-connect-success' : 'bg-connect-error'}`}
      />

      {/* Queue info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-connect-text">{q.label}</span>
          {/* Green / Red badge — updates immediately on toggle */}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${
              q.open
                ? 'bg-connect-success-soft text-connect-success'
                : 'bg-connect-error-soft text-connect-error'
            }`}
          >
            {q.open ? '● Open' : '○ Closed'}
          </span>
          {q.inQueue > 0 && (
            <span className="rounded-full bg-connect-orange-soft px-2 py-0.5 text-[10px] font-bold text-connect-warning">
              {q.inQueue} waiting
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-3 font-mono text-[11px] text-connect-text-secondary">
          <span>{q.name}</span>
          <span>·</span>
          <span>{q.agents} agents</span>
          <span>·</span>
          <span>Hours: {q.hours}</span>
          <span>·</span>
          <span>SLA {q.slaTarget}%</span>
        </div>
      </div>

      {/* Hours of operation labels */}
      <div className="hidden text-right text-[11px] text-connect-text-secondary md:block">
        <div className="font-medium">{q.open ? '24/7 hours profile' : 'Closed hours profile'}</div>
        <div className="text-connect-text-disabled">connect:UpdateQueueHoursOfOperation</div>
      </div>

      <Toggle checked={q.open} onChange={val => onChange(q.id, val)} />
    </div>
  );
}
