import { useState } from 'react';
import type { Agent } from '../../mock/agents';
import { ROUTING_PROFILES } from '../../mock/agents';
import SectionCard from '../../components/shared/SectionCard';
import AgentAvatar from '../../components/shared/AgentAvatar';

interface Props {
  agents: Agent[];
  onChange: (agentId: string, field: 'routingProfile' | 'proficiencyLevel', value: string | number) => void;
}

export default function RoutingSection({ agents, onChange }: Props) {
  return (
    <SectionCard
      icon="🔀"
      iconVariant="green"
      title="Routing Profile Assignment & Agent Proficiency"
      subtitle="Assign routing profiles and skill proficiency levels per agent"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Agent', 'Skill', 'Proficiency Level', 'Routing Profile'].map(h => (
                <th
                  key={h}
                  className="pb-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {agents.map(agent => (
              <RoutingRow key={agent.id} agent={agent} onChange={onChange} />
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function RoutingRow({
  agent,
  onChange,
}: {
  agent: Agent;
  onChange: Props['onChange'];
}) {
  const [level, setLevel] = useState(agent.proficiencyLevel);

  return (
    <tr>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <AgentAvatar initials={agent.initials} color={agent.color} size="sm" />
          <div>
            <div className="text-sm font-semibold text-slate-900">{agent.name}</div>
            <div className="text-[11px] text-slate-400">{agent.id}</div>
          </div>
        </div>
      </td>
      <td className="py-4 pr-4">
        <span className="text-xs text-slate-600">{agent.skill}</span>
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(l => (
            <button
              key={l}
              onClick={() => {
                setLevel(l);
                onChange(agent.id, 'proficiencyLevel', l);
              }}
              className={`flex h-6 w-6 items-center justify-center rounded text-[9px] font-bold transition-colors ${
                l <= level
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-300 hover:border-blue-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </td>
      <td className="py-4">
        <select
          defaultValue={agent.routingProfile}
          onChange={e => onChange(agent.id, 'routingProfile', e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
        >
          {ROUTING_PROFILES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </td>
    </tr>
  );
}
