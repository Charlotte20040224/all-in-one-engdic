'use client'

import { useEffect, useState } from 'react'
import {
  isFavorited,
  toggleFavorite,
  isFavoritedWord,
  toggleFavoriteWord,
  type FavoriteSentence,
  type FavoriteWord,
} from '@/lib/favorites'

type Kind = 'sentence' | 'word'

interface SentenceProps {
  kind?: 'sentence'
  entry: Omit<FavoriteSentence, 'addedAt'>
  className?: string
  size?: 'sm' | 'md'
}

interface WordProps {
  kind: 'word'
  entry: Omit<FavoriteWord, 'savedAt'>
  className?: string
  size?: 'sm' | 'md'
}

type Props = SentenceProps | WordProps

export function FavoriteButton(props: Props) {
  const { entry, className = '', size = 'sm' } = props
  const kind: Kind = props.kind ?? 'sentence'
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(kind === 'word' ? isFavoritedWord(entry.english) : isFavorited(entry.english))
  }, [entry.english, kind])

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (kind === 'word') {
      const { added } = toggleFavoriteWord(entry as Omit<FavoriteWord, 'savedAt'>)
      setActive(added)
    } else {
      const { added } = toggleFavorite(entry as Omit<FavoriteSentence, 'addedAt'>)
      setActive(added)
    }
  }

  const sizeClass = size === 'md' ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'

  return (
    <button
      type="button"
      onClick={handle}
      title={active ? '取消收藏' : '收藏'}
      className={`inline-flex items-center justify-center rounded-full transition ${sizeClass} ${
        active
          ? 'bg-pink-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-600 dark:hover:text-pink-300'
      } ${className}`}
    >
      {active ? '❤️' : '♡'}
    </button>
  )
}
