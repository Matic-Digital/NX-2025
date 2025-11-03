import crypto from 'crypto';

// Simple in-memory session store (in production, use Redis or database)
export const sessions = new Map<string, {
  userId: string;
  createdAt: number;
  lastAccess: number;
  userAgent?: string;
  ipAddress?: string;
}>();

export const userSessions = new Map<string, Set<string>>(); // userId -> Set of sessionIds
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const MAX_CONCURRENT_SESSIONS = 3;

// Generate cryptographically secure session ID
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate session and check timeout
export function isValidSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  
  const now = Date.now();
  if (now - session.lastAccess > SESSION_TIMEOUT) {
    // Session expired, clean up
    sessions.delete(sessionId);
    const userSessionSet = userSessions.get(session.userId);
    if (userSessionSet) {
      userSessionSet.delete(sessionId);
      if (userSessionSet.size === 0) {
        userSessions.delete(session.userId);
      }
    }
    return false;
  }
  
  // Update last access time
  session.lastAccess = now;
  return true;
}

// Clean up old sessions for a user and enforce concurrent session limits
export function enforceSessionLimits(userId: string, newSessionId: string) {
  let userSessionSet = userSessions.get(userId);
  if (!userSessionSet) {
    userSessionSet = new Set();
    userSessions.set(userId, userSessionSet);
  }
  
  // Remove expired sessions
  const validSessions = new Set<string>();
  for (const sessionId of userSessionSet) {
    if (isValidSession(sessionId)) {
      validSessions.add(sessionId);
    }
  }
  
  // If we're at the limit, remove the oldest session
  if (validSessions.size >= MAX_CONCURRENT_SESSIONS) {
    const sessionEntries = Array.from(validSessions).map(id => ({
      id,
      session: sessions.get(id)!
    })).sort((a, b) => a.session.lastAccess - b.session.lastAccess);
    
    // Remove oldest sessions to make room
    const toRemove = sessionEntries.slice(0, validSessions.size - MAX_CONCURRENT_SESSIONS + 1);
    for (const { id } of toRemove) {
      sessions.delete(id);
      validSessions.delete(id);
    }
  }
  
  // Add new session
  validSessions.add(newSessionId);
  userSessions.set(userId, validSessions);
}
