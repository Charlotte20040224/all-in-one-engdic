import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_TYPES = ['motivation', 'goal', 'note', 'knowledge', 'travel', 'other'] as const
type PostType = typeof ALLOWED_TYPES[number]

function isPostType(v: unknown): v is PostType {
  return typeof v === 'string' && (ALLOWED_TYPES as readonly string[]).includes(v)
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const typeFilter = url.searchParams.get('type')
  const userId = session.user.id

  const posts = await prisma.post.findMany({
    where: {
      ...(typeFilter && isPostType(typeFilter) ? { type: { has: typeFilter } } : {}),
      OR: [
        { isPublic: true },
        { userId },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { id: true, name: true, nickname: true, email: true, image: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId }, select: { id: true } },
    },
  })

  const result = posts.map(p => ({
    id: p.id,
    type: p.type,
    content: p.content,
    isPublic: p.isPublic,
    createdAt: p.createdAt,
    user: p.user,
    isOwn: p.userId === userId,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    liked: p.likes.length > 0,
  }))

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const rawTypes = Array.isArray(body?.type) ? body.type : []
  const types = Array.from(new Set(rawTypes.filter(isPostType))) as PostType[]
  const content = String(body?.content ?? '').trim()
  const isPublic = body?.isPublic !== false

  if (types.length === 0) {
    return NextResponse.json({ error: 'At least one type required' }, { status: 400 })
  }
  if (!content) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }
  if (content.length > 300) {
    return NextResponse.json({ error: 'Content too long (max 300)' }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      type: types,
      content,
      isPublic,
    },
  })
  return NextResponse.json(post, { status: 201 })
}
