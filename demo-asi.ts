#!/usr/bin/env node
/**
 * ASI System Demo
 * Demonstrates the multi-tenant org2org multiplex IoT Android BotNet distributed cognitive architecture
 */

// Import ASI System
import ASISystem from './src/asi/index.ts';
import type {
  OrganizationContext,
  BotNetNode,
  IoTSensorData,
  DistributedTask,
  MemoryFragment,
  SessionState,
} from './src/asi/types.ts';

console.log('=== ASI System Demo ===\n');

// Initialize ASI system
const asi = new ASISystem();

console.log('1. Registering Organizations...');
const org1: OrganizationContext = {
  orgId: 'org-1',
  name: 'Alpha Organization',
  tenantId: 'tenant-1',
  metadata: { region: 'us-east', tier: 'enterprise' },
};

const org2: OrganizationContext = {
  orgId: 'org-2',
  name: 'Beta Organization',
  tenantId: 'tenant-2',
  metadata: { region: 'eu-west', tier: 'professional' },
};

asi.registerOrganization(org1);
asi.registerOrganization(org2);
console.log(`✓ Registered ${org1.name} and ${org2.name}\n`);

console.log('2. Registering Bot Nodes...');
const node1: BotNetNode = {
  nodeId: 'node-alpha-1',
  agentId: 'agent-community',
  orgId: 'org-1',
  capabilities: ['moderation', 'welcome', 'support'],
  status: 'online',
  lastHeartbeat: Date.now(),
};

const node2: BotNetNode = {
  nodeId: 'node-beta-1',
  agentId: 'agent-devrel',
  orgId: 'org-2',
  capabilities: ['documentation', 'code-examples', 'technical-support'],
  status: 'online',
  lastHeartbeat: Date.now(),
};

asi.registerBotNode(node1);
asi.registerBotNode(node2);
console.log(`✓ Registered nodes: ${node1.nodeId}, ${node2.nodeId}\n`);

console.log('3. Processing IoT Sensor Data...');
const sensorData: IoTSensorData = {
  deviceId: 'device-mobile-001',
  sensorType: 'accelerometer',
  timestamp: Date.now(),
  values: [12.5, 3.2, 9.8], // Motion detected
};

asi.processSensorData(sensorData).then(result => {
  console.log(`✓ Sensor processed: ${result.sensorContext.intent} detected`);
  console.log(`  Magnitude: ${result.sensorContext.magnitude.toFixed(2)}\n`);
}).catch(err => console.error('Error processing sensor:', err));

console.log('4. Creating Memory Fragments...');
const memory1: MemoryFragment = {
  id: 'mem-conversation-1',
  timestamp: Date.now(),
  platformId: 'discord',
  conversationId: 'conv-12345',
  contentHash: 'hash-abc123',
  recursiveDepth: 0,
  parentReferences: [],
  content: 'User: How do I integrate ASI with my agent?',
};

const memory2: MemoryFragment = {
  id: 'mem-conversation-2',
  timestamp: Date.now() + 1000,
  platformId: 'discord',
  conversationId: 'conv-12345',
  contentHash: 'hash-def456',
  recursiveDepth: 1,
  parentReferences: ['mem-conversation-1'],
  content: 'Agent: ASI provides distributed cognitive processing...',
};

asi.storeMemory(memory1);
asi.storeMemory(memory2);
console.log('✓ Stored conversation memory fragments\n');

console.log('5. Creating Cross-Org Task...');
const task: DistributedTask = {
  taskId: 'task-support-001',
  type: 'technical-support',
  priority: 2,
  sourceNode: 'org-1:node-alpha-1',
  targetNodes: ['org-2:node-beta-1'],
  payload: {
    question: 'Need help with ASI IoT sensor integration',
    context: 'Multi-tenant setup with Android devices',
  },
  status: 'pending',
  createdAt: Date.now(),
};

asi.createTask(task).then(() => {
  console.log('✓ Task created and distributed\n');
}).catch(err => console.error('Error creating task:', err));

console.log('6. Creating Session...');
const session: SessionState = {
  sessionId: 'session-web-001',
  platform: 'character.ai',
  persistenceModel: 'incremental-snapshot',
  lastSync: Date.now(),
  metadata: {
    userId: 'user-123',
    conversationId: 'conv-12345',
  },
};

asi.createSession(session);
console.log('✓ Session created for character.ai\n');

console.log('7. Session Handoff Demo...');
asi.handoffSession('session-web-001', 'openai').then(token => {
  console.log('✓ Generated handoff token for platform transfer');
  console.log(`  Token: ${token.substring(0, 20)}...\n`);
}).catch(err => console.error('Error in handoff:', err));

// Wait a bit for async operations
setTimeout(() => {
  console.log('8. System Statistics:');
  const stats = asi.getSystemStats();
  
  console.log('\n📊 BotNet Statistics:');
  console.log(`   Total Nodes: ${stats.botnet.totalNodes}`);
  console.log(`   Online Nodes: ${stats.botnet.onlineNodes}`);
  console.log(`   Total Tasks: ${stats.botnet.totalTasks}`);
  console.log(`   Completed Tasks: ${stats.botnet.completedTasks}`);
  
  console.log('\n📊 Multiplex Statistics:');
  console.log(`   Organizations: ${stats.multiplex.organizations}`);
  console.log(`   Channels: ${stats.multiplex.channels}`);
  console.log(`   Active Channels: ${stats.multiplex.activeChannels}`);
  
  console.log('\n📊 Memory Statistics:');
  console.log(`   Total Fragments: ${stats.memory.totalFragments}`);
  console.log(`   Platforms: ${stats.memory.platforms}`);
  console.log(`   Conversations: ${stats.memory.conversations}`);
  
  console.log('\n📊 Session Statistics:');
  console.log(`   Total Sessions: ${stats.session.totalSessions}`);
  console.log(`   Active Syncs: ${stats.session.activeSyncs}`);
  
  console.log('\n✅ ASI System Demo Complete!\n');
  console.log('The multi-tenant org2org multiplex IoT Android BotNet');
  console.log('distributed cognitive architecture is fully operational.\n');
}, 500);
