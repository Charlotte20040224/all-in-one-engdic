'use client'

import { useEffect, useRef, useState } from 'react'
import { SpeakButton } from '@/components/SpeakButton'
import { ClickableThai } from '@/components/ClickableThai'
import { ModeTabs } from '@/components/ModeTabs'
import { prefetchAudio } from '@/lib/tts'
import { srsLabel, srsColor } from '@/lib/srs'
import { bumpStudyLog } from '@/lib/studyLog'
import type { WordEntry, WordRef, VocabItem } from '@/lib/types'

type Rating = 'hard' | 'ok' | 'easy'
type ReviewMode = 'flip' | 'fill'

const REVIEW_MODE_KEY = 'review-mode'
const SWIPE_THRESHOLD = 80

const BLANK_PLACEHOLDER = '____'

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildBlankedSentence(thai: string, target: string): string {
  if (!target) return thai
  return thai.replace(new RegExp(escapeRegExp(target), 'g'), BLANK_PLACEHOLDER)
}

function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, '').trim()
}

const RATING_TOAST: Record<Rating, string> = {
  hard: '✅ 已標記為「不熟」，明天複習',
  ok: '✅ 已標記為「還好」，3 天後複習',
  easy: '✅ 已標記為「已掌握」，7 天後複習',
}

