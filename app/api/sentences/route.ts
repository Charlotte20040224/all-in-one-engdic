import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findTooLongString, findTooLongJson } from '@/lib/validate'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sentences = await prisma.sentence.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sentences)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body?.english || !body?.ipa || !body?.zh) {
    return NextResponse.json({ error: 'english, ipa, zh required' }, { status: 400 })
  }

  const tooLongStr = findTooLongString({
    english: body.english, ipa: body.ipa, ipaUS: body.ipaUS, ipaGB: body.ipaGB,
    zh: body.zh, grammar: body.grammar, grammarPattern: body.grammarPattern,
  })
  if (tooLongStr) return NextResponse.json({ error: `${tooLongStr} too long (max 200)` }, { status: 400 })

  const tooLongJ = findTooLongJson({ vocabulary: body.vocabulary })
  if (tooLongJ) return NextResponse.json({ error: `${tooLongJ} too large (max 50000)` }, { status: 400 })

  const sentence = await prisma.sentence.create({
    data: {
      userId: session.user.id,
      english: body.english,
      ipa: body.ipa,
      ipaUS: body.ipaUS ?? null,
      ipaGB: body.ipaGB ?? null,
      zh: body.zh,
      grammar: body.grammar ?? null,
      grammarPattern: body.grammarPattern ?? null,
      vocabulary: body.vocabulary ?? [],
    },
  })
  return NextResponse.json(sentence, { status: 201 })
}
