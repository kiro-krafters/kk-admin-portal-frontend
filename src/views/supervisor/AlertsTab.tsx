import { useState } from 'react';
import type { Alert, AlertSeverity } from '../../mock/alerts';
import { MOCK_ALERTS } from '../../mock/alerts';

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: string; bg: string; border: string; iconBg: string; text: string }> = {
  error: {
    icon: '🔴',
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    text: 'text-red-700',
  },
  warn: {
    icon: '⚠️',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    text: 'text-amber-700',
  },
  info: {
    icon: 'ℹ️',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    text: 'text-blue-700',
  },
};

export default function AlertsTab() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all');

  const visible = alerts.filter(a => filter === 'all' || a.severity === filter);
  const unacknowledged = alerts.filter(a => !a.acknowledged).length;

  function acknowledge(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    // TODO: call supervisorService.acknowledgeAlert(id)
  }

  function acknowledgeAll() {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2">
          <span className="text-base">🔔</span>
          <span className="text-sm font-bold text-red-700">{unacknowledged} unacknowledged alerts</span>
        </div>

        <div className="flex gap-1 ml-auto">
          {(['all', 'error', 'warn', 'info'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'error' ? 'Critical' : f === 'warn' ? 'Warning' : 'Info'}
            </button>
          ))}
        </div>

        <button
          onClick={acknowledgeAll}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          ✓ Acknowledge All
        </button>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {visible.map(alert => {
          const cfg = SEVERITY_CONFIG[alert.severity];
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-4 rounded-2xl border p-4 transition-opacity ${cfg.bg} ${cfg.border} ${
                alert.acknowledged ? 'opacity-50' : ''
              }`}
            >
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base ${cfg.iconBg}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold ${cfg.text}`}>{alert.title}</div>
                <div className="mt-0.5 text-xs text-slate-500">{alert.description}</div>
                <div className="mt-1 text-[10px] text-slate-400">{alert.time}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {alert.acknowledged ? (
                  <span className="text-[11px] font-semibold text-slate-400">Acknowledged</span>
                ) : (
                  <button
                    onClick={() => acknowledge(alert.id)}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 border border-slate-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            ✅ No alerts in this category
          </div>
        )}
      </div>
    </div>
  );
}
