// Rate limiting utility: 5 attempts in 2 minutes
type AttemptRecord = {
  attempts: number;
  firstAttemptTime: number;
};

const attemptMap = new Map<string, AttemptRecord>();

const ATTEMPT_LIMIT = 5;
const TIME_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

export function getRateLimitKey(identifier: string): string {
  return identifier;
}

export function checkRateLimit(key: string): { allowed: boolean; remainingAttempts: number; resetTime?: number } {
  const now = Date.now();
  const record = attemptMap.get(key);

  if (!record) {
    // First attempt
    attemptMap.set(key, {
      attempts: 1,
      firstAttemptTime: now,
    });
    return { allowed: true, remainingAttempts: ATTEMPT_LIMIT - 1 };
  }

  const timeSinceFirstAttempt = now - record.firstAttemptTime;

  if (timeSinceFirstAttempt > TIME_WINDOW_MS) {
    // Window expired, reset
    attemptMap.set(key, {
      attempts: 1,
      firstAttemptTime: now,
    });
    return { allowed: true, remainingAttempts: ATTEMPT_LIMIT - 1 };
  }

  // Still within the time window
  if (record.attempts < ATTEMPT_LIMIT) {
    record.attempts++;
    return { allowed: true, remainingAttempts: ATTEMPT_LIMIT - record.attempts };
  }

  // Exceeded limit
  const resetTime = record.firstAttemptTime + TIME_WINDOW_MS;
  return { allowed: false, remainingAttempts: 0, resetTime };
}

export function resetRateLimit(key: string): void {
  attemptMap.delete(key);
}
