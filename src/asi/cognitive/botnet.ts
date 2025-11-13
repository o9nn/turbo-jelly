/**
 * BotNet Coordination System
 * Manages distributed bot nodes and task distribution
 */

import { BotNetNode, DistributedTask } from '../types';
import { EventEmitter } from 'events';

export class BotNetCoordinator extends EventEmitter {
  private nodes: Map<string, BotNetNode>;
  private tasks: Map<string, DistributedTask>;
  private heartbeatInterval: number = 30000; // 30 seconds
  private heartbeatTimers: Map<string, NodeJS.Timeout>;

  constructor() {
    super();
    this.nodes = new Map();
    this.tasks = new Map();
    this.heartbeatTimers = new Map();
  }

  /**
   * Register a bot node in the network
   */
  registerNode(node: BotNetNode): void {
    this.nodes.set(node.nodeId, node);
    this.emit('node:registered', node);

    // Setup heartbeat monitoring
    this.setupHeartbeat(node.nodeId);
  }

  /**
   * Unregister a bot node
   */
  unregisterNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      this.clearHeartbeat(nodeId);
      this.nodes.delete(nodeId);
      this.emit('node:unregistered', node);
    }
  }

  /**
   * Setup heartbeat monitoring for a node
   */
  private setupHeartbeat(nodeId: string): void {
    const timer = setInterval(() => {
      this.checkHeartbeat(nodeId);
    }, this.heartbeatInterval);

    this.heartbeatTimers.set(nodeId, timer);
  }

  /**
   * Clear heartbeat monitoring
   */
  private clearHeartbeat(nodeId: string): void {
    const timer = this.heartbeatTimers.get(nodeId);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(nodeId);
    }
  }

  /**
   * Check node heartbeat
   */
  private checkHeartbeat(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const timeSinceLastHeartbeat = Date.now() - node.lastHeartbeat;

    if (timeSinceLastHeartbeat > this.heartbeatInterval * 2) {
      // Mark node as offline if no heartbeat for 2 intervals
      node.status = 'offline';
      this.emit('node:offline', node);
    }
  }

  /**
   * Update node heartbeat
   */
  heartbeat(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.lastHeartbeat = Date.now();
      if (node.status === 'offline') {
        node.status = 'online';
        this.emit('node:online', node);
      }
    }
  }

  /**
   * Create and distribute a task
   */
  async createTask(task: DistributedTask): Promise<void> {
    this.tasks.set(task.taskId, task);
    this.emit('task:created', task);

    // Find capable nodes
    const capableNodes = this.findCapableNodes(task);

    if (capableNodes.length === 0) {
      task.status = 'failed';
      this.emit('task:failed', { task, reason: 'no_capable_nodes' });
      return;
    }

    // Select nodes based on priority and availability
    const selectedNodes = this.selectNodes(capableNodes, task);

    // Distribute task to selected nodes
    for (const node of selectedNodes) {
      await this.assignTask(task, node);
    }
  }

  /**
   * Find nodes capable of handling a task
   */
  private findCapableNodes(task: DistributedTask): BotNetNode[] {
    const capable: BotNetNode[] = [];

    for (const node of this.nodes.values()) {
      if (node.status !== 'online') continue;

      // Check if node has required capabilities
      const hasCapabilities = task.targetNodes.some(target =>
        target.includes(node.nodeId) || target.includes(node.orgId)
      );

      if (hasCapabilities) {
        capable.push(node);
      }
    }

    return capable;
  }

  /**
   * Select optimal nodes for task execution
   */
  private selectNodes(capableNodes: BotNetNode[], task: DistributedTask): BotNetNode[] {
    // Sort by priority (online, not busy)
    const sorted = capableNodes.sort((a, b) => {
      if (a.status === 'online' && b.status !== 'online') return -1;
      if (a.status !== 'online' && b.status === 'online') return 1;
      return 0;
    });

    // Return top nodes based on target count
    return sorted.slice(0, task.targetNodes.length);
  }

  /**
   * Assign task to a node
   */
  private async assignTask(task: DistributedTask, node: BotNetNode): Promise<void> {
    node.status = 'busy';
    this.emit('task:assigned', { task, node });

    // Simulate async task processing
    setTimeout(() => {
      this.completeTask(task.taskId, node.nodeId);
    }, 100);
  }

  /**
   * Complete a task
   */
  completeTask(taskId: string, nodeId: string): void {
    const task = this.tasks.get(taskId);
    const node = this.nodes.get(nodeId);

    if (task && node) {
      task.status = 'completed';
      task.completedAt = Date.now();
      node.status = 'online';

      this.emit('task:completed', { task, node });
    }
  }

  /**
   * Get nodes by organization
   */
  getNodesByOrg(orgId: string): BotNetNode[] {
    return Array.from(this.nodes.values()).filter(node => node.orgId === orgId);
  }

  /**
   * Get online nodes
   */
  getOnlineNodes(): BotNetNode[] {
    return Array.from(this.nodes.values()).filter(node => node.status === 'online');
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): DistributedTask[] {
    return Array.from(this.tasks.values()).filter(task => task.status === 'pending');
  }

  /**
   * Get network statistics
   */
  getStats(): any {
    const nodes = Array.from(this.nodes.values());
    const tasks = Array.from(this.tasks.values());

    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.status === 'online').length,
      busyNodes: nodes.filter(n => n.status === 'busy').length,
      offlineNodes: nodes.filter(n => n.status === 'offline').length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      processingTasks: tasks.filter(t => t.status === 'processing').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
    };
  }
}
