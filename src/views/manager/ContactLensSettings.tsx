import type { ContactLensSetting } from '../../mock/contactLens';
import Toggle from '../../components/shared/Toggle';
import SectionCard from '../../components/shared/SectionCard';

interface Props {
  settings: ContactLensSetting[];
  onChange: (id: string, enabled: boolean) => void;
}

export default function ContactLensSettings({ settings, onChange }: Props) {
  return (
    <SectionCard
      icon="🔍"
      iconVariant="cyan"
      title="Contact Lens Settings"
      subtitle="Enable analytics and evaluation for contact flows"
    >
      <div className="divide-y divide-slate-50">
        {settings.map(setting => (
          <div key={setting.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900">{setting.label}</div>
              <div className="mt-0.5 text-xs text-slate-400">{setting.description}</div>
            </div>
            <Toggle
              checked={setting.enabled}
              onChange={val => onChange(setting.id, val)}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
