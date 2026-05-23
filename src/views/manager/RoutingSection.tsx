import { useState } from 'react';
import type { Agent } from '../../mock/agents';
import { ROUTING_PROFILES } from '../../mock/agents';
import SectionCard from '../../components/shared/SectionCard';
import AgentAvatar from '../../components/shared/AgentAvatar';

interface Props {
  agents: Agent[];
  onChange: (agentId: string, field: 'routingProfile' | 'proficiencyLevel', value: string | number) => void;
}

const PROFICIENCY_LABEL: Record<number, string> = {
  1: 'Novice',
  2: 'Beginner',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export default function RoutingSection({ agents, onChange }: Props) {
  return (
    <SectionCard
      icon="🔀"
      iconVariant="green"
      title="Routing Profile & Agent Proficiency"
      subtitle="connect:UpdateUserRoutingProfile · connect:AssociateUserProficiencies on save"
    >
      <div className="space-y-6">
        {/* Routing Profile table */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
            Routing Profile Assignment — connect:ListUsers / connect:UpdateUserRoutingProfile
          </p>
          <div className="overflow-x-auto rounded-lg border border-connect-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-connect-border-soft bg-connect-bg-soft">
                  {['Agent', 'Current Routing Profile', 'Change Profile'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-connect-border-soft bg-connect-bg">
                {agents.map(agent => (
                  <RoutingRow key={agent.id} agent={agent} onChange={onChange} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proficiency table */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
            Agent Proficiency Levels (InsuranceClaims skill) — connect:AssociateUserProficiencies
          </p>
          <div className="overflow-x-auto rounded-lg border border-connect-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-connect-border-soft bg-connect-bg-soft">
                  {['Agent', 'Skill', 'Proficiency (1–5)'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-connect-border-soft bg-connect-bg">
                {agents.map(agent => (
                  <ProficiencyRow key={agent.id} agent={agent} onChange={onChange} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function RoutingRow({ agent, onChange }: { agent: Agent; onChange: Props['onChange'] }) {
  const [profile, setProfile] = useState(agent.routingProfile);
  const [confirmed, setConfirmed] = useState(false);

  function handleChange(val: string) {
    setProfile(val);
    onChange(agent.id, 'routingProfile', val);
    // TODO: await connect.UpdateUserRoutingProfile({ UserId: agent.id, InstanceId, RoutingProfileId: val })
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2000);
  }

  return (
    <tr className="transition-colors hover:bg-connect-bg-soft">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <AgentAvatar initials={agent.initials} color={agent.color} size="sm" />
          <div>
            <div className="text-sm font-semibold text-connect-text">{agent.name}</div>
            <div className="font-mono text-[11px] text-connect-text-secondary">{agent.id}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-connect-text-secondary">{profile}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            value={profile}
            onChange={e => handleChange(e.target.value)}
            className="rounded-md border border-connect-border bg-connect-bg px-3 py-1.5 text-xs font-semibold text-connect-text focus:border-connect-teal focus:outline-none focus:ring-2 focus:ring-connect-teal/20"
          >
            {ROUTING_PROFILES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {confirmed && (
            <span className="rounded-md bg-connect-success-soft px-2 py-1 text-[11px] font-semibold text-connect-success">
              ✓ Updated
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function ProficiencyRow({ agent, onChange }: { agent: Agent; onChange: Props['onChange'] }) {
  const [level, setLevel] = useState(agent.proficiencyLevel);

  function handleLevel(l: number) {
    setLevel(l);
    onChange(agent.id, 'proficiencyLevel', l);
    // TODO: await connect.AssociateUserProficiencies({ UserId: agent.id, InstanceId, UserProficiencies: [{ AttributeName: 'InsuranceClaims', AttributeValue: String(l), Level: l }] })
  }

  return (
    <tr className="transition-colors hover:bg-connect-bg-soft">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <AgentAvatar initials={agent.initials} color={agent.color} size="sm" />
          <div className="text-sm font-semibold text-connect-text">{agent.name}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-md bg-connect-teal-soft px-2 py-0.5 text-[11px] font-semibold text-connect-teal-dark">
          {agent.skill}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(l => (
            <label key={l} className="flex cursor-pointer flex-col items-center gap-1">
              <input
                type="radio"
                name={`prof-${agent.id}`}
                value={l}
                checked={level === l}
                onChange={() => handleLevel(l)}
                className="sr-only"
              />
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  level === l
                    ? 'bg-connect-teal text-white shadow-sm'
                    : level > l
                    ? 'bg-connect-teal/20 text-connect-teal-dark'
                    : 'border border-connect-border bg-connect-bg-soft text-connect-text-disabled hover:border-connect-teal'
                }`}
              >
                {l}
              </div>
            </label>
          ))}
          <span className="ml-1 text-xs font-medium text-connect-text-secondary">
            {PROFICIENCY_LABEL[level]}
          </span>
        </div>
      </td>
    </tr>
  );
}
