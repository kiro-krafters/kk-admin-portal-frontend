import { useState } from 'react';
import RealTimeTab from './RealTimeTab';
import AgentsTab from './AgentsTab';
import ContactLensTab from './ContactLensTab';
import AlertsTab from './AlertsTab';
import { MOCK_ALERTS } from '../../mock/alerts';

type Tab = 'realtime' | 'agents' | 'lens' | 'alerts';

const TABS: { id: Tab; label: string; icon: string; badge?: number }[] = [
  { id: 'realtime', label: 'Real-Time', icon: '📊' },
  { id: 'agents', label: 'Agents', icon: '👥' },
  { id: 'lens', label: 'Contact Lens', icon: '🔍' },
  { id: 'alerts', label: 'Alerts', icon: '🔔', badge: MOCK_ALERTS.filter(a => !a.acknowledged).length },
];

export default function SupervisorView() {
  const [activeTab, setActiveTab] = useState<Tab>('realtime');

  return (
    <div className="flex h-full flex-col overflow-hidden bg-connect-bg-alt">
      {/* Page header */}
      <div className="border-b border-connect-border bg-connect-bg px-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-connect-text">Supervisor Console</h1>
            <p className="mt-0.5 text-sm text-connect-text-secondary">
              Real-time contact center visibility · kk_connect_dev
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-connect-bg-alt px-2.5 py-1 font-medium text-connect-text-secondary">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="rounded-full bg-connect-teal-soft px-2.5 py-1 font-semibold text-connect-teal-dark">
              Supervisor
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-connect-teal text-connect-teal-dark'
                  : 'border-transparent text-connect-text-secondary hover:text-connect-text'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="rounded-full bg-connect-error px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'realtime' && <RealTimeTab />}
        {activeTab === 'agents' && <AgentsTab />}
        {activeTab === 'lens' && <ContactLensTab />}
        {activeTab === 'alerts' && <AlertsTab />}
      </div>
    </div>
  );
}
