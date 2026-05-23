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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search agents by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
          📥 Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-900">👥 Agent Status Monitor</h3>
          <span className="text-xs text-slate-400">{filtered.length} agents</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Agent', 'Status', 'Active Queue', 'Duration', 'Contacts Today', 'CSAT %', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(agent => (
                <AgentRow key={agent.id} agent={agent} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
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
    <tr className="group hover:bg-slate-50/60 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <AgentAvatar initials={agent.initials} color={agent.color} />
          <div>
            <div className="text-sm font-semibold text-slate-900">{agent.name}</div>
            <div className="text-[11px] text-slate-400">{agent.id}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <StatusPill status={agent.status} />
      </td>
      <td className="px-5 py-4">
        {agent.queue !== '—' ? (
          <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
            {agent.queue}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span className="font-mono text-xs font-semibold text-slate-500">{agent.duration}</span>
      </td>
      <td className="px-5 py-4">
        <span className="text-sm font-bold text-slate-800">{agent.contactsToday}</span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`text-sm font-bold ${
            agent.csat >= 95
              ? 'text-emerald-600'
              : agent.csat >= 85
              ? 'text-amber-500'
              : 'text-red-500'
          }`}
        >
          {agent.csat}%
        </span>
      </td>
      <td className="px-5 py-4">
        <button
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
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
