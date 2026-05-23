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
        <div className="flex items-center gap-2 text-xs text-connect-text-secondary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-connect-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-connect-success" />
          </span>
          Auto-refresh every 30s · Last: {lastRefresh.toLocaleTimeString()}
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 rounded-md border border-connect-border bg-connect-bg px-3 py-1.5 text-xs font-semibold text-connect-text-secondary shadow-connect-card hover:bg-connect-bg-alt hover:text-connect-text"
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
            <span className="text-connect-error">
              ↑ {metrics.contactsInQueue > 3 ? 'Above threshold' : 'Normal'}
            </span>
          }
        >
          <div className="mt-3 space-y-1.5">
            {MOCK_QUEUES.filter(q => q.open).map(q => {
              const pct = Math.min(100, Math.round((q.inQueue / 5) * 100));
              return (
                <div key={q.id} className="flex items-center gap-2">
                  <span className="w-20 truncate text-[10px] text-connect-text-secondary">{q.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-connect-bg-alt">
                    <div className="h-full rounded-full bg-connect-error" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-3 text-right text-[10px] font-semibold text-connect-text-secondary">{q.inQueue}</span>
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
          trend={<span className="text-connect-success">↑ {metrics.agentsAvailable} of 8 agents</span>}
        />

        <MetricCard
          variant="blue"
          icon="🎧"
          value={metrics.agentsOnContact}
          label="Agents On Contact"
          trend={<span className="text-connect-teal">● {metrics.agentsOnContact} active contacts</span>}
        />

        <MetricCard
          variant="amber"
          icon="⏱️"
          value={fmtSeconds(metrics.oldestContactAge)}
          label="Oldest Contact Age"
          trend={
            <span className={metrics.oldestContactAge > 180 ? 'text-connect-error' : 'text-connect-warning'}>
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
            <span className={metrics.serviceLevel >= 80 ? 'text-connect-success' : 'text-connect-error'}>
              {metrics.serviceLevel >= 80 ? '↑ Above target' : '↓ Below 80% target'}
            </span>
          }
        />
      </div>

      {/* Queue Breakdown + Contacts Today */}
      <div className="grid grid-cols-3 gap-6">
        {/* Queue breakdown */}
        <div className="col-span-2 overflow-hidden rounded-xl border border-connect-border bg-connect-bg shadow-connect-card">
          <div className="flex items-center justify-between border-b border-connect-border-soft px-6 py-4">
            <h3 className="text-sm font-semibold text-connect-text">Queue Breakdown</h3>
            <span className="rounded-full bg-connect-teal-soft px-2 py-0.5 text-[10px] font-semibold text-connect-teal-dark">
              LIVE
            </span>
          </div>
          <div className="divide-y divide-connect-border-soft">
            {MOCK_QUEUES.map(q => (
              <div key={q.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-connect-text">{q.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        q.open
                          ? 'bg-connect-success-soft text-connect-success'
                          : 'bg-connect-bg-alt text-connect-text-disabled'
                      }`}
                    >
                      {q.open ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-connect-text-secondary">{q.name}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-connect-text">{q.inQueue}</div>
                  <div className="text-[10px] text-connect-text-secondary">In Queue</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-connect-text">{q.agents}</div>
                  <div className="text-[10px] text-connect-text-secondary">Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-connect-text">{q.slaTarget}%</div>
                  <div className="text-[10px] text-connect-text-secondary">SLA Target</div>
                </div>
                <div className="w-24">
                  <div className="h-2 overflow-hidden rounded-full bg-connect-bg-alt">
                    <div
                      className={`h-full rounded-full transition-all ${
                        q.inQueue > 2 ? 'bg-connect-error' : 'bg-connect-success'
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
        <div className="overflow-hidden rounded-xl border border-connect-border bg-connect-bg shadow-connect-card">
          <div className="border-b border-connect-border-soft px-6 py-4">
            <h3 className="text-sm font-semibold text-connect-text">Today's Summary</h3>
          </div>
          <div className="space-y-4 p-6">
            {[
              { label: 'Contacts Handled', val: metrics.contactsToday, cls: 'text-connect-text' },
              { label: 'Avg Handle Time', val: '4:38', cls: 'text-connect-text' },
              { label: 'Avg Queue Time', val: '0:52', cls: 'text-connect-text' },
              { label: 'Avg CSAT', val: '94.8%', cls: 'text-connect-success' },
              { label: 'Transferred', val: '3', cls: 'text-connect-text' },
              { label: 'Abandoned', val: '2', cls: 'text-connect-error' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-connect-text-secondary">{item.label}</span>
                <span className={`text-sm font-semibold ${item.cls}`}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
