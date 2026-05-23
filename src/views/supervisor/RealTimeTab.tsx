import MetricCard from '../../components/shared/MetricCard';
import { useLiveMetrics } from '../../hooks/useLiveMetrics';
import { MOCK_QUEUES } from '../../mock/queues';

function fmtSeconds(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function RealTimeTab() {
  const { metrics, lastRefresh, refresh } = useLiveMetrics();

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Auto-refresh every 30s · Last: {lastRefresh.toLocaleTimeString()}
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          🔄 Refresh Now
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <MetricCard
          variant="red"
          icon="📥"
          value={metrics.contactsInQueue}
          label="Contacts in Queue"
          trend={
            <span className="text-red-500">
              ↑ {metrics.contactsInQueue > 3 ? 'Above threshold' : 'Normal'}
            </span>
          }
        >
          <div className="mt-3 space-y-1.5">
            {MOCK_QUEUES.filter(q => q.open).map(q => {
              const pct = Math.min(100, Math.round((q.inQueue / 5) * 100));
              return (
                <div key={q.id} className="flex items-center gap-2">
                  <span className="w-20 truncate text-[10px] text-slate-400">{q.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-red-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-3 text-right text-[10px] font-semibold text-slate-500">{q.inQueue}</span>
                </div>
              );
            })}
          </div>
        </MetricCard>

        <MetricCard
          variant="green"
          icon="✅"
          value={metrics.agentsAvailable}
          label="Agents Available"
          trend={<span className="text-emerald-600">↑ {metrics.agentsAvailable} of 8 agents</span>}
        />

        <MetricCard
          variant="blue"
          icon="🎧"
          value={metrics.agentsOnContact}
          label="Agents On Contact"
          trend={<span className="text-blue-500">● {metrics.agentsOnContact} active contacts</span>}
        />

        <MetricCard
          variant="amber"
          icon="⏱️"
          value={fmtSeconds(metrics.oldestContactAge)}
          label="Oldest Contact Age"
          trend={
            <span className={metrics.oldestContactAge > 180 ? 'text-red-500' : 'text-amber-500'}>
              {metrics.oldestContactAge > 180 ? '⚠ SLA at risk' : '⚠ Approaching SLA'}
            </span>
          }
        />

        <MetricCard
          variant="cyan"
          icon="📈"
          value={`${metrics.serviceLevel}%`}
          label="Service Level (30s)"
          trend={
            <span className={metrics.serviceLevel >= 80 ? 'text-emerald-600' : 'text-red-500'}>
              {metrics.serviceLevel >= 80 ? '↑ Above target' : '↓ Below 80% target'}
            </span>
          }
        />
      </div>

      {/* Queue Breakdown + Contacts Today */}
      <div className="grid grid-cols-3 gap-6">
        {/* Queue breakdown */}
        <div className="col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-bold text-slate-900">📋 Queue Breakdown</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              LIVE
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {MOCK_QUEUES.map(q => (
              <div key={q.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{q.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        q.open
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {q.open ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{q.name}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-extrabold text-slate-900">{q.inQueue}</div>
                  <div className="text-[10px] text-slate-400">In Queue</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-extrabold text-slate-900">{q.agents}</div>
                  <div className="text-[10px] text-slate-400">Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-extrabold text-slate-900">{q.slaTarget}%</div>
                  <div className="text-[10px] text-slate-400">SLA Target</div>
                </div>
                <div className="w-24">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        q.inQueue > 2 ? 'bg-red-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, q.inQueue * 25)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts Today summary */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-bold text-slate-900">📊 Today's Summary</h3>
          </div>
          <div className="space-y-4 p-6">
            {[
              { label: 'Contacts Handled', val: metrics.contactsToday, color: 'text-slate-900' },
              { label: 'Avg Handle Time', val: '4:38', color: 'text-slate-900' },
              { label: 'Avg Queue Time', val: '0:52', color: 'text-slate-900' },
              { label: 'Avg CSAT', val: '94.8%', color: 'text-emerald-600' },
              { label: 'Transferred', val: '3', color: 'text-slate-900' },
              { label: 'Abandoned', val: '2', color: 'text-red-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
