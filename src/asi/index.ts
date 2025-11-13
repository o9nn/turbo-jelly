/**
 * Multi-Tenant Org2Org Multiplex IoT Android BotNet Distributed Cognitive Architecture
 * Main ASI Integration Module
 */

import { CognitiveProcessor, BotNetCoordinator } from './cognitive';
import { IoTSensorFusion } from './iot';
import { MultiplexRouter } from './multiplex';
import { MemorySurface } from './memory';
import { SessionManager } from './session';
import {
  OrganizationContext,
  BotNetNode,
  IoTSensorData,
  DistributedTask,
  MemoryFragment,
  SessionState,
} from './types';

/**
 * ASI System - Main orchestrator for distributed cognitive architecture
 */
export class ASISystem {
  private cognitive: CognitiveProcessor;
  private botnet: BotNetCoordinator;
  private iot: IoTSensorFusion;
  private multiplex: MultiplexRouter;
  private memory: MemorySurface;
  private session: SessionManager;

  constructor() {
    this.cognitive = new CognitiveProcessor();
    this.botnet = new BotNetCoordinator();
    this.iot = new IoTSensorFusion();
    this.multiplex = new MultiplexRouter();
    this.memory = new MemorySurface();
    this.session = new SessionManager();

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for cross-module communication
   */
  private setupEventHandlers(): void {
    // BotNet events
    this.botnet.on('task:completed', ({ task, node }) => {
      this.handleTaskCompleted(task, node);
    });

    // Multiplex events
    this.multiplex.on('task:delivered', ({ task, channel }) => {
      this.handleMessageDelivered(task, channel);
    });
  }

  /**
   * Register an organization
   */
  registerOrganization(org: OrganizationContext): void {
    this.multiplex.registerOrganization(org);
  }

  /**
   * Register a bot node
   */
  registerBotNode(node: BotNetNode): void {
    this.botnet.registerNode(node);
  }

  /**
   * Process IoT sensor data
   */
  async processSensorData(data: IoTSensorData): Promise<any> {
    const sensorContext = await this.iot.processSensorData(data);

    // Integrate with cognitive processing
    const cognitiveContext = await this.cognitive.process(data.deviceId, {
      sensorContext,
      deviceId: data.deviceId,
      platformId: 'iot',
    });

    return { sensorContext, cognitiveContext };
  }

  /**
   * Create a distributed task
   */
  async createTask(task: DistributedTask): Promise<void> {
    await this.botnet.createTask(task);
  }

  /**
   * Route task through multiplex network
   */
  async routeTask(task: DistributedTask): Promise<void> {
    await this.multiplex.route(task);
  }

  /**
   * Store memory fragment
   */
  storeMemory(fragment: MemoryFragment): void {
    this.memory.store(fragment);
  }

  /**
   * Query memory by conversation
   */
  queryMemory(conversationId: string): MemoryFragment[] {
    return this.memory.queryByConversation(conversationId);
  }

  /**
   * Create session
   */
  createSession(session: SessionState): void {
    this.session.createSession(session);
  }

  /**
   * Handoff session to another platform
   */
  async handoffSession(sessionId: string, targetPlatform: string): Promise<string> {
    return await this.session.handoffSession(sessionId, targetPlatform);
  }

  /**
   * Get system statistics
   */
  getSystemStats(): any {
    return {
      botnet: this.botnet.getStats(),
      multiplex: this.multiplex.getStats(),
      memory: this.memory.getStats(),
      session: this.session.getStats(),
    };
  }

  /**
   * Handle completed task
   */
  private handleTaskCompleted(task: DistributedTask, node: BotNetNode): void {
    // Create memory fragment for completed task
    const fragment: MemoryFragment = {
      id: `task-${task.taskId}`,
      timestamp: Date.now(),
      platformId: 'botnet',
      conversationId: task.taskId,
      contentHash: task.taskId,
      recursiveDepth: 0,
      parentReferences: [],
      content: JSON.stringify({ task, node }),
    };

    this.memory.store(fragment);
  }

  /**
   * Handle delivered message
   */
  private handleMessageDelivered(task: DistributedTask, channel: any): void {
    // Log delivery in memory
    const fragment: MemoryFragment = {
      id: `delivery-${task.taskId}-${Date.now()}`,
      timestamp: Date.now(),
      platformId: 'multiplex',
      conversationId: task.taskId,
      contentHash: task.taskId,
      recursiveDepth: 0,
      parentReferences: [`task-${task.taskId}`],
      content: JSON.stringify({ task, channel }),
    };

    this.memory.store(fragment);
  }

  /**
   * Cleanup system resources
   */
  cleanup(): void {
    this.session.cleanup();
    this.memory.clear();
  }
}

// Export all modules
export * from './types';
export * from './cognitive';
export * from './iot';
export * from './multiplex';
export * from './memory';
export * from './session';

export default ASISystem;
