# Multi-Tenant Org2Org Multiplex IoT Android BotNet Distributed Cognitive Architecture

## Overview

The ASI (Android System Intelligence) integration layer provides a comprehensive distributed cognitive architecture for multi-agent systems. It enables multi-tenant organizations to coordinate across platforms with IoT sensor integration, persistent memory surfaces, and cross-platform session management.

## Architecture Components

### 1. Cognitive Processing Layer (`src/asi/cognitive/`)

**CognitiveProcessor**: Processes raw sensor data into cognitive context through a multi-stage pipeline:
- Context enrichment
- Pattern matching
- Memory binding

**BotNetCoordinator**: Manages distributed bot nodes and task distribution:
- Node registration and heartbeat monitoring
- Task creation and distribution
- Capability-based task assignment
- Network health monitoring

### 2. IoT Sensor Integration (`src/asi/iot/`)

**IoTSensorFusion**: Handles Android sensor data fusion and context awareness:

Supported Sensors:
- **Accelerometer**: Motion intent prediction
- **Gyroscope**: Orientation context
- **Proximity**: Presence awareness
- **Microphone**: Conversational context
- **Camera**: Environmental awareness
- **Location**: Spatial context

### 3. Org2Org Multiplex System (`src/asi/multiplex/`)

**MultiplexRouter**: Handles communication multiplexing between organizations:
- Organization registration
- Channel creation and management
- Message routing and queuing
- Broadcast capabilities

Channel Types:
- `agent2agent`: Direct agent communication
- `org2org`: Organization-level communication
- `sensor2agent`: IoT to agent data flow
- `broadcast`: Network-wide broadcasts

### 4. Memory Surface (`src/asi/memory/`)

**MemorySurface**: Manages persistent distributed cognition:
- Memory fragment storage with recursive indexing
- Platform-based querying
- Conversation thread tracking
- Tree-based memory navigation
- Snapshot and restore capabilities

### 5. Session Management (`src/asi/session/`)

**SessionManager**: Handles persistent browser sessions and cross-platform synchronization:
- Session creation and lifecycle management
- Periodic synchronization
- Handoff token generation for platform transfers
- Session resumption
- Multi-platform session tracking

## Usage

### Basic Setup

```typescript
import ASISystem from './src/asi';

// Initialize the ASI system
const asi = new ASISystem();

// Register an organization
asi.registerOrganization({
  orgId: 'org-1',
  name: 'My Organization',
  tenantId: 'tenant-1',
  metadata: { region: 'us-east' },
});

// Register a bot node
asi.registerBotNode({
  nodeId: 'node-1',
  agentId: 'agent-1',
  orgId: 'org-1',
  capabilities: ['processing', 'storage'],
  status: 'online',
  lastHeartbeat: Date.now(),
});
```

### Processing IoT Sensor Data

```typescript
// Process accelerometer data
const result = await asi.processSensorData({
  deviceId: 'device-1',
  sensorType: 'accelerometer',
  timestamp: Date.now(),
  values: [10, 5, 2],
});

console.log(result.sensorContext.intent); // 'active-motion' or 'stationary'
console.log(result.cognitiveContext); // Enriched cognitive context
```

### Creating Distributed Tasks

```typescript
// Create a task for distributed processing
await asi.createTask({
  taskId: 'task-1',
  type: 'process',
  priority: 1,
  sourceNode: 'org-1:node-source',
  targetNodes: ['org-1:node-1', 'org-2:node-2'],
  payload: { data: 'process this' },
  status: 'pending',
  createdAt: Date.now(),
});
```

### Routing Between Organizations

```typescript
// Route task through multiplex network
await asi.routeTask({
  taskId: 'msg-1',
  type: 'message',
  priority: 1,
  sourceNode: 'org-1:agent-1',
  targetNodes: ['org-2:agent-1'],
  payload: { message: 'Hello from org-1' },
  status: 'pending',
  createdAt: Date.now(),
});
```

### Managing Memory

