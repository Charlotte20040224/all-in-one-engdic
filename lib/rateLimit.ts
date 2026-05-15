import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

type Window = `${number} ${'s' | 'm' | 'h' | 'd'}`

let cachedRedis: Redis | null = null
let envChecked = false
let envOk = false

function getRedis(): Redis | null {
  if (!envChecked) {
    envOk = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    envChecked = true
    if (!envOk) {
      console.warn('[rateLimit] KV_REST_API_URL/TOKEN not set — rate limiting disabled')
    }
  }
  if (!envOk) return null
  if (!cachedRedis) {
    cachedRedis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  }
  return cachedRedis
}

const limiterCache = new Map<string, Ratelimit>()

function getLimiter(name: string, limit: number, window: Window): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null
  const key = `${name}:${limit}:${window}`
  let limiter = limiterCache.get(key)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `rl:${name}`,
      analytics: false,
    })
    limiterCache.set(key, limiter)
  }
  return limiter
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function rateLimit(
  name: string,
  identifier: string,
  limit: number,
  window: Window
): Promise<RateLimitResult> {
  const limiter = getLimiter(name, limit, window)
  if (!limiter) {
    // No-op when env vars missing (local dev without Upstash configured)
    return { success: true, remaining: limit, reset: 0 }
  }
  try {
    const r = await limiter.limit(identifier)
    return { success: r.success, remaining: r.remaining, reset: r.reset }
  } catch (err) {
    // Fail-open: if Redis is unreachable, don't block the request
    console.error('[rateLimit] limiter error, failing open:', err)
    return { success: true, remaining: limit, reset: 0 }
  }
}

export function tooManyRequests(reset: number) {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
  return NextResponse.json(
    { error: '請求太頻繁，請稍後再試' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}
