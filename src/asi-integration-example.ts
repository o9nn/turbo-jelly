/**
 * ASI Integration Example
 * Shows how to integrate ASI system with existing ElizaOS agents
 */

import ASISystem from './asi';
import type { BotNetNode, OrganizationContext } from './asi/types';

/**
 * Initialize ASI system for The Org
 */
export function initializeASIForOrg(): ASISystem {
  const asi = new ASISystem();

  // Register main organization
  const mainOrg: OrganizationContext = {
    orgId: 'the-org-main',
    name: 'The Org',
    tenantId: 'main-tenant',
    metadata: {
      description: 'Multi-agent ElizaOS organization',
      created: Date.now(),
    },
  };

  asi.registerOrganization(mainOrg);

  return asi;
}

/**
 * Register an agent as a bot node in the ASI network
 */
export function registerAgentAsBotNode(
  asi: ASISystem,
  agentId: string,
  agentName: string,
  capabilities: string[]
): void {
  const node: BotNetNode = {
    nodeId: `node-${agentId}`,
    agentId,
    orgId: 'the-org-main',
    capabilities,
    status: 'online',
    lastHeartbeat: Date.now(),
  };

  asi.registerBotNode(node);
}

/**
 * Example: Initialize ASI with all The Org agents
 */
export function initializeAllAgents(asi: ASISystem): void {
  // Community Manager (Eli5)
  registerAgentAsBotNode(asi, 'eli5', 'Community Manager', [
    'moderation',
    'welcome',
    'community-health',
    'user-timeout',
  ]);

  // Developer Relations (Eddy)
  registerAgentAsBotNode(asi, 'eddy', 'Developer Relations', [
    'documentation',
    'code-examples',
    'technical-support',
    'knowledge-base',
  ]);

  // Community Liaison (Ruby)
  registerAgentAsBotNode(asi, 'ruby', 'Community Liaison', [
    'cross-community',
    'knowledge-sharing',
    'topic-reports',
    'synergy-identification',
  ]);

  // Project Manager (Jimmy)
  registerAgentAsBotNode(asi, 'jimmy', 'Project Manager', [
    'project-coordination',
    'progress-tracking',
    'team-management',
    'checkin-coordination',
  ]);

  // Social Media Manager (Laura)
  registerAgentAsBotNode(asi, 'laura', 'Social Media Manager', [
    'content-creation',
    'social-media',
    'brand-consistency',
    'media-management',
  ]);
}

/**
 * Example usage in main application
 */
export function exampleASIUsage(): void {
  // Initialize ASI system
  const asi = initializeASIForOrg();

  // Register all agents
  initializeAllAgents(asi);

  // Listen to BotNet events
  const botnet = (asi as any).botnet;
  botnet.on('task:completed', ({ task, node }: any) => {
    console.log(`Task ${task.taskId} completed by ${node.nodeId}`);
  });

  botnet.on('node:offline', (node: any) => {
    console.log(`Node ${node.nodeId} went offline`);
  });

  // Example: Create a distributed task
  asi.createTask({
    taskId: `task-${Date.now()}`,
    type: 'support-request',
    priority: 1,
    sourceNode: 'the-org-main:node-eli5',
    targetNodes: ['the-org-main:node-eddy'],
    payload: {
      question: 'User needs help with plugin configuration',
      urgency: 'medium',
    },
    status: 'pending',
    createdAt: Date.now(),
  });

  // Get system stats
  const stats = asi.getSystemStats();
  console.log('ASI System Stats:', stats);
}

export default {
  initializeASIForOrg,
  registerAgentAsBotNode,
  initializeAllAgents,
  exampleASIUsage,
};
