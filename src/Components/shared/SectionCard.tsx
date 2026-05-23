import type { ReactNode } from 'react';

type IconVariant = 'blue' | 'green' | 'amber' | 'red' | 'cyan';

const ICON_CLS: Record<IconVariant, string> = {
  blue:  'bg-connect-teal-soft text-connect-teal-dark',
  green: 'bg-connect-success-soft text-connect-success',
  amber: 'bg-connect-warning-soft text-connect-warning',
  red:   'bg-connect-error-soft text-connect-error',
  cyan:  'bg-connect-sky-soft text-connect-sky',
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
    <div className="overflow-hidden rounded-xl border border-connect-border bg-connect-bg shadow-connect-card">
      <div className="flex items-center justify-between border-b border-connect-border-soft px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${ICON_CLS[iconVariant]}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-connect-text">{title}</h3>
            <p className="text-xs text-connect-text-secondary">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
