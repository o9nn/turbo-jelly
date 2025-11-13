/**
 * ASI System Integration Tests
 * Tests for multi-tenant org2org multiplex IoT Android BotNet distributed cognitive architecture
 */

import { describe, it, expect, beforeEach } from 'vitest';
import ASISystem from '../src/asi';
import {
  OrganizationContext,
  BotNetNode,
  IoTSensorData,
  DistributedTask,
  MemoryFragment,
  SessionState,
} from '../src/asi/types';

describe('ASI System Integration Tests', () => {
  let asiSystem: ASISystem;

  beforeEach(() => {
    asiSystem = new ASISystem();
  });

  describe('Organization Management', () => {
    it('should register an organization', () => {
      const org: OrganizationContext = {
        orgId: 'org-1',
        name: 'Test Organization',
        tenantId: 'tenant-1',
        metadata: { region: 'us-east' },
      };

      asiSystem.registerOrganization(org);
      const stats = asiSystem.getSystemStats();
      
      expect(stats.multiplex.organizations).toBe(1);
    });

    it('should register multiple organizations', () => {
      const orgs: OrganizationContext[] = [
        { orgId: 'org-1', name: 'Org 1', tenantId: 'tenant-1', metadata: {} },
        { orgId: 'org-2', name: 'Org 2', tenantId: 'tenant-2', metadata: {} },
        { orgId: 'org-3', name: 'Org 3', tenantId: 'tenant-3', metadata: {} },
      ];

      orgs.forEach(org => asiSystem.registerOrganization(org));
      const stats = asiSystem.getSystemStats();
      
      expect(stats.multiplex.organizations).toBe(3);
    });
  });

  describe('BotNet Coordination', () => {
    it('should register a bot node', () => {
      const node: BotNetNode = {
        nodeId: 'node-1',
        agentId: 'agent-1',
        orgId: 'org-1',
        capabilities: ['processing', 'storage'],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      asiSystem.registerBotNode(node);
      const stats = asiSystem.getSystemStats();
      
      expect(stats.botnet.totalNodes).toBe(1);
      expect(stats.botnet.onlineNodes).toBe(1);
    });

    it('should create and process a distributed task', async () => {
      const node: BotNetNode = {
        nodeId: 'node-1',
        agentId: 'agent-1',
        orgId: 'org-1',
        capabilities: ['processing'],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      asiSystem.registerBotNode(node);

      const task: DistributedTask = {
        taskId: 'task-1',
        type: 'process',
        priority: 1,
        sourceNode: 'org-1:node-source',
        targetNodes: ['org-1:node-1'],
        payload: { data: 'test' },
        status: 'pending',
        createdAt: Date.now(),
      };

      await asiSystem.createTask(task);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 200));

      const stats = asiSystem.getSystemStats();
      expect(stats.botnet.completedTasks).toBeGreaterThan(0);
    });
  });

  describe('IoT Sensor Integration', () => {
    it('should process accelerometer data', async () => {
      const sensorData: IoTSensorData = {
        deviceId: 'device-1',
        sensorType: 'accelerometer',
        timestamp: Date.now(),
        values: [10, 5, 2],
      };

      const result = await asiSystem.processSensorData(sensorData);
      
      expect(result.sensorContext).toBeDefined();
      expect(result.sensorContext.intent).toBeDefined();
      expect(result.cognitiveContext).toBeDefined();
    });

    it('should process proximity sensor data', async () => {
      const sensorData: IoTSensorData = {
        deviceId: 'device-1',
        sensorType: 'proximity',
        timestamp: Date.now(),
        values: [3],
      };

      const result = await asiSystem.processSensorData(sensorData);
      
      expect(result.sensorContext.presence).toBe('near');
    });

    it('should process location data', async () => {
      const sensorData: IoTSensorData = {
        deviceId: 'device-1',
        sensorType: 'location',
        timestamp: Date.now(),
        values: [37.7749, -122.4194],
      };

      const result = await asiSystem.processSensorData(sensorData);
      
      expect(result.sensorContext.location).toBeDefined();
      expect(result.sensorContext.location.lat).toBe(37.7749);
      expect(result.sensorContext.location.lng).toBe(-122.4194);
    });
  });

  describe('Memory Surface', () => {
    it('should store and retrieve memory fragments', () => {
      const fragment: MemoryFragment = {
        id: 'mem-1',
        timestamp: Date.now(),
        platformId: 'test',
        conversationId: 'conv-1',
        contentHash: 'hash-1',
        recursiveDepth: 0,
        parentReferences: [],
        content: 'Test memory content',
      };

      asiSystem.storeMemory(fragment);
      const memories = asiSystem.queryMemory('conv-1');
      
      expect(memories.length).toBe(1);
      expect(memories[0].id).toBe('mem-1');
    });

    it('should maintain conversation memory chain', () => {
      const fragments: MemoryFragment[] = [
        {
          id: 'mem-1',
          timestamp: Date.now(),
          platformId: 'test',
          conversationId: 'conv-1',
          contentHash: 'hash-1',
          recursiveDepth: 0,
          parentReferences: [],
          content: 'First message',
        },
        {
          id: 'mem-2',
          timestamp: Date.now() + 1000,
          platformId: 'test',
          conversationId: 'conv-1',
          contentHash: 'hash-2',
          recursiveDepth: 1,
          parentReferences: ['mem-1'],
          content: 'Second message',
        },
        {
          id: 'mem-3',
          timestamp: Date.now() + 2000,
          platformId: 'test',
          conversationId: 'conv-1',
          contentHash: 'hash-3',
          recursiveDepth: 2,
          parentReferences: ['mem-2'],
          content: 'Third message',
        },
      ];

      fragments.forEach(f => asiSystem.storeMemory(f));
      const memories = asiSystem.queryMemory('conv-1');
      
      expect(memories.length).toBe(3);
      expect(memories[0].id).toBe('mem-1'); // Should be sorted by timestamp
    });
  });

  describe('Session Management', () => {
    it('should create and retrieve a session', () => {
      const session: SessionState = {
        sessionId: 'session-1',
        platform: 'character.ai',
        persistenceModel: 'incremental-snapshot',
        lastSync: Date.now(),
        metadata: { user: 'test-user' },
      };

      asiSystem.createSession(session);
      const stats = asiSystem.getSystemStats();
      
      expect(stats.session.totalSessions).toBe(1);
    });

    it('should handoff session between platforms', async () => {
      const session: SessionState = {
        sessionId: 'session-1',
        platform: 'character.ai',
        persistenceModel: 'incremental-snapshot',
        lastSync: Date.now(),
        metadata: {},
      };

      asiSystem.createSession(session);
      const token = await asiSystem.handoffSession('session-1', 'openai');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('Multiplex Routing', () => {
    it('should route task between organizations', async () => {
      const org1: OrganizationContext = {
        orgId: 'org-1',
        name: 'Source Org',
        tenantId: 'tenant-1',
        metadata: {},
      };

      const org2: OrganizationContext = {
        orgId: 'org-2',
        name: 'Target Org',
        tenantId: 'tenant-2',
        metadata: {},
      };

      asiSystem.registerOrganization(org1);
      asiSystem.registerOrganization(org2);

      const task: DistributedTask = {
        taskId: 'route-task-1',
        type: 'message',
        priority: 1,
        sourceNode: 'org-1:agent-1',
        targetNodes: ['org-2:agent-1'],
        payload: { message: 'Hello from org-1' },
        status: 'pending',
        createdAt: Date.now(),
      };

      await asiSystem.routeTask(task);

      // Wait for async routing
      await new Promise(resolve => setTimeout(resolve, 50));

      const stats = asiSystem.getSystemStats();
      expect(stats.multiplex.channels).toBeGreaterThan(0);
    });
  });

  describe('System Statistics', () => {
    it('should provide comprehensive system statistics', () => {
      const stats = asiSystem.getSystemStats();
      
      expect(stats.botnet).toBeDefined();
      expect(stats.multiplex).toBeDefined();
      expect(stats.memory).toBeDefined();
      expect(stats.session).toBeDefined();
    });

    it('should track system activity', async () => {
      // Register components
      const org: OrganizationContext = {
        orgId: 'org-1',
        name: 'Test Org',
        tenantId: 'tenant-1',
        metadata: {},
      };
      asiSystem.registerOrganization(org);

      const node: BotNetNode = {
        nodeId: 'node-1',
        agentId: 'agent-1',
        orgId: 'org-1',
        capabilities: ['processing'],
        status: 'online',
        lastHeartbeat: Date.now(),
      };
      asiSystem.registerBotNode(node);

      const session: SessionState = {
        sessionId: 'session-1',
        platform: 'test',
        persistenceModel: 'incremental-snapshot',
        lastSync: Date.now(),
        metadata: {},
      };
      asiSystem.createSession(session);

      const stats = asiSystem.getSystemStats();
      
      expect(stats.multiplex.organizations).toBe(1);
      expect(stats.botnet.totalNodes).toBe(1);
      expect(stats.session.totalSessions).toBe(1);
    });
  });
});
