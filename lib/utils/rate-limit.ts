/**
 * Simple in-memory rate limiter for serverless environments.
 *
 * Note: In production, replace with Redis/Upstash for persistence across
 * serverless cold starts. This implementation is sufficient for single-instance
 * or low-traffic deployments and provides protection against basic abuse.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Maximum requests allowed within the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export class RateLimiter {
  private map = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;

    // Periodically clean up expired entries to prevent memory leaks
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 10 * 60 * 1000);
    }
  }

  /**
   * Check if a key is rate limited. Returns true if limit exceeded.
   * Automatically increments the counter if not limited.
   */
  isLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.map.get(key);

    if (!entry || now > entry.resetAt) {
      this.map.set(key, { count: 1, resetAt: now + this.windowMs });
      return false;
    }

    if (entry.count >= this.maxRequests) {
      return true;
    }

    entry.count++;
    return false;
  }

  /** Remove expired entries */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.map) {
      if (now > entry.resetAt) {
        this.map.delete(key);
      }
    }
  }
}

// ============================================================================
// Pre-configured rate limiters
// ============================================================================

/** Rate limiter for free scan endpoint: 10 scans per hour per IP */
export const freeScanLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000,
});

/** Rate limiter for auth endpoints: 10 attempts per 15 minutes per IP */
export const authLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
});
