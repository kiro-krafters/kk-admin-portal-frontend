import type { ReactNode } from 'react';

type Variant = 'blue' | 'green' | 'red' | 'amber' | 'cyan';

const ACCENT: Record<Variant, { bar: string; icon: string }> = {
  blue:  { bar: 'from-blue-500 to-blue-400',   icon: 'bg-blue-50 text-blue-600'   },
  green: { bar: 'from-emerald-500 to-emerald-400', icon: 'bg-emerald-50 text-emerald-600' },
  red:   { bar: 'from-red-500 to-red-400',     icon: 'bg-red-50 text-red-600'     },
  amber: { bar: 'from-amber-500 to-amber-400', icon: 'bg-amber-50 text-amber-600' },
  cyan:  { bar: 'from-cyan-500 to-cyan-400',   icon: 'bg-cyan-50 text-cyan-600'   },
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
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r ${bar}`} />
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${iconCls}`}>
        {icon}
      </div>
      <div className="text-3xl font-extrabold leading-none text-slate-900">{value}</div>
      <div className="mt-1.5 text-sm font-medium text-slate-500">{label}</div>
      {trend && <div className="mt-2 text-xs font-semibold">{trend}</div>}
      {children}
    </div>
  );
}
