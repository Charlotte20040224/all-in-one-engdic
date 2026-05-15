import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const raw = typeof body?.nickname === 'string' ? body.nickname : ''
  const trimmed = raw.trim()

  if (trimmed.length > 20) {
    return NextResponse.json({ error: 'Nickname too long (max 20)' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { nickname: trimmed === '' ? null : trimmed },
    select: { id: true, nickname: true, name: true },
  })

  return NextResponse.json(user)
}
