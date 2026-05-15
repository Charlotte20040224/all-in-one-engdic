import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const logs = await prisma.activityLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 30,
  })

  // Calculate streak
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  const cursor = new Date(today)

  const logMap = new Map(logs.map(l => [l.date.toISOString().split('T')[0], l.reviewed]))

  while (true) {
    const key = cursor.toISOString().split('T')[0]
    if (logMap.has(key) && (logMap.get(key) ?? 0) > 0) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  // This week's progress (Mon-Sun)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))
  const weekLogs = logs.filter(l => new Date(l.date) >= weekStart)
  const weekTotal = weekLogs.reduce((sum, l) => sum + l.reviewed, 0)

  return NextResponse.json({ logs, streak, weekTotal })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, reviewed } = await req.json()
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  const log = await prisma.activityLog.upsert({
    where: { userId_date: { userId: session.user.id, date: d } },
    update: { reviewed: { increment: reviewed } },
    create: { userId: session.user.id, date: d, reviewed },
  })
  return NextResponse.json(log)
}
