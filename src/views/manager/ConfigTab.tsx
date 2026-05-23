import QueueSection from './QueueSection';
import RoutingSection from './RoutingSection';
import LexBotSection from './LexBotSection';
import ContactLensSettings from './ContactLensSettings';
import type { Queue } from '../../mock/queues';
import type { Agent } from '../../mock/agents';
import type { ContactLensSetting } from '../../mock/contactLens';

interface Props {
  queues: Queue[];
  agents: Agent[];
  clSettings: ContactLensSetting[];
  onQueueChange: (id: string, open: boolean) => void;
  onAgentChange: (agentId: string, field: 'routingProfile' | 'proficiencyLevel', value: string | number) => void;
  onCLChange: (id: string, enabled: boolean) => void;
}

export default function ConfigTab({ queues, agents, clSettings, onQueueChange, onAgentChange, onCLChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Queues', value: queues.filter(q => q.open).length, total: queues.length, iconBg: 'bg-connect-teal-soft', iconText: 'text-connect-teal-dark', icon: '📋' },
          { label: 'Closed Queues', value: queues.filter(q => !q.open).length, total: queues.length, iconBg: 'bg-connect-error-soft', iconText: 'text-connect-error', icon: '🔒' },
          { label: 'Total Agents', value: agents.length, total: null, iconBg: 'bg-connect-success-soft', iconText: 'text-connect-success', icon: '👥' },
          { label: 'Routing Profiles', value: 3, total: null, iconBg: 'bg-connect-warning-soft', iconText: 'text-connect-warning', icon: '🔀' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-connect-border bg-connect-bg p-4 shadow-connect-card">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg ${s.iconBg} ${s.iconText}`}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-semibold text-connect-text">
                {s.value}
                {s.total !== null && <span className="ml-1 text-sm font-medium text-connect-text-secondary">/ {s.total}</span>}
              </div>
              <div className="text-xs text-connect-text-secondary">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <QueueSection queues={queues} onChange={onQueueChange} />
      <RoutingSection agents={agents} onChange={onAgentChange} />
      <LexBotSection />
      <ContactLensSettings settings={clSettings} onChange={onCLChange} />
    </div>
  );
}
