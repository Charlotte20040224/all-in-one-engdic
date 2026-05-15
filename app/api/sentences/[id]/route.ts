import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nextSentenceSrsState, type Rating } from '@/lib/sentenceSrs'
import { findTooLongString, findTooLongJson } from '@/lib/validate'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.sentence.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let updateData: Record<string, unknown> = {}

  if (body.rating) {
    const { interval, easeFactor, repetitions, nextReview } = nextSentenceSrsState(
      {
        interval: existing.interval,
        easeFactor: existing.easeFactor,
        repetitions: existing.repetitions,
      },
      body.rating as Rating
    )
    updateData = { interval, easeFactor, repetitions, nextReview }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    await prisma.activityLog.upsert({
      where: { userId_date: { userId: session.user.id, date: today } },
      update: { reviewed: { increment: 1 } },
      create: { userId: session.user.id, date: today, reviewed: 1 },
    })
  } else {
    const tooLongStr = findTooLongString({
      thai: body.thai, pinyin: body.pinyin, zh: body.zh, grammar: body.grammar,
    })
    if (tooLongStr) return NextResponse.json({ error: `${tooLongStr} too long (max 200)` }, { status: 400 })

    const tooLongJ = findTooLongJson({ vocabulary: body.vocabulary })
    if (tooLongJ) return NextResponse.json({ error: `${tooLongJ} too large (max 50000)` }, { status: 400 })

    if (body.thai !== undefined) updateData.thai = body.thai
    if (body.pinyin !== undefined) updateData.pinyin = body.pinyin
    if (body.zh !== undefined) updateData.zh = body.zh
    if (body.grammar !== undefined) updateData.grammar = body.grammar
    if (body.vocabulary !== undefined) updateData.vocabulary = body.vocabulary
  }

  const sentence = await prisma.sentence.update({
    where: { id },
    data: updateData,
  })
  return NextResponse.json(sentence)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.sentence.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.sentence.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
