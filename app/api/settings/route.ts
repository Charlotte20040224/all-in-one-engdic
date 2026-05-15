import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id, dailyGoal: 10, ttsSpeed: 0.7 },
  })
  return NextResponse.json(settings)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const dailyGoal = Math.max(1, Math.min(500, Math.round(Number(body.dailyGoal) || 10)))
  const ttsSpeed = Math.max(0.25, Math.min(4.0, Number(body.ttsSpeed) || 0.7))

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { dailyGoal, ttsSpeed },
    create: { userId: session.user.id, dailyGoal, ttsSpeed },
  })
  return NextResponse.json(settings)
}
