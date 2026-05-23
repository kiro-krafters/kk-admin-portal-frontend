export type AgentStatus = 'available' | 'busy' | 'break' | 'offline';

export interface Agent {
  id: string;
  name: string;
  initials: string;
  color: string;
  status: AgentStatus;
  queue: string;
  duration: string;
  contactsToday: number;
  csat: number;
  routingProfile: string;
  skill: string;
  proficiencyLevel: number;
}

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'A001',
    name: 'Mehul Parmar',
    initials: 'MP',
    color: '#3b82f6',
    status: 'busy',
    queue: 'Claims',
    duration: '4:23',
    contactsToday: 7,
    csat: 98,
    routingProfile: 'kk_rp_agent_dev',
    skill: 'InsuranceClaims',
    proficiencyLevel: 4,
  },
  {
    id: 'A002',
    name: 'Himanshu Parmar',
    initials: 'HP',
    color: '#8b5cf6',
    status: 'available',
    queue: '—',
    duration: '—',
    contactsToday: 5,
    csat: 95,
    routingProfile: 'kk_rp_agent_dev',
    skill: 'GeneralSupport',
    proficiencyLevel: 3,
  },
  {
    id: 'A003',
    name: 'Ayush Anghan',
    initials: 'AA',
    color: '#10b981',
    status: 'busy',
    queue: 'General',
    duration: '8:51',
    contactsToday: 9,
    csat: 91,
    routingProfile: 'kk_rp_supervisor_dev',
    skill: 'InsuranceClaims',
    proficiencyLevel: 5,
  },
  {
    id: 'A004',
    name: 'Darshan Kalathiya',
    initials: 'DK',
    color: '#f59e0b',
    status: 'break',
    queue: '—',
    duration: '—',
    contactsToday: 3,
    csat: 97,
    routingProfile: 'kk_rp_agent_dev',
    skill: 'Billing',
    proficiencyLevel: 2,
  },
  {
    id: 'A005',
    name: 'Bhautik Navdariya',
    initials: 'BN',
    color: '#ef4444',
    status: 'available',
    queue: '—',
    duration: '—',
    contactsToday: 6,
    csat: 93,
    routingProfile: 'kk_rp_agent_dev',
    skill: 'GeneralSupport',
    proficiencyLevel: 3,
  },
  {
    id: 'A006',
    name: 'Saveen Poonia',
    initials: 'SP',
    color: '#06b6d4',
    status: 'offline',
    queue: '—',
    duration: '—',
    contactsToday: 0,
    csat: 99,
    routingProfile: 'kk_rp_supervisor_dev',
    skill: 'Management',
    proficiencyLevel: 5,
  },
];

export const ROUTING_PROFILES = [
  'kk_rp_agent_dev',
  'kk_rp_supervisor_dev',
  'kk_rp_manager_dev',
];
