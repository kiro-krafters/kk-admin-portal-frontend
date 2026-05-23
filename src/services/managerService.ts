import type { Queue } from '../mock/queues';
import { MOCK_QUEUES } from '../mock/queues';
import type { Agent } from '../mock/agents';
import { MOCK_AGENTS } from '../mock/agents';
import type { LexBotConfig, ContactLensSetting } from '../mock/contactLens';
import { MOCK_LEX_BOTS, MOCK_CL_SETTINGS } from '../mock/contactLens';

// TODO: Replace with real Amazon Connect Admin API calls
// Reference: @aws-sdk/client-connect

export async function fetchQueuesConfig(): Promise<Queue[]> {
  // TODO: connect.ListQueues + connect.DescribeQueue per queue
  return Promise.resolve(MOCK_QUEUES.map(q => ({ ...q })));
}

export async function updateQueueAvailability(queueId: string, open: boolean): Promise<void> {
  // TODO: connect.UpdateQueueStatus({ InstanceId, QueueId, Status: open ? 'ENABLED' : 'DISABLED' })
  console.log('[managerService] updateQueueAvailability:', queueId, open);
}

export async function fetchAgentsConfig(): Promise<Agent[]> {
  // TODO: connect.ListUsers + connect.DescribeUser per agent
  return Promise.resolve(MOCK_AGENTS.map(a => ({ ...a })));
}

export async function updateAgentRoutingProfile(agentId: string, profileId: string): Promise<void> {
  // TODO: connect.UpdateUserRoutingProfile({ InstanceId, UserId: agentId, RoutingProfileId: profileId })
  console.log('[managerService] updateAgentRoutingProfile:', agentId, profileId);
}

export async function updateAgentProficiency(agentId: string, skill: string, level: number): Promise<void> {
  // TODO: connect.UpdateUserProficiencies or custom DynamoDB record
  console.log('[managerService] updateAgentProficiency:', agentId, skill, level);
}

export async function fetchLexBotConfig(): Promise<LexBotConfig[]> {
  // TODO: lexv2-models.ListBots + ListBotAliases + ListIntents
  return Promise.resolve(MOCK_LEX_BOTS);
}

export async function fetchContactLensSettings(): Promise<ContactLensSetting[]> {
  // TODO: connect.DescribeInstanceAttribute for CONTACT_LENS
  return Promise.resolve(MOCK_CL_SETTINGS.map(s => ({ ...s })));
}

export async function saveContactLensSettings(settings: ContactLensSetting[]): Promise<void> {
  // TODO: connect.UpdateInstanceAttribute for each CONTACT_LENS attribute
  console.log('[managerService] saveContactLensSettings:', settings);
}

export async function saveAllManagerConfig(payload: {
  queues: Queue[];
  agents: Agent[];
  clSettings: ContactLensSetting[];
}): Promise<void> {
  // TODO: batch all updates — queues, routing profiles, contact lens toggles
  console.log('[managerService] saveAllManagerConfig:', payload);
}
