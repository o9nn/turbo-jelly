/**
 * Org2Org Multiplex System
 * Handles communication multiplexing between organizations
 */

import { MultiplexChannel, OrganizationContext, DistributedTask } from '../types';
import { EventEmitter } from 'events';

export class MultiplexRouter extends EventEmitter {
  private channels: Map<string, MultiplexChannel>;
  private organizations: Map<string, OrganizationContext>;
  private messageQueue: DistributedTask[];

  constructor() {
    super();
    this.channels = new Map();
    this.organizations = new Map();
    this.messageQueue = [];
  }

  /**
   * Register an organization in the multiplex network
   */
  registerOrganization(org: OrganizationContext): void {
    this.organizations.set(org.orgId, org);
    this.emit('org:registered', org);
  }

  /**
   * Create a multiplex channel between organizations
   */
  createChannel(
    sourceOrgId: string,
    targetOrgId: string,
    channelType: MultiplexChannel['channelType']
  ): string {
    const channelId = `${sourceOrgId}->${targetOrgId}:${channelType}`;
    
    const channel: MultiplexChannel = {
      sourceOrgId,
      targetOrgId,
      channelType,
      status: 'active',
    };

    this.channels.set(channelId, channel);
    this.emit('channel:created', channel);

    return channelId;
  }

  /**
   * Route a message through the multiplex network
   */
  async route(task: DistributedTask): Promise<void> {
    // Validate source and target organizations exist
    const sourceOrg = this.organizations.get(task.sourceNode.split(':')[0]);
    
    if (!sourceOrg) {
      throw new Error(`Source organization not found: ${task.sourceNode}`);
    }

    // Find appropriate channels for routing
    const channels = this.findChannels(task);
    
    if (channels.length === 0) {
      // Queue message if no channels available
      this.messageQueue.push(task);
      this.emit('task:queued', task);
      return;
    }

    // Route through first available channel
    const channel = channels[0];
    this.emit('task:routing', { task, channel });

    // Simulate async routing
    setTimeout(() => {
      this.emit('task:delivered', { task, channel });
    }, 10);
  }

  /**
   * Find channels for routing a task
   */
  private findChannels(task: DistributedTask): MultiplexChannel[] {
    const sourceOrgId = task.sourceNode.split(':')[0];
    const targetOrgIds = task.targetNodes.map(node => node.split(':')[0]);

    const activeChannels: MultiplexChannel[] = [];

    for (const targetOrgId of targetOrgIds) {
      const channelId = `${sourceOrgId}->${targetOrgId}:agent2agent`;
      const channel = this.channels.get(channelId);

      if (channel && channel.status === 'active') {
        activeChannels.push(channel);
      }
    }

    return activeChannels;
  }

  /**
   * Broadcast message to all organizations
   */
  async broadcast(task: DistributedTask): Promise<void> {
    const sourceOrgId = task.sourceNode.split(':')[0];

    // Create broadcast task for each organization
    for (const [orgId, org] of this.organizations.entries()) {
      if (orgId !== sourceOrgId) {
        const broadcastTask: DistributedTask = {
          ...task,
          targetNodes: [`${orgId}:broadcast`],
          taskId: `${task.taskId}-${orgId}`,
        };

        await this.route(broadcastTask);
      }
    }
  }

  /**
   * Get channel status
   */
  getChannelStatus(channelId: string): MultiplexChannel | undefined {
    return this.channels.get(channelId);
  }

  /**
   * Pause a channel
   */
  pauseChannel(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.status = 'paused';
      this.emit('channel:paused', channel);
    }
  }

  /**
   * Resume a channel
   */
  resumeChannel(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.status = 'active';
      this.emit('channel:resumed', channel);

      // Process queued messages
      this.processQueue();
    }
  }

  /**
   * Process queued messages
   */
  private async processQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const task = this.messageQueue.shift();
      if (task) {
        await this.route(task);
      }
    }
  }

  /**
   * Get multiplex statistics
   */
  getStats(): any {
    return {
      organizations: this.organizations.size,
      channels: this.channels.size,
      activeChannels: Array.from(this.channels.values()).filter(
        c => c.status === 'active'
      ).length,
      queuedTasks: this.messageQueue.length,
    };
  }
}
