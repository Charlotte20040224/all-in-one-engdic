'use client'

import { useState } from 'react'

interface Props {
  onShare: () => Promise<void> | void
  label?: string
  className?: string
  variant?: 'primary' | 'subtle'
}

export function ShareButton({ onShare, label = '分享', className = '', variant = 'primary' }: Props) {
  const [busy, setBusy] = useState(false)

  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      await onShare()
    } finally {
      setBusy(false)
    }
  }

  const base = 'inline-flex items-center justify-center gap-1.5 transition disabled:opacity-60'
  const styles = variant === 'subtle'
    ? 'text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline-offset-2 hover:underline'
    : 'px-3 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:opacity-90'

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className={`${base} ${styles} ${className}`}
    >
      {busy ? '產生中…' : <>{label} 📤</>}
    </button>
  )
}
