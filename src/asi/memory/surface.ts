/**
 * Memory Surface Implementation
 * Manages persistent distributed cognition across agents and platforms
 */

import { MemoryFragment } from '../types';

export class MemorySurface {
  private fragments: Map<string, MemoryFragment>;
  private indexByPlatform: Map<string, Set<string>>;
  private indexByConversation: Map<string, Set<string>>;
  private indexByParent: Map<string, Set<string>>;

  constructor() {
    this.fragments = new Map();
    this.indexByPlatform = new Map();
    this.indexByConversation = new Map();
    this.indexByParent = new Map();
  }

  /**
   * Store a memory fragment
   */
  store(fragment: MemoryFragment): void {
    this.fragments.set(fragment.id, fragment);

    // Update platform index
    if (!this.indexByPlatform.has(fragment.platformId)) {
      this.indexByPlatform.set(fragment.platformId, new Set());
    }
    this.indexByPlatform.get(fragment.platformId)!.add(fragment.id);

    // Update conversation index
    if (!this.indexByConversation.has(fragment.conversationId)) {
      this.indexByConversation.set(fragment.conversationId, new Set());
    }
    this.indexByConversation.get(fragment.conversationId)!.add(fragment.id);

    // Update parent references index
    fragment.parentReferences.forEach(parentId => {
      if (!this.indexByParent.has(parentId)) {
        this.indexByParent.set(parentId, new Set());
      }
      this.indexByParent.get(parentId)!.add(fragment.id);
    });
  }

  /**
   * Retrieve a memory fragment by ID
   */
  retrieve(id: string): MemoryFragment | undefined {
    return this.fragments.get(id);
  }

  /**
   * Query fragments by platform
   */
  queryByPlatform(platformId: string): MemoryFragment[] {
    const fragmentIds = this.indexByPlatform.get(platformId);
    if (!fragmentIds) return [];

    return Array.from(fragmentIds)
      .map(id => this.fragments.get(id))
      .filter((f): f is MemoryFragment => f !== undefined);
  }

  /**
   * Query fragments by conversation
   */
  queryByConversation(conversationId: string): MemoryFragment[] {
    const fragmentIds = this.indexByConversation.get(conversationId);
    if (!fragmentIds) return [];

    return Array.from(fragmentIds)
      .map(id => this.fragments.get(id))
      .filter((f): f is MemoryFragment => f !== undefined)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get child fragments (recursive)
   */
  getChildren(parentId: string): MemoryFragment[] {
    const childIds = this.indexByParent.get(parentId);
    if (!childIds) return [];

    return Array.from(childIds)
      .map(id => this.fragments.get(id))
      .filter((f): f is MemoryFragment => f !== undefined);
  }

  /**
   * Build recursive tree from a fragment
   */
  buildTree(rootId: string, maxDepth: number = 10): MemoryFragment[] {
    const tree: MemoryFragment[] = [];
    const visited = new Set<string>();

    const traverse = (fragmentId: string, depth: number) => {
      if (depth > maxDepth || visited.has(fragmentId)) return;

      const fragment = this.fragments.get(fragmentId);
      if (!fragment) return;

      visited.add(fragmentId);
      tree.push(fragment);

      const children = this.getChildren(fragmentId);
      children.forEach(child => traverse(child.id, depth + 1));
    };

    traverse(rootId, 0);
    return tree;
  }

  /**
   * Create snapshot of memory surface
   */
  snapshot(): { fragments: MemoryFragment[]; timestamp: number } {
    return {
      fragments: Array.from(this.fragments.values()),
      timestamp: Date.now(),
    };
  }

  /**
   * Restore from snapshot
   */
  restore(snapshot: { fragments: MemoryFragment[] }): void {
    this.clear();
    snapshot.fragments.forEach(fragment => this.store(fragment));
  }

  /**
   * Clear all memory fragments
   */
  clear(): void {
    this.fragments.clear();
    this.indexByPlatform.clear();
    this.indexByConversation.clear();
    this.indexByParent.clear();
  }

  /**
   * Get memory surface statistics
   */
  getStats(): any {
    return {
      totalFragments: this.fragments.size,
      platforms: this.indexByPlatform.size,
      conversations: this.indexByConversation.size,
      averageDepth: this.calculateAverageDepth(),
    };
  }

  /**
   * Calculate average recursion depth
   */
  private calculateAverageDepth(): number {
    if (this.fragments.size === 0) return 0;

    const depths = Array.from(this.fragments.values()).map(f => f.recursiveDepth);
    const sum = depths.reduce((acc, d) => acc + d, 0);
    return sum / depths.length;
  }
}
