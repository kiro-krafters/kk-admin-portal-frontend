import { useState, useCallback } from 'react';
import SupervisorView from '../supervisor/SupervisorView';
import ConfigTab from './ConfigTab';
import type { Queue } from '../../mock/queues';
import { MOCK_QUEUES } from '../../mock/queues';
import type { Agent } from '../../mock/agents';
import { MOCK_AGENTS } from '../../mock/agents';
import type { ContactLensSetting } from '../../mock/contactLens';
import { MOCK_CL_SETTINGS } from '../../mock/contactLens';

type Tab = 'supervisor' | 'config';

export type Toast = { id: number; message: string; type: 'success' | 'error' };

const TABS: { id: Tab; label: string }[] = [
  { id: 'supervisor', label: 'Supervisor View' },
  { id: 'config', label: 'Configuration' },
];

let _toastId = 0;

export default function ManagerView() {
  const [activeTab, setActiveTab] = useState<Tab>('supervisor');
  const [queues, setQueues] = useState<Queue[]>(MOCK_QUEUES.map(q => ({ ...q })));
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS.map(a => ({ ...a })));
  const [clSettings, setClSettings] = useState<ContactLensSetting[]>(MOCK_CL_SETTINGS.map(s => ({ ...s })));
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  function handleQueueChange(id: string, open: boolean) {
    setQueues(prev => prev.map(q => q.id === id ? { ...q, open } : q));
    setHasChanges(true);
    setSaved(false);
    // TODO: await connect.UpdateQueueHoursOfOperation({ QueueId: id, HoursOfOperationId: open ? HOURS_24_7_ID : HOURS_CLOSED_ID })
    addToast(`Queue ${open ? 'opened' : 'closed'} — pending save`);
  }

  function handleAgentChange(agentId: string, field: 'routingProfile' | 'proficiencyLevel', value: string | number) {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, [field]: value } : a));
    setHasChanges(true);
    setSaved(false);
    if (field === 'routingProfile') {
      // TODO: await connect.UpdateUserRoutingProfile({ UserId: agentId, InstanceId, RoutingProfileId: value })
      addToast(`Routing profile updated — pending save`);
    }
  }

  function handleCLChange(settingId: string, enabled: boolean) {
    setClSettings(prev => prev.map(s => s.id === settingId ? { ...s, enabled } : s));
    setHasChanges(true);
    setSaved(false);
  }

  function handleSave() {
    // TODO: batch — for each queue call connect.UpdateQueueHoursOfOperation
    // TODO: for each agent call connect.UpdateUserRoutingProfile + connect.AssociateUserProficiencies
    // TODO: for CL settings call connect.UpdateContactFlowContent to enable/disable Contact Lens blocks
    setSaved(true);
    setHasChanges(false);
    addToast('All changes saved to kk_connect_dev', 'success');
    setTimeout(() => setSaved(false), 3000);
  }

  function handleDiscard() {
    setQueues(MOCK_QUEUES.map(q => ({ ...q })));
    setAgents(MOCK_AGENTS.map(a => ({ ...a })));
    setClSettings(MOCK_CL_SETTINGS.map(s => ({ ...s })));
    setHasChanges(false);
    setSaved(false);
    addToast('Changes discarded');
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="border-b border-connect-border bg-connect-bg px-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-connect-text">Manager Console</h1>
            <p className="mt-0.5 text-sm text-connect-text-secondary">
              kk_connect_dev — supervisor + full configuration access
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-connect-bg-alt px-2.5 py-1 font-medium text-connect-text-secondary">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="rounded-full bg-connect-navy px-2.5 py-1 font-semibold text-white">
              Manager
            </span>
          </div>
        </div>

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
              {tab.label}
              {tab.id === 'config' && hasChanges && (
                <span className="h-2 w-2 rounded-full bg-connect-orange" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${activeTab === 'config' ? 'bg-connect-bg-alt p-6' : ''}`}>
        {activeTab === 'supervisor' && <SupervisorView />}
        {activeTab === 'config' && (
          <ConfigTab
            queues={queues}
            agents={agents}
            clSettings={clSettings}
            onQueueChange={handleQueueChange}
            onAgentChange={handleAgentChange}
            onCLChange={handleCLChange}
          />
        )}
      </div>

      {/* Sticky save bar */}
      {activeTab === 'config' && (
        <div className="flex items-center justify-between border-t border-connect-navy-deep bg-connect-navy px-6 py-3.5">
          <p className="text-sm text-white/70">
            {saved
              ? '✅ Changes saved to kk_connect_dev'
              : hasChanges
              ? '⚠️ Unsaved changes — click Save to apply to kk_connect_dev'
              : '✓ All changes are saved'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              disabled={!hasChanges}
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:border-white/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="rounded-md bg-connect-success px-5 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saved ? '✅ Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Toast stack */}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-connect-panel animate-in fade-in slide-in-from-right-4 duration-300 ${
              t.type === 'success' ? 'bg-connect-success' : 'bg-connect-error'
            }`}
          >
            <span>{t.type === 'success' ? '✓' : '✕'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
