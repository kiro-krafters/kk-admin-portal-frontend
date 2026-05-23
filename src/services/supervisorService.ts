import type { Agent } from '../mock/agents';
import { MOCK_AGENTS } from '../mock/agents';
import type { Queue, RealTimeMetrics } from '../mock/queues';
import { MOCK_QUEUES, INITIAL_METRICS } from '../mock/queues';
import type { Alert } from '../mock/alerts';
import { MOCK_ALERTS } from '../mock/alerts';
import type { SentimentSummary, FlaggedContact } from '../mock/contactLens';
import { MOCK_SENTIMENT, MOCK_FLAGGED_CONTACTS } from '../mock/contactLens';

// TODO: Replace with real Amazon Connect real-time metrics API calls
// Reference: @aws-sdk/client-connect — GetCurrentMetricData, GetMetricDataV2

export async function fetchRealTimeMetrics(): Promise<RealTimeMetrics> {
  // TODO: call connect.GetCurrentMetricData({ InstanceId, Filters, Groupings, CurrentMetrics })
  return Promise.resolve({ ...INITIAL_METRICS });
}

export async function fetchAgents(): Promise<Agent[]> {
  // TODO: call connect.ListUsers + connect.GetCurrentUserData for live status
  return Promise.resolve(MOCK_AGENTS);
}

export async function fetchQueues(): Promise<Queue[]> {
  // TODO: call connect.ListQueues + connect.GetCurrentMetricData per queue
  return Promise.resolve(MOCK_QUEUES);
}

export async function fetchAlerts(): Promise<Alert[]> {
  // TODO: integrate with Amazon CloudWatch alarms or Connect Event Streams
  return Promise.resolve(MOCK_ALERTS);
}

export async function fetchSentimentSummary(): Promise<SentimentSummary> {
  // TODO: call Contact Lens API — StartContactRecordingAnalysis or S3 + Athena
  return Promise.resolve(MOCK_SENTIMENT);
}

export async function fetchFlaggedContacts(): Promise<FlaggedContact[]> {
  // TODO: query Contact Lens evaluation results from S3 output bucket
  return Promise.resolve(MOCK_FLAGGED_CONTACTS);
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  // TODO: persist to DynamoDB or Connect custom attributes
  console.log('[supervisorService] acknowledgeAlert:', alertId);
}

export async function monitorAgent(agentId: string): Promise<void> {
  // TODO: call connect.StartContactMonitoring for live barge/monitor
  console.log('[supervisorService] monitorAgent:', agentId);
}
