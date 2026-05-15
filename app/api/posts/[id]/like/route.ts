import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: postId } = await params
  const userId = session.user.id

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, isPublic: true, userId: true } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!post.isPublic && post.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
  } else {
    await prisma.like.create({ data: { userId, postId } })
  }

  const likeCount = await prisma.like.count({ where: { postId } })
  return NextResponse.json({ liked: !existing, likeCount })
}
