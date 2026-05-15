'use client'

import { useState } from 'react'

interface Props {
  text: string
  className?: string
  size?: 'sm' | 'md'
}

export function CopyButton({ text, className = '', size = 'sm' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // Clipboard API can fail on insecure contexts; silently ignore.
    }
  }

  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'

  return (
    <button
      onClick={handleClick}
      title={copied ? '已複製' : `複製: ${text}`}
      className={`inline-flex items-center justify-center rounded-full transition ${sizeClass} ${
        copied
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      } ${className}`}
    >
      {copied ? '✅' : '📋'}
    </button>
  )
}
