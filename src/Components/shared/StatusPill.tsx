import type { AgentStatus } from '../../mock/agents';

const CONFIG: Record<AgentStatus, { bg: string; text: string; dot: string; label: string }> = {
  available: { bg: 'bg-connect-success-soft', text: 'text-connect-success', dot: 'bg-connect-success', label: 'Available'   },
  busy:      { bg: 'bg-connect-error-soft',   text: 'text-connect-error',   dot: 'bg-connect-error',   label: 'On Contact'  },
  break:     { bg: 'bg-connect-warning-soft', text: 'text-connect-warning', dot: 'bg-connect-warning', label: 'Break'        },
  offline:   { bg: 'bg-connect-bg-alt',       text: 'text-connect-text-secondary', dot: 'bg-connect-text-disabled', label: 'Offline' },
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
