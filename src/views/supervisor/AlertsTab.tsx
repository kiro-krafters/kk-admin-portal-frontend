import { useState } from 'react';
import type { Alert, AlertSeverity } from '../../mock/alerts';
import { MOCK_ALERTS } from '../../mock/alerts';

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: string; bg: string; border: string; iconBg: string; text: string }> = {
  error: {
    icon: '🔴',
    bg: 'bg-connect-error-soft',
    border: 'border-connect-error',
    iconBg: 'bg-connect-error-soft',
    text: 'text-connect-error',
  },
  warn: {
    icon: '⚠️',
    bg: 'bg-connect-warning-soft',
    border: 'border-connect-warning',
    iconBg: 'bg-connect-warning-soft',
    text: 'text-connect-warning',
  },
  info: {
    icon: 'ℹ️',
    bg: 'bg-connect-teal-soft',
    border: 'border-connect-teal',
    iconBg: 'bg-connect-teal-50',
    text: 'text-connect-teal-dark',
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
        <div className="flex items-center gap-2 rounded-md border border-connect-error bg-connect-error-soft px-4 py-2">
          <span className="text-base">🔔</span>
          <span className="text-sm font-semibold text-connect-error">{unacknowledged} unacknowledged alerts</span>
        </div>

        <div className="ml-auto flex gap-1">
          {(['all', 'error', 'warn', 'info'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-connect-teal text-white'
                  : 'bg-connect-bg-alt text-connect-text-secondary hover:bg-connect-border hover:text-connect-text'
              }`}
            >
              {f === 'all' ? 'All' : f === 'error' ? 'Critical' : f === 'warn' ? 'Warning' : 'Info'}
            </button>
          ))}
        </div>

        <button
          onClick={acknowledgeAll}
          className="rounded-md border border-connect-border bg-connect-bg px-3 py-1.5 text-xs font-semibold text-connect-text-secondary shadow-connect-card hover:bg-connect-bg-alt"
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
              className={`flex items-start gap-4 rounded-xl border p-4 transition-opacity ${cfg.bg} ${cfg.border} ${
                alert.acknowledged ? 'opacity-50' : ''
              }`}
            >
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-base ${cfg.iconBg}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${cfg.text}`}>{alert.title}</div>
                <div className="mt-0.5 text-xs text-connect-text-secondary">{alert.description}</div>
                <div className="mt-1 text-[10px] text-connect-text-secondary">{alert.time}</div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {alert.acknowledged ? (
                  <span className="text-[11px] font-semibold text-connect-text-secondary">Acknowledged</span>
                ) : (
                  <button
                    onClick={() => acknowledge(alert.id)}
                    className="rounded-md border border-connect-border bg-connect-bg px-3 py-1.5 text-xs font-semibold text-connect-text-secondary shadow-connect-card transition-colors hover:bg-connect-bg-alt"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="rounded-xl border border-connect-border bg-connect-bg py-16 text-center text-sm text-connect-text-secondary shadow-connect-card">
            ✅ No alerts in this category
          </div>
        )}
      </div>
    </div>
  );
}
