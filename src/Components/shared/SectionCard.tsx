import type { ReactNode } from 'react';

type IconVariant = 'blue' | 'green' | 'amber' | 'red' | 'cyan';

const ICON_CLS: Record<IconVariant, string> = {
  blue:  'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red:   'bg-red-50 text-red-600',
  cyan:  'bg-cyan-50 text-cyan-600',
};

interface SectionCardProps {
  icon: string;
  iconVariant: IconVariant;
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function SectionCard({ icon, iconVariant, title, subtitle, children, action }: SectionCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${ICON_CLS[iconVariant]}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
