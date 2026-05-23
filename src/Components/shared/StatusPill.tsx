import type { AgentStatus } from '../../mock/agents';

const CONFIG: Record<AgentStatus, { bg: string; text: string; dot: string; label: string }> = {
  available: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Available' },
  busy:      { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-500',     label: 'On Contact' },
  break:     { bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400',   label: 'Break'      },
  offline:   { bg: 'bg-slate-100',  text: 'text-slate-400',   dot: 'bg-slate-400',   label: 'Offline'    },
};

export default function StatusPill({ status }: { status: AgentStatus }) {
  const c = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
