'use client'

import { useEffect, useState } from 'react'
import { SpeakButton } from '@/components/SpeakButton'
import { ModeTabs } from '@/components/ModeTabs'
import { prefetchAudio } from '@/lib/tts'
import {
  sentenceLevel,
  sentenceLevelLabel,
  sentenceLevelColor,
} from '@/lib/sentenceSrs'
import type { SentenceEntry, VocabItem } from '@/lib/types'

export default function SentenceReviewPage() {
  const [queue, setQueue] = useState<SentenceEntry[]>([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sentences')
      .then(r => r.json())
      .then(sentences => {
        const now = new Date()
        const due = sentences.filter((s: SentenceEntry) => new Date(s.nextReview) <= now)
        setQueue(due)
        setLoading(false)
      })
  }, [])

  const sentence = queue[current]

  useEffect(() => {
    if (!sentence) return
    prefetchAudio(sentence.thai)
    const next = queue[current + 1]
    if (next) prefetchAudio(next.thai)
  }, [current, queue, sentence])

  const rate = async (rating: 'hard' | 'ok' | 'easy') => {
    if (!sentence) return
    await fetch(`/api/sentences/${sentence.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    })
    if (current + 1 >= queue.length) {
      setDone(true)
    } else {
      setCurrent(c => c + 1)
      setFlipped(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">複習句子</h1>
          <ModeTabs section="review" current="sentence" />
        </div>
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">暫無待複習句子</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">繼續保持，下次複習的句子快到了！</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">複習句子</h1>
          <ModeTabs section="review" current="sentence" />
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

  const vocabulary = (sentence.vocabulary as VocabItem[]) ?? []
  const level = sentenceLevel(sentence.repetitions, sentence.interval)

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">複習句子</h1>
        <ModeTabs section="review" current="sentence" />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{current + 1} / {queue.length}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sentenceLevelColor(level)}`}>
          {sentenceLevelLabel(level)}
        </span>
      </div>

      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          className="h-full bg-purple-500 rounded-full transition-all"
          style={{ width: `${(current / queue.length) * 100}%` }}
        />
      </div>

      <div className="flip-card min-h-[300px] cursor-pointer" onClick={() => setFlipped(f => !f)}>
        <div className={`flip-card-inner relative ${flipped ? 'flipped' : ''}`} style={{ minHeight: 300 }}>
          {/* Front */}
          <div className="flip-card-front absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 mb-3 flex-wrap justify-center">
              <SpeakButton text={sentence.thai} size="md" />
              <span data-thai className="text-2xl font-bold text-gray-900 dark:text-white break-words">
                {sentence.thai}
              </span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mt-8 text-sm">點擊翻面</p>
          </div>

          {/* Back */}
          <div className="flip-card-back absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <SpeakButton text={sentence.thai} size="md" />
              <span data-thai className="text-xl font-bold text-gray-900 dark:text-white break-words">
                {sentence.thai}
              </span>
            </div>
            <div data-pinyin className="text-purple-600 dark:text-purple-400 text-sm mb-1">{sentence.pinyin}</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{sentence.zh}</div>

            {sentence.grammar && (
              <div className="text-xs text-blue-700 dark:text-blue-300 mb-3 bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 rounded">
                <div className="font-semibold mb-0.5">📐 句型解析</div>
                <div className="whitespace-pre-wrap">{sentence.grammar}</div>
              </div>
            )}

            {vocabulary.length > 0 && (
              <div className="mb-2 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded divide-y divide-amber-200 dark:divide-amber-800">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 pb-1">📝 句中單字</div>
                {vocabulary.map((v, i) => (
                  <div key={i} className="py-1 flex items-start gap-1.5">
                    <SpeakButton text={v.thai} size="sm" className="mt-0.5 shrink-0" />
                    <div>
                      <span data-thai className="text-xs font-medium text-gray-800 dark:text-gray-200">{v.thai}</span>
                      <div data-pinyin className="text-xs text-orange-500 dark:text-orange-400">{v.pinyin}</div>
                      <div className="text-xs text-amber-700 dark:text-amber-300">{v.meaning}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <a
              href={`https://youglish.com/pronounce/${encodeURIComponent(sentence.thai)}/thai`}
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

      {flipped && (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => rate('hard')}
            className="py-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition"
          >
            不熟
          </button>
          <button
            onClick={() => rate('ok')}
            className="py-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
          >
            還好
          </button>
          <button
            onClick={() => rate('easy')}
            className="py-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition"
          >
            熟悉
          </button>
        </div>
      )}
    </div>
  )
}
