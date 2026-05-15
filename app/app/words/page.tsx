'use client'

import { useEffect, useState } from 'react'
import { WordCard } from '@/components/WordCard'
import { ModeTabs } from '@/components/ModeTabs'
import { srsLabel } from '@/lib/srs'
import { prefetchAudio } from '@/lib/tts'
import { readFavoriteWords } from '@/lib/favorites'
import type { WordEntry } from '@/lib/types'

type Filter = 'all' | 'due' | '0' | '1' | '2' | 'favorite'

export default function WordsPage() {
  const [words, setWords] = useState<WordEntry[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState<Date | null>(null)
  const [favoriteThai, setFavoriteThai] = useState<Set<string>>(new Set())

  useEffect(() => {
    setNow(new Date())
    setFavoriteThai(new Set(readFavoriteWords().map(f => f.english)))
    fetch('/api/words')
      .then(r => r.json())
      .then(data => {
        setWords(data)
        setLoading(false)
        data.slice(0, 5).forEach((w: WordEntry) => prefetchAudio(w.english))
      })
  }, [])

  const filtered = words.filter(w => {
    const matchSearch =
      !search ||
      w.english.includes(search) ||
      w.meaning?.toLowerCase().includes(search.toLowerCase()) ||
      w.ipa?.toLowerCase().includes(search.toLowerCase())

    const matchFilter =
      filter === 'all' ||
      (filter === 'due' && now !== null && new Date(w.nextReview) <= now) ||
      (filter === 'favorite' && favoriteThai.has(w.english)) ||
      filter === String(w.srsLevel)

    return matchSearch && matchFilter
  })

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個單字嗎？')) return
    await fetch(`/api/words/${id}`, { method: 'DELETE' })
    setWords(prev => prev.filter(w => w.id !== id))
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">單字庫</h1>
        <ModeTabs section="library" current="word" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} 個單字</span>
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
          <p>沒有符合的單字</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(w => (
            <WordCard key={w.id} word={w} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
