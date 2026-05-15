import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, tooManyRequests, getClientIp } from '@/lib/rateLimit'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  const ip = getClientIp(req)
  const rl = await rateLimit('feedback', `ip:${ip}`, 5, '1 h')
  if (!rl.success) return tooManyRequests(rl.reset)

  const { type, rating, message } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })
  if (message.length > 2000) return NextResponse.json({ error: 'Message too long (max 2000)' }, { status: 400 })

  const feedback = await prisma.feedback.create({
    data: {
      userId: session?.user?.id ?? null,
      type: Array.isArray(type) ? type : [],
      rating: typeof rating === 'number' ? rating : null,
      message: message.trim(),
    },
  })

  // Email notification — fire-and-forget, don't block the response
  const stars = rating ? '⭐'.repeat(rating) : '（未評分）'
  const typeStr = (Array.isArray(type) && type.length > 0) ? type.join('、') : '（未選擇）'
  const userEmail = session?.user?.email
  const userEmailDisplay = userEmail ?? '（未登入）'
  const time = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })

  const isWish = Array.isArray(type) && type.includes('🌟 許願功能')
  const subject = isWish ? '🌟 新許願通知 - 英文單字 App' : '💬 新回饋通知 - 英文單字 App'

  const feedbackTo = process.env.FEEDBACK_TO
  if (!feedbackTo) {
    console.warn('[feedback] FEEDBACK_TO not set — skipping email notification')
    return NextResponse.json({ id: feedback.id })
  }

  transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: feedbackTo,
    ...(userEmail ? { replyTo: userEmail } : {}),
    subject,
    text: [
      `評分：${stars}`,
      `類型：${typeStr}`,
      `內容：${message.trim()}`,
      `時間：${time}`,
      `用戶 Email：${userEmailDisplay}`,
    ].join('\n'),
  }).catch(err => console.error('[feedback] email send failed:', err))

  return NextResponse.json({ id: feedback.id })
}
