'use client'

import { useState } from 'react'
import { speak } from '@/lib/tts'

interface Props {
  text: string
  className?: string
  size?: 'sm' | 'md'
}

export function SpeakButton({ text, className = '', size = 'sm' }: Props) {
  const [playing, setPlaying] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (playing) return
    setPlaying(true)
    try {
      await speak(text)
    } finally {
      setPlaying(false)
    }
  }

  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'

  return (
    <button
      onClick={handleClick}
      disabled={playing}
      title={`發音: ${text}`}
      className={`inline-flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition disabled:opacity-50 ${sizeClass} ${className}`}
    >
      {playing ? '…' : '🔊'}
    </button>
  )
}
