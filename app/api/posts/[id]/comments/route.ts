import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: postId } = await params
  const userId = session.user.id

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, isPublic: true, userId: true } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!post.isPublic && post.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, nickname: true, email: true, image: true } },
    },
  })

  return NextResponse.json(comments)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: postId } = await params
  const userId = session.user.id
  const body = await req.json()
  const content = String(body?.content ?? '').trim()

  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })
  if (content.length > 300) return NextResponse.json({ error: 'Content too long (max 300)' }, { status: 400 })

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, isPublic: true, userId: true } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!post.isPublic && post.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const comment = await prisma.comment.create({
    data: { userId, postId, content },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  })
  return NextResponse.json(comment, { status: 201 })
}
