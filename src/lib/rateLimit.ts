type RateLimiterOptions = {
  windowMs?: number
  limit?: number
}

type Bucket = {
  count: number
  resetAt: number
}

export function createRateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? 60_000
  const limit = options.limit ?? 60
  const buckets = new Map<string, Bucket>()

  function now() {
    return Date.now()
  }

  function getIpFromHeaders(headers: Headers | Record<string, string | string[] | undefined>) {
    const raw =
      (headers as any)?.get?.('x-forwarded-for') ??
      (Array.isArray((headers as any)['x-forwarded-for'])
        ? (headers as any)['x-forwarded-for'][0]
        : (headers as any)['x-forwarded-for']) ??
      'unknown'
    const str = String(raw || 'unknown')
    // x-forwarded-for can be a list: client, proxy1, proxy2
    return str.split(',')[0].trim() || 'unknown'
  }

  function checkKey(key: string) {
    const t = now()
    const bucket = buckets.get(key)
    if (!bucket || t >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: t + windowMs })
      return { allowed: true, remaining: limit - 1 }
    }
    if (bucket.count >= limit) {
      return { allowed: false, remaining: 0 }
    }
    bucket.count += 1
    return { allowed: true, remaining: limit - bucket.count }
  }

  function check(headers: Headers | Record<string, string | string[] | undefined>) {
    const ip = getIpFromHeaders(headers)
    return checkKey(ip)
  }

  return {
    check,
    checkKey,
  }
}

// Simple module-scoped rate limiter compatible with existing imports:
// rateLimit(key, limit, windowMs) -> { allowed, remaining }
const globalBuckets = new Map<string, Bucket>()
export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const t = Date.now()
  const b = globalBuckets.get(key)
  if (!b || t >= b.resetAt) {
    globalBuckets.set(key, { count: 1, resetAt: t + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  if (b.count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  b.count += 1
  return { allowed: true, remaining: limit - b.count }
}
