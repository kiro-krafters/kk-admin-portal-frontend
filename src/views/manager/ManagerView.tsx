import { useState } from 'react';
import SupervisorView from '../supervisor/SupervisorView';
import ConfigTab from './ConfigTab';
import type { Queue } from '../../mock/queues';
import { MOCK_QUEUES } from '../../mock/queues';
import type { Agent } from '../../mock/agents';
import { MOCK_AGENTS } from '../../mock/agents';
import type { ContactLensSetting } from '../../mock/contactLens';
import { MOCK_CL_SETTINGS } from '../../mock/contactLens';

type Tab = 'supervisor' | 'config';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'supervisor', label: 'Supervisor View', icon: '📊' },
  { id: 'config', label: 'Configuration', icon: '⚙️' },
];

export default function ManagerView() {
  const [activeTab, setActiveTab] = useState<Tab>('supervisor');
  const [queues, setQueues] = useState<Queue[]>(MOCK_QUEUES.map(q => ({ ...q })));
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS.map(a => ({ ...a })));
  const [clSettings, setClSettings] = useState<ContactLensSetting[]>(MOCK_CL_SETTINGS.map(s => ({ ...s })));
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleQueueChange(id: string, open: boolean) {
    setQueues(prev => prev.map(q => q.id === id ? { ...q, open } : q));
    setHasChanges(true);
    setSaved(false);
    // TODO: call managerService.updateQueueAvailability(id, open)
  }

  function handleAgentChange(agentId: string, field: 'routingProfile' | 'proficiencyLevel', value: string | number) {
    setAgents(prev =>
      prev.map(a => a.id === agentId ? { ...a, [field]: value } : a)
    );
    setHasChanges(true);
    setSaved(false);
    // TODO: call managerService.updateAgentRoutingProfile / updateAgentProficiency
  }

  function handleCLChange(settingId: string, enabled: boolean) {
    setClSettings(prev => prev.map(s => s.id === settingId ? { ...s, enabled } : s));
    setHasChanges(true);
    setSaved(false);
    // TODO: call managerService.saveContactLensSettings
  }

  function handleSave() {
    // TODO: call managerService.saveAllManagerConfig({ queues, agents, clSettings })
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleDiscard() {
    setQueues(MOCK_QUEUES.map(q => ({ ...q })));
    setAgents(MOCK_AGENTS.map(a => ({ ...a })));
    setClSettings(MOCK_CL_SETTINGS.map(s => ({ ...s })));
    setHasChanges(false);
    setSaved(false);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header with tabs */}
      <div className="border-b border-slate-200 bg-white px-6 pt-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Manager Console</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Full control over kk_connect_dev — supervisor + configuration access
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
              📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
              Saveen Poonia · Manager
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
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.id === 'config' && hasChanges && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${activeTab === 'config' ? 'bg-slate-50 p-6' : ''}`}>
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

      {/* Sticky save bar — only in config tab */}
      {activeTab === 'config' && (
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-6 py-3.5">
          <p className="text-sm text-slate-400">
            {saved
              ? '✅ Changes saved successfully to kk_connect_dev'
              : hasChanges
              ? '⚠️ You have unsaved changes — save to apply to kk_connect_dev'
              : '✓ All changes are saved'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              disabled={!hasChanges}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saved ? '✅ Saved!' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
