interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

const memoryBuckets = new Map<string, RateLimitRecord>();

/**
 * Clears all in‑memory rate‑limit buckets. Intended for development only.
 */
export function clearRateLimits() {
  memoryBuckets.clear();
}

/**
 * Refunds a token to the rate-limit bucket if an operation failed due to
 * server-side/database infrastructure issues (not a bad user credential).
 */
export function refundRateLimit(key: string, amount: number = 1): void {
  const record = memoryBuckets.get(key);
  if (record) {
    record.tokens = Math.min(5, record.tokens + amount);
  }
}

export interface RateLimitConfig {
  maxTokens: number;
  refillRatePerSecond: number;
}

/**
 * In-memory sliding token-bucket rate limiter.
 * Ideal for Server Actions & API routes to prevent brute-force attacks and abuse.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxTokens: 5, refillRatePerSecond: 0.1 } // 5 tokens, refills 1 token every 10s
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  let record = memoryBuckets.get(key);

  if (!record) {
    record = { tokens: config.maxTokens, lastRefill: now };
    memoryBuckets.set(key, record);
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

  const missingTokens = 1 - record.tokens;
  const retryAfterSeconds = Math.ceil(missingTokens / config.refillRatePerSecond);

  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds,
  };
}

