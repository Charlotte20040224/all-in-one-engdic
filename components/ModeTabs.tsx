'use client'

import Link from 'next/link'

type Mode = 'word' | 'sentence'
type Section = 'add' | 'library' | 'review'

interface Props {
  section: Section
  current: Mode
}

const ROUTES: Record<Section, Record<Mode, string>> = {
  add: { word: '/app/add', sentence: '/app/sentence/add' },
  library: { word: '/app/words', sentence: '/app/sentences' },
  review: { word: '/app/review', sentence: '/app/sentence/review' },
}

export function ModeTabs({ section, current }: Props) {
  const active = 'bg-purple-600 text-white shadow'
  const inactive = 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'

  return (
    <div className="inline-flex rounded-lg p-1 bg-gray-100 dark:bg-gray-900/40 mb-4">
      <Link
        href={ROUTES[section].word}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${current === 'word' ? active : inactive}`}
      >
        📚 單字
      </Link>
      <Link
        href={ROUTES[section].sentence}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${current === 'sentence' ? active : inactive}`}
      >
        📝 句子
      </Link>
    </div>
  )
}
