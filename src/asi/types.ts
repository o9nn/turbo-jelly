/**
 * Multi-Tenant Org2Org Multiplex IoT Android BotNet Distributed Cognitive Architecture
 * Type definitions for ASI integration layer
 */

export interface OrganizationContext {
  orgId: string;
  name: string;
  tenantId: string;
  metadata: Record<string, any>;
}

export interface IoTSensorData {
  deviceId: string;
  sensorType: 'accelerometer' | 'gyroscope' | 'proximity' | 'microphone' | 'camera' | 'location';
  timestamp: number;
  values: number[];
  context?: Record<string, any>;
}

export interface CognitiveContext {
  sessionId: string;
  conversationId: string;
  platformId: string;
  memoryFragments: MemoryFragment[];
  contextEnrichment: Record<string, any>;
}

export interface MemoryFragment {
  id: string;
  timestamp: number;
  platformId: string;
  conversationId: string;
  contentHash: string;
  recursiveDepth: number;
  parentReferences: string[];
  content: string;
}

export interface MultiplexChannel {
  sourceOrgId: string;
  targetOrgId: string;
  channelType: 'agent2agent' | 'org2org' | 'sensor2agent' | 'broadcast';
  status: 'active' | 'paused' | 'terminated';
}

export interface BotNetNode {
  nodeId: string;
  agentId: string;
  orgId: string;
  capabilities: string[];
  status: 'online' | 'offline' | 'busy';
  lastHeartbeat: number;
}

export interface SessionState {
  sessionId: string;
  platform: string;
  authToken?: string;
  persistenceModel: 'incremental-snapshot' | 'full-sync' | 'event-sourced';
  lastSync: number;
  metadata: Record<string, any>;
}

export interface DistributedTask {
  taskId: string;
  type: string;
  priority: number;
  sourceNode: string;
  targetNodes: string[];
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}
