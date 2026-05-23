import type { ReactNode } from 'react';

type Variant = 'blue' | 'green' | 'red' | 'amber' | 'cyan';

const ACCENT: Record<Variant, { bar: string; icon: string }> = {
  blue:  { bar: 'from-connect-teal to-connect-teal-light',     icon: 'bg-connect-teal-soft text-connect-teal-dark'   },
  green: { bar: 'from-connect-success to-connect-teal-light',  icon: 'bg-connect-success-soft text-connect-success'  },
  red:   { bar: 'from-connect-error to-connect-orange',        icon: 'bg-connect-error-soft text-connect-error'      },
  amber: { bar: 'from-connect-warning to-connect-orange',      icon: 'bg-connect-warning-soft text-connect-warning'  },
  cyan:  { bar: 'from-connect-sky to-connect-teal',            icon: 'bg-connect-sky-soft text-connect-sky'          },
};

interface MetricCardProps {
  variant: Variant;
  icon: string;
  value: string | number;
  label: string;
  trend?: ReactNode;
  children?: ReactNode;
}

export default function MetricCard({ variant, icon, value, label, trend, children }: MetricCardProps) {
  const { bar, icon: iconCls } = ACCENT[variant];
  return (
    <div className="relative overflow-hidden rounded-xl border border-connect-border bg-connect-bg p-5 shadow-connect-card">
      <div className={`absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r ${bar}`} />
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg ${iconCls}`}>
        {icon}
      </div>
      <div className="text-3xl font-semibold leading-none text-connect-text">{value}</div>
      <div className="mt-1.5 text-sm font-medium text-connect-text-secondary">{label}</div>
      {trend && <div className="mt-2 text-xs font-semibold">{trend}</div>}
      {children}
    </div>
  );
}
