'use client'

import { useRouter } from 'next/navigation'
import { useQuickLookup } from './QuickLookupProvider'

interface Props {
  text: string
  className?: string
}

export function ClickableThai({ text, className = '' }: Props) {
  const router = useRouter()
  const ctx = useQuickLookup()

  const triggerAt = (token: string, target: HTMLElement) => {
    const t = token.trim()
    if (!t) return
    if (ctx) {
      const rect = target.getBoundingClientRect()
      ctx.open(t, rect.left, rect.bottom + 4)
    } else {
      router.push(`/app/add?q=${encodeURIComponent(t)}`)
    }
  }

  const tokens = text.split(/(\s+)/)

  return (
    <span data-thai className={className}>
      {tokens.map((tok, i) => {
        if (tok === '' || /^\s+$/.test(tok)) return <span key={i}>{tok}</span>
        return (
          <span
            key={i}
            role="button"
            tabIndex={0}
            onClick={e => {
              e.stopPropagation()
              triggerAt(tok, e.currentTarget as HTMLElement)
            }}
            onTouchEnd={e => {
              e.preventDefault()
              e.stopPropagation()
              triggerAt(tok, e.currentTarget as HTMLElement)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                triggerAt(tok, e.currentTarget as HTMLElement)
              }
            }}
            className="cursor-pointer touch-manipulation hover:underline hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title={`查詢「${tok}」`}
          >
            {tok}
          </span>
        )
      })}
    </span>
  )
}
