/**
 * Session Management System
 * Handles persistent browser sessions and cross-platform synchronization
 */

import { SessionState } from '../types';

export class SessionManager {
  private sessions: Map<string, SessionState>;
  private syncInterval: number = 15000; // 15 seconds
  private syncTimers: Map<string, NodeJS.Timeout>;

  constructor() {
    this.sessions = new Map();
    this.syncTimers = new Map();
  }

  /**
   * Create or update a session
   */
  createSession(session: SessionState): void {
    this.sessions.set(session.sessionId, session);

    // Set up periodic sync
    this.setupSync(session.sessionId);
  }

  /**
   * Get session state
   */
  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Update session metadata
   */
  updateSession(sessionId: string, updates: Partial<SessionState>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.set(sessionId, { ...session, ...updates });
    }
  }

  /**
   * Setup periodic synchronization for a session
   */
  private setupSync(sessionId: string): void {
    // Clear existing timer
    const existingTimer = this.syncTimers.get(sessionId);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    // Create new sync timer
    const timer = setInterval(() => {
      this.syncSession(sessionId);
    }, this.syncInterval);

    this.syncTimers.set(sessionId, timer);
  }

  /**
   * Synchronize session state
   */
  private async syncSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Update last sync timestamp
    session.lastSync = Date.now();
    this.sessions.set(sessionId, session);

    // Emit sync event (can be listened to for actual sync operations)
    // In production, this would sync to persistent storage
  }

  /**
   * Generate handoff token for session transfer
   */
  generateHandoffToken(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const expirationTime = Date.now() + 3600000; // 1 hour
    const payload = `${sessionId}:${expirationTime}`;
    
    // In production, this should be encrypted and signed
    return Buffer.from(payload).toString('base64');
  }

  /**
   * Verify and extract session ID from handoff token
   */
  verifyHandoffToken(token: string): string {
    try {
      const payload = Buffer.from(token, 'base64').toString('utf-8');
      const [sessionId, expirationTime] = payload.split(':');

      if (Date.now() > parseInt(expirationTime)) {
        throw new Error('Token expired');
      }

      return sessionId;
    } catch (error) {
      throw new Error(`Invalid handoff token: ${error}`);
    }
  }

  /**
   * Transfer session to another platform
   */
  async handoffSession(sessionId: string, targetPlatform: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Generate handoff token
    const token = this.generateHandoffToken(sessionId);

    // Update session metadata
    this.updateSession(sessionId, {
      metadata: {
        ...session.metadata,
        lastHandoff: Date.now(),
        targetPlatform,
      },
    });

    return token;
  }

  /**
   * Resume session from handoff token
   */
  async resumeSession(token: string, platform: string): Promise<SessionState> {
    const sessionId = this.verifyHandoffToken(token);
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Update platform
    this.updateSession(sessionId, { platform });

    return session;
  }

  /**
   * Terminate a session
   */
  terminateSession(sessionId: string): void {
    // Clear sync timer
    const timer = this.syncTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.syncTimers.delete(sessionId);
    }

    // Remove session
    this.sessions.delete(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): SessionState[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get sessions by platform
   */
  getSessionsByPlatform(platform: string): SessionState[] {
    return Array.from(this.sessions.values()).filter(s => s.platform === platform);
  }

  /**
   * Get session statistics
   */
  getStats(): any {
    return {
      totalSessions: this.sessions.size,
      activeSyncs: this.syncTimers.size,
      sessionsByPlatform: this.groupByPlatform(),
    };
  }

  /**
   * Group sessions by platform
   */
  private groupByPlatform(): Record<string, number> {
    const groups: Record<string, number> = {};

    for (const session of this.sessions.values()) {
      groups[session.platform] = (groups[session.platform] || 0) + 1;
    }

    return groups;
  }

  /**
   * Cleanup expired sessions
   */
  cleanup(maxAge: number = 86400000): void {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastSync > maxAge) {
        this.terminateSession(sessionId);
      }
    }
  }
}
