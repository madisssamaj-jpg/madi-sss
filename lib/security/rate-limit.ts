interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
  lockedUntil?: number;
}

const memoryBuckets = new Map<string, RateLimitRecord>();

/**
 * Clears all in‑memory rate‑limit buckets. Intended for development only.
 */
export function clearRateLimits() {
  memoryBuckets.clear();
}

/**
 * Resets the rate limit for a specific key upon successful login.
 */
export function resetRateLimit(key: string): void {
  memoryBuckets.delete(key);
}

/**
 * Refunds a token to the rate-limit bucket if an operation failed due to
 * server-side/database infrastructure issues (not a bad user credential).
 */
export function refundRateLimit(key: string, amount: number = 1): void {
  const record = memoryBuckets.get(key);
  if (record) {
    record.tokens = Math.min(5, record.tokens + amount);
    if (record.lockedUntil) {
      delete record.lockedUntil;
    }
  }
}

export interface RateLimitConfig {
  maxTokens: number;
  refillRatePerSecond: number;
  lockoutDurationSeconds?: number;
}

/**
 * In-memory sliding token-bucket rate limiter with lockout support.
 * Ideal for Server Actions & API routes to prevent brute-force attacks and abuse.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxTokens: 5, refillRatePerSecond: 0.2, lockoutDurationSeconds: 60 }
): { allowed: boolean; remaining: number; retryAfterSeconds: number; isLocked?: boolean } {
  const now = Date.now();
  let record = memoryBuckets.get(key);

  if (!record) {
    record = { tokens: config.maxTokens, lastRefill: now };
    memoryBuckets.set(key, record);
  }

  // If currently locked out, check if lockout duration has expired
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      isLocked: true,
    };
  } else if (record.lockedUntil && record.lockedUntil <= now) {
    record.tokens = config.maxTokens;
    record.lastRefill = now;
    delete record.lockedUntil;
  }

  // Refill tokens based on elapsed time
  const elapsedSeconds = (now - record.lastRefill) / 1000;
  record.tokens = Math.min(config.maxTokens, record.tokens + elapsedSeconds * config.refillRatePerSecond);
  record.lastRefill = now;

  if (record.tokens >= 1) {
    record.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(record.tokens),
      retryAfterSeconds: 0,
    };
  }

  // Exhausted tokens -> trigger lockout window (default 15 minutes = 900s)
  const lockoutSeconds = config.lockoutDurationSeconds || 900;
  record.lockedUntil = now + lockoutSeconds * 1000;

  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: lockoutSeconds,
    isLocked: true,
  };
}

