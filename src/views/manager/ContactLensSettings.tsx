import type { ContactLensSetting } from '../../mock/contactLens';
import Toggle from '../../components/shared/Toggle';
import SectionCard from '../../components/shared/SectionCard';

interface Props {
  settings: ContactLensSetting[];
  onChange: (id: string, enabled: boolean) => void;
}

const CL_ICONS: Record<string, string> = {
  cls1: '🎙️',
  cls2: '💬',
  cls3: '📝',
  cls4: '🔒',
};

const CL_API: Record<string, string> = {
  cls1: 'connect:UpdateContactFlowContent (voice)',
  cls2: 'connect:UpdateContactFlowContent (chat)',
  cls3: 'connect:UpdateContactFlowContent (eval form)',
  cls4: 'connect:UpdateContactFlowContent (PII redaction)',
};

export default function ContactLensSettings({ settings, onChange }: Props) {
  return (
    <SectionCard
      icon="🔍"
      iconVariant="cyan"
      title="Contact Lens Settings"
      subtitle="Enable or disable analytics, evaluation, and PII redaction for contact flows"
    >
      <div className="divide-y divide-connect-border-soft">
        {settings.map(setting => (
          <div key={setting.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-base ${
                setting.enabled ? 'bg-connect-teal-soft' : 'bg-connect-bg-alt'
              }`}
            >
              {CL_ICONS[setting.id] ?? '⚙️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-connect-text">{setting.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    setting.enabled
                      ? 'bg-connect-success-soft text-connect-success'
                      : 'bg-connect-bg-alt text-connect-text-disabled'
                  }`}
                >
                  {setting.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-connect-text-secondary">{setting.description}</div>
              <div className="mt-0.5 font-mono text-[10px] text-connect-text-disabled">{CL_API[setting.id]}</div>
            </div>
            <Toggle checked={setting.enabled} onChange={val => onChange(setting.id, val)} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
