import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findTooLongString, findTooLongJson } from '@/lib/validate'

function todayRangeTpe(): [Date, Date] {
  const now = new Date()
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const start = new Date(`${todayStr}T00:00:00+08:00`)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return [start, end]
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  const where: { userId: string; createdAt?: { gte: Date; lt: Date } } = { userId: session.user.id }
  if (date === 'today') {
    const [start, end] = todayRangeTpe()
    where.createdAt = { gte: start, lt: end }
  }

  const words = await prisma.word.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(words)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const tooLongStr = findTooLongString({
    thai: body.thai, pinyin: body.pinyin, meaning: body.meaning, pos: body.pos, note: body.note,
  })
  if (tooLongStr) return NextResponse.json({ error: `${tooLongStr} too long (max 200)` }, { status: 400 })

  const tooLongJ = findTooLongJson({
    examples: body.examples, collocations: body.collocations,
    synonyms: body.synonyms, antonyms: body.antonyms, variants: body.variants,
  })
  if (tooLongJ) return NextResponse.json({ error: `${tooLongJ} too large (max 50000)` }, { status: 400 })

  const word = await prisma.word.create({
    data: {
      userId: session.user.id,
      thai: body.thai,
      pinyin: body.pinyin ?? null,
      meaning: body.meaning ?? null,
      pos: body.pos ?? null,
      examples: body.examples ?? [],
      collocations: body.collocations ?? [],
      synonyms: body.synonyms ?? [],
      antonyms: body.antonyms ?? [],
      note: body.note ?? null,
    },
  })
  return NextResponse.json(word, { status: 201 })
}
