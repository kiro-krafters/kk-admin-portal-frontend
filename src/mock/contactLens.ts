export interface FlaggedContact {
  id: string;
  customer: string;
  agentName: string;
  queue: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  flag: string;
  time: string;
  duration: string;
  evaluationScore: number;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  avgSentiment: number;
  interruptions: number;
  nonTalkTime: number;
  issuesFlagged: number;
}

export const MOCK_SENTIMENT: SentimentSummary = {
  positive: 68,
  neutral: 20,
  negative: 12,
  avgSentiment: 78,
  interruptions: 3,
  nonTalkTime: 12,
  issuesFlagged: 1,
};

export const MOCK_FLAGGED_CONTACTS: FlaggedContact[] = [
  {
    id: 'CTX-001',
    customer: 'Jane Doe',
    agentName: 'Mehul Parmar',
    queue: 'Claims',
    sentiment: 'negative',
    score: 32,
    flag: 'Customer frustration detected',
    time: '10:23 AM',
    duration: '6:42',
    evaluationScore: 71,
  },
  {
    id: 'CTX-002',
    customer: 'Robert Chen',
    agentName: 'Ayush Anghan',
    queue: 'General',
    sentiment: 'neutral',
    score: 55,
    flag: 'Long silence period (>30s)',
    time: '09:58 AM',
    duration: '4:15',
    evaluationScore: 84,
  },
  {
    id: 'CTX-003',
    customer: 'Maria Santos',
    agentName: 'Bhautik Navdariya',
    queue: 'Claims',
    sentiment: 'negative',
    score: 28,
    flag: 'PII mentioned without redaction prompt',
    time: '09:31 AM',
    duration: '8:07',
    evaluationScore: 62,
  },
];

export interface LexBotConfig {
  lang: string;
  flag: string;
  alias: string;
  status: 'active' | 'inactive';
  intents: { name: string; hits: number }[];
}

export const MOCK_LEX_BOTS: LexBotConfig[] = [
  {
    lang: 'English (en_US)',
    flag: '🇺🇸',
    alias: 'kk_lexalias_dev',
    status: 'active',
    intents: [
      { name: 'ClaimStatus', hits: 142 },
      { name: 'PolicyInfo', hits: 89 },
      { name: 'FallbackIntent', hits: 31 },
    ],
  },
  {
    lang: 'Spanish (es_US)',
    flag: '🇪🇸',
    alias: 'kk_lexalias_dev',
    status: 'active',
    intents: [
      { name: 'ClaimStatus', hits: 28 },
      { name: 'PolicyInfo', hits: 19 },
      { name: 'FallbackIntent', hits: 7 },
    ],
  },
];

export interface ContactLensSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export const MOCK_CL_SETTINGS: ContactLensSetting[] = [
  {
    id: 'cls1',
    label: 'Voice Analytics',
    description: 'Transcription and sentiment analysis for all voice contacts',
    enabled: true,
  },
  {
    id: 'cls2',
    label: 'Chat Analytics',
    description: 'Full transcript and intent analytics for chat sessions',
    enabled: true,
  },
  {
    id: 'cls3',
    label: 'Agent Evaluation Forms',
    description: 'Automatic scoring with kk_evalform_dev after each contact',
    enabled: true,
  },
  {
    id: 'cls4',
    label: 'PII Redaction',
    description: 'Automatically redact credit card, SSN from transcripts',
    enabled: false,
  },
];
