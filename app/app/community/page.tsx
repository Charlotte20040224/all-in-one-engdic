'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'

type PostType = 'motivation' | 'goal' | 'note' | 'knowledge' | 'travel' | 'other'

interface PostUser {
  id: string
  name: string | null
  nickname: string | null
  email: string | null
  image: string | null
}

interface Post {
  id: string
  type: PostType[]
  content: string
  isPublic: boolean
  createdAt: string
  user: PostUser
  isOwn: boolean
  likeCount: number
  commentCount: number
  liked: boolean
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: PostUser
}

const TYPE_ORDER: PostType[] = ['motivation', 'goal', 'note', 'knowledge', 'travel', 'other']

const TYPE_META: Record<PostType, { label: string; emoji: string; placeholder: string }> = {
  motivation: {
    label: '學習動機',
    emoji: '💪',
    placeholder: '我學英文是因為... （例如：喜歡泰劇、想跟泰國朋友聊天、計畫去旅遊...）',
  },
  goal: {
    label: '學習目標',
    emoji: '🎯',
    placeholder: '我的學英文目標是... （例如：3個月後能夠自己點餐）',
  },
  note: {
    label: '學習心得',
    emoji: '📝',
    placeholder: '學英文的心得分享...',
  },
  knowledge: {
    label: '泰國小知識',
    emoji: '🇹🇭',
    placeholder: '你知道嗎？分享一個泰國小知識...',
  },
  travel: {
    label: '泰國旅遊心得',
    emoji: '✈️',
    placeholder: '分享你的泰國旅遊心得... （景點、美食、有趣的經驗...）',
  },
  other: {
    label: '其他',
    emoji: '💬',
    placeholder: '想說點什麼？分享一下吧...',
  },
}

const FILTERS: Array<{ key: 'all' | PostType; label: string }> = [
  { key: 'all', label: '全部' },
  ...TYPE_ORDER.map(t => ({ key: t, label: `${TYPE_META[t].emoji} ${TYPE_META[t].label}` })),
]

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return '剛剛'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} 分鐘前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小時前`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} 天前`
  const month = Math.floor(day / 30)
  if (month < 12) return `${month} 個月前`
  return `${Math.floor(month / 12)} 年前`
}

function displayName(user: PostUser) {
  return user.nickname || user.name || user.email?.split('@')[0] || '匿名用戶'
}

function avatarLetter(user: PostUser) {
  const src = user.nickname || user.name || user.email || '?'
  return src.trim().charAt(0).toUpperCase() || '?'
}

function avatarColor(user: PostUser) {
  const key = user.id || user.email || 'x'
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  const palette = [
    'bg-purple-500', 'bg-pink-500', 'bg-rose-500', 'bg-orange-500',
    'bg-amber-500', 'bg-emerald-500', 'bg-teal-500', 'bg-sky-500',
    'bg-blue-500', 'bg-indigo-500',
  ]
  return palette[h % palette.length]
}

