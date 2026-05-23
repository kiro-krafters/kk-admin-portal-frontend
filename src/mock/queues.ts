export interface Queue {
  id: string;
  name: string;
  label: string;
  open: boolean;
  agents: number;
  inQueue: number;
  hours: string;
  slaTarget: number;
}

export const MOCK_QUEUES: Queue[] = [
  {
    id: 'q1',
    name: 'kk_queue_general_dev',
    label: 'General Support',
    open: true,
    agents: 3,
    inQueue: 1,
    hours: '24/7',
    slaTarget: 80,
  },
  {
    id: 'q2',
    name: 'kk_queue_claims_dev',
    label: 'Claims Processing',
    open: true,
    agents: 2,
    inQueue: 3,
    hours: 'Mon–Fri 8AM–8PM',
    slaTarget: 85,
  },
  {
    id: 'q3',
    name: 'kk_queue_billing_dev',
    label: 'Billing & Payments',
    open: false,
    agents: 0,
    inQueue: 0,
    hours: 'Mon–Fri 9AM–5PM',
    slaTarget: 80,
  },
];

export interface RealTimeMetrics {
  contactsInQueue: number;
  agentsAvailable: number;
  agentsOnContact: number;
  oldestContactAge: number; // seconds
  serviceLevel: number; // percentage
  contactsToday: number;
}

export const INITIAL_METRICS: RealTimeMetrics = {
  contactsInQueue: 4,
  agentsAvailable: 3,
  agentsOnContact: 2,
  oldestContactAge: 142,
  serviceLevel: 84,
  contactsToday: 23,
};
