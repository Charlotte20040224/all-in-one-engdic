import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nextSrsState, type Rating } from '@/lib/srs'
import { findTooLongString, findTooLongJson } from '@/lib/validate'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.word.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let updateData: Record<string, unknown> = {}

  if (body.rating) {
    const { newLevel, nextReview } = nextSrsState(existing.srsLevel, body.rating as Rating)
    updateData = {
      srsLevel: newLevel,
      nextReview,
      lastReview: new Date(),
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    await prisma.activityLog.upsert({
      where: { userId_date: { userId: session.user.id, date: today } },
      update: { reviewed: { increment: 1 } },
      create: { userId: session.user.id, date: today, reviewed: 1 },
    })
  } else {
    const tooLongStr = findTooLongString({
      thai: body.thai, pinyin: body.pinyin, meaning: body.meaning, pos: body.pos, note: body.note,
    })
    if (tooLongStr) return NextResponse.json({ error: `${tooLongStr} too long (max 200)` }, { status: 400 })

    const tooLongJ = findTooLongJson({
      examples: body.examples, collocations: body.collocations,
      synonyms: body.synonyms, antonyms: body.antonyms,
    })
    if (tooLongJ) return NextResponse.json({ error: `${tooLongJ} too large (max 50000)` }, { status: 400 })

    if (body.thai !== undefined) updateData.thai = body.thai
    if (body.pinyin !== undefined) updateData.pinyin = body.pinyin
    if (body.meaning !== undefined) updateData.meaning = body.meaning
    if (body.pos !== undefined) updateData.pos = body.pos
    if (body.examples !== undefined) updateData.examples = body.examples
    if (body.collocations !== undefined) updateData.collocations = body.collocations
    if (body.synonyms !== undefined) updateData.synonyms = body.synonyms
    if (body.antonyms !== undefined) updateData.antonyms = body.antonyms
    if (body.note !== undefined) updateData.note = body.note
  }

  const word = await prisma.word.update({
    where: { id },
    data: updateData,
  })
  return NextResponse.json(word)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.word.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.word.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
