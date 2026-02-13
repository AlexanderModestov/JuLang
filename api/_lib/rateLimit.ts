/**
 * In-memory per-user rate limiter.
 * Keyed by `userId:endpoint`. Resets on cold start (per-instance only).
 * Upgrade path: Upstash Redis for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetAt: number // timestamp ms
}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  retryAfter?: number // seconds
}

const store = new Map<string, RateLimitEntry>()

// Preset limits per endpoint
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'teacher-chat': { maxRequests: 30, windowMs: 60_000 },
  conversation: { maxRequests: 30, windowMs: 60_000 },
  exercise: { maxRequests: 40, windowMs: 60_000 },
  grammar: { maxRequests: 40, windowMs: 60_000 },
  whisper: { maxRequests: 15, windowMs: 60_000 },
  'translate-word': { maxRequests: 60, windowMs: 60_000 },
}

/**
 * Check whether a request is within the rate limit.
 */
export function checkRateLimit(
  userId: string,
  endpoint: string,
  config?: RateLimitConfig
): RateLimitResult {
  const cfg = config ?? RATE_LIMITS[endpoint] ?? { maxRequests: 30, windowMs: 60_000 }
  const key = `${userId}:${endpoint}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + cfg.windowMs })
    return { allowed: true }
  }

  if (entry.count < cfg.maxRequests) {
    entry.count++
    return { allowed: true }
  }

  const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
  return { allowed: false, retryAfter }
}

// Periodic cleanup of expired entries (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60_000)
