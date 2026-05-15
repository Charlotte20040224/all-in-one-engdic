'use client'

import { useEffect, useState } from 'react'
import { SentenceCard } from '@/components/SentenceCard'
import { ModeTabs } from '@/components/ModeTabs'
import { prefetchAudio } from '@/lib/tts'
import { sentenceLevel } from '@/lib/sentenceSrs'
import { readFavorites } from '@/lib/favorites'
import type { SentenceEntry } from '@/lib/types'

type Filter = 'all' | 'due' | '0' | '1' | '2' | 'favorite'

export default function SentencesPage() {
  const [sentences, setSentences] = useState<SentenceEntry[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState<Date | null>(null)
  const [favoriteThai, setFavoriteThai] = useState<Set<string>>(new Set())

  useEffect(() => {
    setNow(new Date())
    setFavoriteThai(new Set(readFavorites().map(f => f.thai)))
    fetch('/api/sentences')
      .then(r => r.json())
      .then(data => {
        setSentences(data)
        setLoading(false)
        data.slice(0, 5).forEach((s: SentenceEntry) => prefetchAudio(s.thai))
      })
  }, [])

  const filtered = sentences.filter(s => {
    const matchSearch =
      !search ||
      s.thai.includes(search) ||
      s.zh?.toLowerCase().includes(search.toLowerCase()) ||
      s.pinyin?.toLowerCase().includes(search.toLowerCase())

    const level = sentenceLevel(s.repetitions, s.interval)
    const matchFilter =
      filter === 'all' ||
      (filter === 'due' && now !== null && new Date(s.nextReview) <= now) ||
      (filter === 'favorite' && favoriteThai.has(s.thai)) ||
      filter === String(level)

    return matchSearch && matchFilter
  })

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個句子嗎？')) return
    await fetch(`/api/sentences/${id}`, { method: 'DELETE' })
    setSentences(prev => prev.filter(s => s.id !== id))
  }

  const filterButtons: { key: Filter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'due', label: '待複習' },
    { key: '0', label: '不熟' },
    { key: '1', label: '還好' },
    { key: '2', label: '已掌握' },
    { key: 'favorite', label: '❤️ 收藏' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">句子庫</h1>
        <ModeTabs section="library" current="sentence" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} 個句子</span>
      </div>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜尋英文、中文或拼音…"
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <div className="flex gap-2 flex-wrap">
        {filterButtons.map(b => (
          <button
            key={b.key}
            onClick={() => setFilter(b.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === b.key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>沒有符合的句子</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(s => (
            <SentenceCard key={s.id} sentence={s} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
