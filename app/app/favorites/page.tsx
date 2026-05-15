'use client'

import { useEffect, useState } from 'react'
import { SpeakButton } from '@/components/SpeakButton'
import { CopyButton } from '@/components/CopyButton'
import { readFavorites, removeFavorite, type FavoriteSentence } from '@/lib/favorites'

export default function FavoritesPage() {
  const [list, setList] = useState<FavoriteSentence[]>([])

  useEffect(() => {
    setList(readFavorites())
  }, [])

  const onRemove = (english: string) => {
    setList(removeFavorite(english))
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">收藏例句</h1>

      {list.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-3">♡</div>
          <p>還沒收藏任何例句。看到喜歡的例句時，按一下 ♡ 就會出現在這裡。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(item => (
            <div key={item.english} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SpeakButton text={item.english} />
                    <CopyButton text={item.english} />
                    <span data-english className="text-base font-medium text-gray-900 dark:text-white break-words">
                      {item.english}
                    </span>
                  </div>
                  {item.ipa && (
                    <div data-ipa className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                      {item.ipa}
                    </div>
                  )}
                  {item.chinese && (
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{item.chinese}</div>
                  )}
                  {item.source && (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">來源：{item.source}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.english)}
                  title="移除收藏"
                  className="shrink-0 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/30 w-8 h-8 rounded-full transition"
                >
                  ♥
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
