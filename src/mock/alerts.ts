export type AlertSeverity = 'warn' | 'error' | 'info';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  time: string;
  acknowledged: boolean;
}

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'al1',
    severity: 'error',
    title: 'SLA at Risk',
    description: 'Claims queue oldest contact: 2m 22s — approaching 3-minute SLA threshold',
    time: '1m ago',
    acknowledged: false,
  },
  {
    id: 'al2',
    severity: 'warn',
    title: 'Queue Threshold Reached',
    description: 'Claims queue: 3 contacts waiting — threshold is 3',
    time: '2m ago',
    acknowledged: false,
  },
  {
    id: 'al3',
    severity: 'warn',
    title: 'Service Level Dropping',
    description: 'General Support SL at 76% — below 80% target',
    time: '4m ago',
    acknowledged: false,
  },
  {
    id: 'al4',
    severity: 'info',
    title: 'Agent DK on Break',
    description: 'Darshan Kalathiya — expected return in 8 minutes',
    time: '5m ago',
    acknowledged: false,
  },
  {
    id: 'al5',
    severity: 'info',
    title: 'Lex Bot High Confidence',
    description: 'ClaimStatus intent matched 14 times in last 30 minutes',
    time: '8m ago',
    acknowledged: true,
  },
  {
    id: 'al6',
    severity: 'error',
    title: 'All Billing Agents Offline',
    description: 'Billing & Payments queue has 0 available agents',
    time: '12m ago',
    acknowledged: false,
  },
];