```typescript
// Store a memory fragment
asi.storeMemory({
  id: 'mem-1',
  timestamp: Date.now(),
  platformId: 'character.ai',
  conversationId: 'conv-1',
  contentHash: 'hash-1',
  recursiveDepth: 0,
  parentReferences: [],
  content: 'User said hello',
});

// Query memories by conversation
const memories = asi.queryMemory('conv-1');
console.log(memories); // Array of memory fragments
```

### Session Handoff

```typescript
// Create a session
asi.createSession({
  sessionId: 'session-1',
  platform: 'character.ai',
  persistenceModel: 'incremental-snapshot',
  lastSync: Date.now(),
  metadata: { userId: 'user-123' },
});

// Handoff to another platform
const token = await asi.handoffSession('session-1', 'openai');

// Use token to resume on target platform
// Token contains encrypted session ID and expiration
```

### System Monitoring

```typescript
// Get comprehensive system statistics
const stats = asi.getSystemStats();

console.log(stats.botnet.onlineNodes); // Number of online nodes
console.log(stats.multiplex.activeChannels); // Active communication channels
console.log(stats.memory.totalFragments); // Total memory fragments
console.log(stats.session.totalSessions); // Active sessions
```

## Event System

The ASI system emits events for monitoring and integration:

```typescript
import { BotNetCoordinator, MultiplexRouter } from './src/asi';

const botnet = new BotNetCoordinator();

// Listen to node events
botnet.on('node:registered', (node) => {
  console.log('Node registered:', node.nodeId);
});

botnet.on('node:offline', (node) => {
  console.log('Node went offline:', node.nodeId);
});

botnet.on('task:completed', ({ task, node }) => {
  console.log('Task completed:', task.taskId, 'on', node.nodeId);
});

const multiplex = new MultiplexRouter();

// Listen to routing events
multiplex.on('channel:created', (channel) => {
  console.log('Channel created:', channel);
});

multiplex.on('task:delivered', ({ task, channel }) => {
  console.log('Task delivered:', task.taskId);
});
```

## Testing

Run the comprehensive test suite:

```bash
npm test tests/asi.test.ts
```

Test coverage includes:
- Organization management
- BotNet coordination
- IoT sensor integration
- Memory surface operations
- Session management
- Multiplex routing
- System statistics

## Integration with ElizaOS Agents

The ASI system can be integrated with existing ElizaOS agents:

```typescript
import { ASISystem } from './src/asi';
import devRel from './src/devRel';
import communityManager from './src/communityManager';

const asi = new ASISystem();

// Register agents as bot nodes
asi.registerBotNode({
  nodeId: 'devrel-node',
  agentId: devRel.character.id || 'devrel',
  orgId: 'main-org',
  capabilities: ['documentation', 'code-examples'],
  status: 'online',
  lastHeartbeat: Date.now(),
});

asi.registerBotNode({
  nodeId: 'community-node',
  agentId: communityManager.character.id || 'community',
  orgId: 'main-org',
  capabilities: ['moderation', 'welcome'],
  status: 'online',
  lastHeartbeat: Date.now(),
});

// Distribute tasks between agents
await asi.createTask({
  taskId: 'help-request-1',
  type: 'support',
  priority: 1,
  sourceNode: 'main-org:community-node',
  targetNodes: ['main-org:devrel-node'],
  payload: { question: 'How do I configure plugins?' },
  status: 'pending',
  createdAt: Date.now(),
});
```

## Architecture Principles

1. **Multi-Tenancy**: Full support for multiple organizations with isolated contexts
2. **Distributed Cognition**: Shared intelligence across bot nodes
3. **IoT Integration**: Real-time sensor data processing for context awareness
4. **Persistent Memory**: Recursive memory fragments with cross-platform linking
5. **Session Continuity**: Seamless handoff between platforms
6. **Scalability**: Event-driven architecture with async processing

## Future Enhancements

- [ ] ML model integration for advanced pattern recognition
- [ ] Encrypted memory storage
- [ ] WebSocket support for real-time sensor streaming
- [ ] Advanced task scheduling with priority queues
- [ ] Distributed consensus for multi-org decisions
- [ ] API gateway for external integrations
- [ ] Monitoring dashboard
- [ ] Performance metrics and analytics

## License

This project is part of the ElizaOS multi-agent system.