export default function ReviewPage() {
  const [queue, setQueue] = useState<WordEntry[]>([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [processing, setProcessing] = useState(false)
  const [highlightRating, setHighlightRating] = useState<Rating | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [mode, setMode] = useState<ReviewMode>('flip')
  const [fillInput, setFillInput] = useState('')
  const [fillResult, setFillResult] = useState<'correct' | 'wrong' | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const gestureDir = useRef<'swipe' | 'scroll' | null>(null)
  const swipedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(REVIEW_MODE_KEY)
    if (saved === 'fill' || saved === 'flip') setMode(saved)
  }, [])

  const switchMode = (next: ReviewMode) => {
    setMode(next)
    if (typeof window !== 'undefined') localStorage.setItem(REVIEW_MODE_KEY, next)
    setFillInput('')
    setFillResult(null)
    setFlipped(false)
  }

  useEffect(() => {
    fetch('/api/words')
      .then(r => r.json())
      .then(words => {
        const now = new Date()
        const due = words.filter((w: WordEntry) => new Date(w.nextReview) <= now)
        setQueue(due)
        setLoading(false)
      })
  }, [])

  const word = queue[current]

  // Prefetch audio for current card and next card whenever the index changes
  useEffect(() => {
    if (!word) return
    const examples = (word.examples as any[]) ?? []
    prefetchAudio(word.thai)
    if (examples[0]?.thai) prefetchAudio(examples[0].thai)
    const next = queue[current + 1]
    if (next) prefetchAudio(next.thai)
  }, [current, queue, word])

  const rate = (rating: Rating) => {
    if (!word || processing) return
    setProcessing(true)
    setHighlightRating(rating)
    setToast(RATING_TOAST[rating])
    setDragOffset({ x: 0, y: 0 })

    fetch(`/api/words/${word.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    }).catch(err => console.error('rate error:', err))
    bumpStudyLog({ reviewed: 1 })

    setTimeout(() => setHighlightRating(null), 300)

    setTimeout(() => {
      setToast(null)
      if (current + 1 >= queue.length) {
        setDone(true)
      } else {
        setCurrent(c => c + 1)
        setFlipped(false)
        setFillInput('')
        setFillResult(null)
      }
      setProcessing(false)
    }, 1500)
  }

  const submitFill = () => {
    if (!word) return
    const targetExample = (word.examples as any[])?.find(ex => ex?.thai?.includes(word.thai))
    if (!targetExample) return
    const expected = normalizeAnswer(targetExample.thai)
    const got = normalizeAnswer(fillInput)
    setFillResult(got === expected ? 'correct' : 'wrong')
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (!flipped || processing) return
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
    gestureDir.current = null
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current || !flipped || processing) return
    const t = e.touches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y

    if (!gestureDir.current) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      gestureDir.current = Math.abs(dx) > Math.abs(dy) || dy < -10 ? 'swipe' : 'scroll'
    }

    if (gestureDir.current === 'swipe') {
      setDragOffset({ x: dx, y: dy })
    }
  }

  const onTouchEnd = () => {
    if (!touchStart.current) {
      return
    }
    const { x, y } = dragOffset
    const absX = Math.abs(x)
    const absY = Math.abs(y)
    let triggered = false

    if (gestureDir.current === 'swipe') {
      if (absY > absX && y < -SWIPE_THRESHOLD) {
        rate('easy')
        triggered = true
      } else if (absX > absY && x < -SWIPE_THRESHOLD) {
        rate('hard')
        triggered = true
      } else if (absX > absY && x > SWIPE_THRESHOLD) {
        rate('ok')
        triggered = true
      }
    }

    if (triggered) {
      swipedRef.current = true
    } else {
      setDragOffset({ x: 0, y: 0 })
    }

    touchStart.current = null
    gestureDir.current = null
  }

  const onCardClick = () => {
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    if (processing) return
    setFlipped(f => !f)
  }

  if (loading) return <LoadingState />

  if (queue.length === 0) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">複習單字</h1>
          <ModeTabs section="review" current="word" />
        </div>
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">暫無待複習單字</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">繼續保持，下次複習的單字快到了！</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">複習單字</h1>
          <ModeTabs section="review" current="word" />
        </div>
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            複習完成！共複習 {queue.length} 張
          </h2>
          <button
            onClick={() => { setCurrent(0); setFlipped(false); setDone(false) }}
            className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            再來一次
          </button>
        </div>
      </div>
    )
  }

  const examples = (word.examples as any[]) ?? []
  const collocations = (word.collocations as any[]) ?? []
  const synonyms = (word.synonyms as any[]) ?? []
  const antonyms = (word.antonyms as any[]) ?? []

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">複習單字</h1>
        <ModeTabs section="review" current="word" />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{current + 1} / {queue.length}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${srsColor(word.srsLevel)}`}>
          {srsLabel(word.srsLevel)}
        </span>
      </div>

      {/* Review mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => switchMode('flip')}
          className={`py-2 rounded-lg text-sm font-medium transition border ${
            mode === 'flip'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          🔄 翻面模式
        </button>
        <button
          type="button"
          onClick={() => switchMode('fill')}
          className={`py-2 rounded-lg text-sm font-medium transition border ${
            mode === 'fill'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          ✏️ 句子填空
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          className="h-full bg-purple-500 rounded-full transition-all"
          style={{ width: `${((current) / queue.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      {mode === 'flip' && (
      <div
        className="flip-card min-h-[300px] cursor-pointer select-none"
        onClick={onCardClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`,
          transition: dragOffset.x === 0 && dragOffset.y === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        <div className={`flip-card-inner relative ${flipped ? 'flipped' : ''}`} style={{ minHeight: 300 }}>
          {/* Front */}
          <div className="flip-card-front absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 mb-3">
              <span data-thai className="text-4xl font-bold text-gray-900 dark:text-white">{word.thai}</span>
              <SpeakButton text={word.thai} size="md" />
            </div>
            {word.pos && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                {word.pos}
              </span>
            )}
            <p className="text-gray-400 dark:text-gray-500 mt-8 text-sm">點擊翻面</p>
          </div>

          {/* Back */}
          <div className="flip-card-back absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-1">
              <span data-thai className="text-2xl font-bold text-gray-900 dark:text-white">{word.thai}</span>
              <SpeakButton text={word.thai} size="md" />
            </div>
            <div data-pinyin className="text-purple-600 dark:text-purple-400 text-sm mb-1">{word.pinyin}</div>
            <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{word.meaning}</div>

            {examples.slice(0, 2).map((ex: any, i: number) => (
              <div key={i} className="mb-3 border-l-2 border-purple-300 dark:border-purple-700 pl-3">
                <div className="flex items-center gap-2">
                  <SpeakButton text={ex.thai} />
                  <span data-thai className="text-sm text-gray-800 dark:text-gray-200">{ex.thai}</span>
                </div>
                <div data-pinyin className="text-xs text-purple-600 dark:text-purple-400">{ex.pinyin}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{ex.zh}</div>
                {ex.vocabulary && ex.vocabulary.length > 0 && (
                  <div className="mt-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded">
                    <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">📝 單字</div>
                    <div className="divide-y divide-amber-200 dark:divide-amber-800">
                      {ex.vocabulary.map((v: VocabItem, vi: number) => (
                        <div key={vi} className="py-1 first:pt-0 last:pb-0 flex items-start gap-1.5">
                          <SpeakButton text={v.thai} size="sm" className="mt-0.5 shrink-0" />
                          <div>
                            <ClickableThai text={v.thai} className="text-xs font-medium text-gray-800 dark:text-gray-200" />
                            <div data-pinyin className="text-xs text-orange-500 dark:text-orange-400">{v.pinyin}</div>
                            <div className="text-xs text-amber-700 dark:text-amber-300">{v.meaning}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {ex.grammar && (
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                    📐 <span className="font-semibold">句型</span>　{ex.grammar}
                  </div>
                )}
              </div>
            ))}

            {collocations.filter((c: WordRef) => c.thai).length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-400">搭配詞：</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {collocations.filter((c: WordRef) => c.thai).map((c: WordRef, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      <SpeakButton text={c.thai} />
                      <span data-thai className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">{c.thai}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {word.note && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">💡 {word.note}</div>
            )}

            <a
              href={`https://youglish.com/pronounce/${encodeURIComponent(word.thai)}/english`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-3"
            >
              🎬 YouGlish
            </a>
          </div>
        </div>
      </div>
      )}

      {/* Fill-in-the-blank mode */}
      {mode === 'fill' && (() => {
        const targetExample = (word.examples as any[])?.find(ex => ex?.thai?.includes(word.thai))
        if (!targetExample) {
          return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">這個單字沒有可用的例句，無法進行填空</p>
              <button
                type="button"
                onClick={() => switchMode('flip')}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
              >
                改用翻面模式
              </button>
            </div>
          )
        }
        const blanked = buildBlankedSentence(targetExample.thai, word.thai)
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">把空格填回去，輸入完整的英文句子</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white" data-thai>
              {blanked}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{targetExample.zh}</div>
            <input
              type="text"
              value={fillInput}
              onChange={e => { setFillInput(e.target.value); setFillResult(null) }}
              onKeyDown={e => e.key === 'Enter' && fillResult !== 'correct' && submitFill()}
              placeholder="輸入完整英文…"
              disabled={fillResult === 'correct'}
              data-thai
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
            />
            {fillResult === null && (
              <button
                type="button"
                onClick={submitFill}
                disabled={!fillInput.trim()}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition"
              >
                送出
              </button>
            )}
            {fillResult === 'correct' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
                ✅ 答對了！正確答案：<span data-thai className="font-medium">{targetExample.thai}</span>
              </div>
            )}
            {fillResult === 'wrong' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300 space-y-2">
                <div>
                  ❌ 答錯了，正確答案：<span data-thai className="font-medium">{targetExample.thai}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setFillInput(''); setFillResult(null) }}
                  className="text-xs underline"
                >
                  再試一次
                </button>
              </div>
            )}
          </div>
        )
      })()}

      {/* Rating buttons */}
      {((mode === 'flip' && flipped) || (mode === 'fill' && fillResult === 'correct')) && (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => rate('hard')}
            disabled={processing}
            className={`py-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed ${
              highlightRating === 'hard' ? 'ring-2 ring-yellow-500 ring-offset-2 dark:ring-offset-gray-900 scale-105 bg-yellow-200 dark:bg-yellow-900/60' : ''
            }`}
          >
            不熟 <span className="text-xs opacity-70">+1天</span>
          </button>
          <button
            onClick={() => rate('ok')}
            disabled={processing}
            className={`py-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed ${
              highlightRating === 'ok' ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 scale-105 bg-blue-200 dark:bg-blue-900/60' : ''
            }`}
          >
            還好 <span className="text-xs opacity-70">+3天</span>
          </button>
          <button
            onClick={() => rate('easy')}
            disabled={processing}
            className={`py-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed ${
              highlightRating === 'easy' ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900 scale-105 bg-green-200 dark:bg-green-900/60' : ''
            }`}
          >
            熟悉 <span className="text-xs opacity-70">+7天</span>
          </button>
        </div>
      )}

      {mode === 'flip' && flipped && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          也可滑動：← 不熟｜→ 還好｜↑ 已掌握
        </p>
      )}

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-gray-700 text-white px-4 py-3 rounded-lg shadow-lg text-sm whitespace-nowrap pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
    </div>
  )
}
