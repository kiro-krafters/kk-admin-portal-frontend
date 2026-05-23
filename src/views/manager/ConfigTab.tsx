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
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '📋', label: 'Active Queues', value: queues.filter(q => q.open).length, iconCls: 'bg-blue-50 text-blue-600' },
          { icon: '👥', label: 'Total Agents', value: agents.length, iconCls: 'bg-emerald-50 text-emerald-600' },
          { icon: '🔀', label: 'Routing Profiles', value: 3, iconCls: 'bg-amber-50 text-amber-600' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl ${s.iconCls}`}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
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
