import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { grammarPatterns, type Category } from '@/data/grammarPatterns'
import { authOptions } from '@/lib/auth'
import { rateLimit, tooManyRequests } from '@/lib/rateLimit'

const VALID_CATEGORIES: Category[] = [
  'A_modal', 'B_tense', 'C_connector', 'D_question',
  'E_comparison', 'F_confusable', 'G_daily',
]

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const now = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.floor((now - start) / 86_400_000)
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimit('daily-pattern', session.user.id, 5, '1 m')
  if (!rl.success) return tooManyRequests(rl.reset)

  const url = new URL(req.url)
  const categoryParam = url.searchParams.get('category')
  const category = (VALID_CATEGORIES as string[]).includes(categoryParam ?? '')
    ? (categoryParam as Category)
    : null

  const pool = category
    ? grammarPatterns.filter(p => p.category === category)
    : grammarPatterns

  if (pool.length === 0) {
    return NextResponse.json({ error: 'No patterns for category' }, { status: 404 })
  }

  const today = new Date()
  const random = url.searchParams.get('random') === '1'
  const excludeParam = url.searchParams.get('exclude') ?? ''
  const excludeIds = new Set(
    excludeParam
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => Number.isFinite(n))
  )

  let pattern
  if (random) {
    const candidates = pool.filter(p => !excludeIds.has(p.id))
    if (candidates.length === 0) {
      return NextResponse.json({ error: 'No more patterns', exhausted: true }, { status: 404 })
    }
    pattern = candidates[Math.floor(Math.random() * candidates.length)]
  } else if (category) {
    // Per-category rotation: each category iterates from its own #1.
    const idx = dayOfYear(today) % pool.length
    pattern = pool[idx]
  } else {
    // Aggregate "all" rotation across the full pool.
    const idx = (dayOfYear(today) - 1 + pool.length) % pool.length
    pattern = pool[idx]
  }

  return NextResponse.json({
    pattern,
    date: today.toISOString().slice(0, 10),
    category: category ?? 'all',
    poolSize: pool.length,
  })
}
