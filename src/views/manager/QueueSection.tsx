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
      subtitle="Toggle queues open or closed in real-time"
    >
      <div className="divide-y divide-slate-50">
        {queues.map(q => (
          <div key={q.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{q.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    q.open ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {q.open ? '● Open' : '○ Closed'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-4 text-[11px] text-slate-400">
                <span>🏷️ {q.name}</span>
                <span>👥 {q.agents} agents</span>
                <span>🕐 {q.hours}</span>
                <span>📈 SLA {q.slaTarget}%</span>
                {q.inQueue > 0 && (
                  <span className="font-semibold text-red-500">⚠️ {q.inQueue} waiting</span>
                )}
              </div>
            </div>
            <Toggle checked={q.open} onChange={val => onChange(q.id, val)} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