function Avatar({ user, size = 'md' }: { user: PostUser; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
  const [imgFailed, setImgFailed] = useState(false)

  if (user.image && !imgFailed) {
    return (
      <img
        src={user.image}
        alt={displayName(user)}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 bg-gray-200 dark:bg-gray-700`}
      />
    )
  }

  return (
    <div className={`${sizeClass} ${avatarColor(user)} rounded-full text-white font-semibold flex items-center justify-center shrink-0`}>
      {avatarLetter(user)}
    </div>
  )
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | PostType>('all')
  const [showModal, setShowModal] = useState(false)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({})
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({})
  const [commentSubmitting, setCommentSubmitting] = useState<string | null>(null)
  const [menuOpenPost, setMenuOpenPost] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenPost(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const deletePost = useCallback(async (postId: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId))
        setCommentsByPost(prev => {
          const next = { ...prev }
          delete next[postId]
          return next
        })
        setConfirmDeleteId(null)
      }
    } finally {
      setDeleting(false)
    }
  }, [])

  const loadPosts = useCallback(async (type: 'all' | PostType) => {
    setLoading(true)
    try {
      const url = type === 'all' ? '/api/posts' : `/api/posts?type=${type}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts(filter)
  }, [filter, loadPosts])

  const loadComments = useCallback(async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/comments`)
    if (res.ok) {
      const data = await res.json()
      setCommentsByPost(prev => ({ ...prev, [postId]: data }))
    }
  }, [])

  const toggleComments = useCallback(async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
      return
    }
    setExpandedPost(postId)
    if (!commentsByPost[postId]) {
      await loadComments(postId)
    }
  }, [expandedPost, commentsByPost, loadComments])

  const toggleLike = useCallback(async (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const liked = !p.liked
      return { ...p, liked, likeCount: p.likeCount + (liked ? 1 : -1) }
    }))
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: data.liked, likeCount: data.likeCount } : p))
    } else {
      loadPosts(filter)
    }
  }, [filter, loadPosts])

  const submitComment = useCallback(async (postId: string) => {
    const content = (commentDraft[postId] || '').trim()
    if (!content || commentSubmitting === postId) return
    setCommentSubmitting(postId)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setCommentsByPost(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment],
        }))
        setCommentDraft(prev => ({ ...prev, [postId]: '' }))
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
      }
    } finally {
      setCommentSubmitting(null)
    }
  }, [commentDraft, commentSubmitting])

  const handleCreated = useCallback(async () => {
    setShowModal(false)
    await loadPosts(filter)
  }, [filter, loadPosts])

  const visiblePosts = useMemo(() => posts, [posts])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🌟 社群夢想牆</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">分享你的學英文心情，看看大家都在想什麼</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition shadow-sm"
        >
          ✏️ 分享
        </button>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        想修改顯示名稱？到 ⚙️{' '}
        <Link href="/app/settings" className="underline hover:text-purple-600 dark:hover:text-purple-300">
          設定
        </Link>
        {' '}裡更改暱稱
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
              filter === f.key
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">載入中...</div>
      ) : visiblePosts.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          還沒有貼文，第一個來分享吧！✨
        </div>
      ) : (
        <ul className="space-y-3">
          {visiblePosts.map(post => {
            const postTypes = TYPE_ORDER.filter(t => post.type.includes(t))
            const isExpanded = expandedPost === post.id
            const comments = commentsByPost[post.id] || []
            return (
              <li
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm relative"
              >
                {post.isOwn && (
                  <div
                    ref={menuOpenPost === post.id ? menuRef : null}
                    className="absolute top-3 right-3"
                  >
                    <button
                      onClick={() => setMenuOpenPost(prev => prev === post.id ? null : post.id)}
                      aria-label="貼文選項"
                      className={`px-2 py-0.5 rounded-lg text-lg leading-none transition ${
                        menuOpenPost === post.id
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      ⋯
                    </button>
                    {menuOpenPost === post.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-20">
                        <button
                          onClick={() => { setMenuOpenPost(null); setConfirmDeleteId(post.id) }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          🗑️ 刪除貼文
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Avatar user={post.user} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap pr-8">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {displayName(post.user)}
                      </span>
                      {postTypes.map(t => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200"
                        >
                          {TYPE_META[t].emoji} {TYPE_META[t].label}
                        </span>
                      ))}
                      {!post.isPublic && post.isOwn && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          🔒 私人
                        </span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        · {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {post.content}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1 transition ${
                          post.liked
                            ? 'text-rose-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-rose-500'
                        }`}
                      >
                        <span>{post.liked ? '❤️' : '🤍'}</span>
                        <span>{post.likeCount}</span>
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 transition"
                      >
                        <span>💬</span>
                        <span>{post.commentCount}</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                        {comments.length === 0 ? (
                          <p className="text-xs text-gray-400 dark:text-gray-500">還沒有留言</p>
                        ) : (
                          <ul className="space-y-2">
                            {comments.map(c => (
                              <li key={c.id} className="flex items-start gap-2">
                                <Avatar user={c.user} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {displayName(c.user)}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      {timeAgo(c.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                    {c.content}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex items-end gap-2">
                          <textarea
                            value={commentDraft[post.id] || ''}
                            onChange={e => setCommentDraft(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="留言..."
                            rows={1}
                            maxLength={300}
                            className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <button
                            onClick={() => submitComment(post.id)}
                            disabled={!((commentDraft[post.id] || '').trim()) || commentSubmitting === post.id}
                            className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            送出
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {showModal && (
        <PostModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !deleting && setConfirmDeleteId(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">刪除貼文</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              確定要刪除這篇貼文嗎？此動作無法還原，留言和按讚也會一併刪除。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40"
              >
                取消
              </button>
              <button
                onClick={() => deletePost(confirmDeleteId)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? '刪除中...' : '刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PostModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [types, setTypes] = useState<PostType[]>(['motivation'])
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleType = (t: PostType) => {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const placeholder = useMemo(() => {
    const first = TYPE_ORDER.find(t => types.includes(t))
    return first ? TYPE_META[first].placeholder : '想說點什麼？分享一下吧...'
  }, [types])

  const submit = async () => {
    const trimmed = content.trim()
    if (types.length === 0) {
      setError('請至少選一個分類')
      return
    }
    if (!trimmed) {
      setError('內容不能為空')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: types, content: trimmed, isPublic }),
      })
      if (res.ok) {
        onCreated()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || '發文失敗')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">分享你的想法</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
            aria-label="關閉"
          >
            ×
          </button>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">選擇分類（可複選）</p>
          <div className="flex flex-wrap gap-2">
            {TYPE_ORDER.map(k => {
              const active = types.includes(k)
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleType(k)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                    active
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {TYPE_META[k].emoji} {TYPE_META[k].label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={placeholder}
            rows={5}
            maxLength={300}
            className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="mt-1 flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
            <span>{error && <span className="text-rose-500">{error}</span>}</span>
            <span>{content.length}/300</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsPublic(p => !p)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
              isPublic
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {isPublic ? '🌍 公開' : '🔒 私人'}
          </button>
          <button
            onClick={submit}
            disabled={submitting || !content.trim()}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {submitting ? '送出中...' : '送出'}
          </button>
        </div>
      </div>
    </div>
  )
}
