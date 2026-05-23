import { useState } from 'react';
import type { Agent, AgentStatus } from '../../mock/agents';
import { MOCK_AGENTS } from '../../mock/agents';
import StatusPill from '../../components/shared/StatusPill';
import AgentAvatar from '../../components/shared/AgentAvatar';

const STATUS_FILTERS: { value: AgentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'On Contact' },
  { value: 'break', label: 'Break' },
  { value: 'offline', label: 'Offline' },
];

export default function AgentsTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');

  const filtered = MOCK_AGENTS.filter(a => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-connect-text-secondary">🔍</span>
          <input
            type="text"
            placeholder="Search agents by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-md border border-connect-border bg-connect-bg-soft py-2 pl-9 pr-4 text-sm text-connect-text placeholder:text-connect-text-disabled focus:border-connect-teal focus:bg-connect-bg focus:outline-none focus:ring-2 focus:ring-connect-teal/20"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === f.value
                  ? 'bg-connect-teal text-white shadow-sm'
                  : 'bg-connect-bg-alt text-connect-text-secondary hover:bg-connect-bg hover:text-connect-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 rounded-md border border-connect-border bg-connect-bg px-3 py-1.5 text-xs font-semibold text-connect-text-secondary shadow-connect-card hover:bg-connect-bg-alt">
          📥 Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-connect-border bg-connect-bg shadow-connect-card">
        <div className="flex items-center justify-between border-b border-connect-border-soft px-6 py-4">
          <h3 className="text-sm font-semibold text-connect-text">Agent Status Monitor</h3>
          <span className="text-xs text-connect-text-secondary">{filtered.length} agents</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-connect-border-soft bg-connect-bg-soft">
                {['Agent', 'Status', 'Active Queue', 'Duration', 'Contacts Today', 'CSAT %', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-connect-border-soft">
              {filtered.map(agent => (
                <AgentRow key={agent.id} agent={agent} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-connect-text-secondary">
                    No agents match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AgentRow({ agent }: { agent: Agent }) {
  return (
    <tr className="transition-colors hover:bg-connect-bg-soft">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <AgentAvatar initials={agent.initials} color={agent.color} />
          <div>
            <div className="text-sm font-semibold text-connect-text">{agent.name}</div>
            <div className="font-mono text-[11px] text-connect-text-secondary">{agent.id}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <StatusPill status={agent.status} />
      </td>
      <td className="px-5 py-4">
        {agent.queue !== '—' ? (
          <span className="inline-flex rounded-md bg-connect-teal-soft px-2 py-0.5 text-[11px] font-semibold text-connect-teal-dark">
            {agent.queue}
          </span>
        ) : (
          <span className="text-connect-text-disabled">—</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span className="font-mono text-xs font-semibold text-connect-text-secondary">{agent.duration}</span>
      </td>
      <td className="px-5 py-4">
        <span className="text-sm font-semibold text-connect-text">{agent.contactsToday}</span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`text-sm font-semibold ${
            agent.csat >= 95
              ? 'text-connect-success'
              : agent.csat >= 85
              ? 'text-connect-warning'
              : 'text-connect-error'
          }`}
        >
          {agent.csat}%
        </span>
      </td>
      <td className="px-5 py-4">
        <button
          className="rounded-md bg-connect-teal-soft px-3 py-1.5 text-xs font-semibold text-connect-teal-dark transition-colors hover:bg-connect-teal hover:text-white"
          onClick={() => {
            // TODO: call supervisorService.monitorAgent(agent.id) for live barge/monitor
            alert(`Monitor ${agent.name} — Connect StartContactMonitoring API will be called here.`);
          }}
        >
          Monitor
        </button>
      </td>
    </tr>
  );
}
