'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SpeakButton } from './SpeakButton'

interface AnchorState {
  token: string
  x: number
  y: number
}

interface QuickResult {
  english: string
  ipa: string
  meaning: string
  pos?: string
  examples?: any[]
}

interface ContextValue {
  open: (token: string, x: number, y: number) => void
}

const Ctx = createContext<ContextValue | null>(null)

export function useQuickLookup() {
  return useContext(Ctx)
}

export function QuickLookupProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AnchorState | null>(null)
  const [result, setResult] = useState<QuickResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const reqIdRef = useRef(0)

  const close = () => {
    setState(null)
    setResult(null)
    setError('')
    setLoading(false)
    setSaving(false)
    setSaved(false)
    reqIdRef.current++
  }

  const fetchQuick = async (tok: string) => {
    setLoading(true)
    setError('')
    setResult(null)
    const myId = ++reqIdRef.current
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: tok, mode: 'quick' }),
      })
      const data = await res.json().catch(() => ({}))
      if (myId !== reqIdRef.current) return
      if (!res.ok || data?.error) {
        setError(data?.error || '查詢失敗，請再試一次 🙏')
        return
      }
      setResult({
        english: data.english,
        ipa: data.ipa,
        meaning: data.meaning,
        pos: data.pos,
        examples: data.examples,
      })
    } catch {
      if (myId !== reqIdRef.current) return
      setError('查詢失敗，請再試一次 🙏')
    } finally {
      if (myId === reqIdRef.current) setLoading(false)
    }
  }

  const open = (token: string, x: number, y: number) => {
    setSaving(false)
    setSaved(false)
    setState({ token, x, y })
    fetchQuick(token)
  }

  useEffect(() => {
    if (!state) return
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        close()
      }
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
      document.removeEventListener('keydown', onEsc)
    }
  }, [state])

  const save = async () => {
    if (!result || saving || saved) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          english: result.english,
          ipa: result.ipa,
          meaning: result.meaning,
          pos: result.pos ?? null,
          examples: result.examples ?? [],
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `儲存失敗 (${res.status})`)
      }
      setSaved(true)
      setTimeout(() => {
        if (popupRef.current) close()
      }, 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const goFull = () => {
    if (!state) return
    const tok = state.token
    close()
    router.push(`/app/add?q=${encodeURIComponent(tok)}`)
  }

  const popupStyle = state ? clampPosition(state.x, state.y) : null

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {state && popupStyle && (
        <div
          ref={popupRef}
          style={popupStyle}
          className="fixed z-50 bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400 rounded-xl shadow-lg"
          onTouchEnd={e => e.stopPropagation()}
        >
          <div className="relative p-4 pr-10 min-w-[260px] max-w-[90vw]">
            <button
              onClick={close}
              onTouchEnd={e => { e.preventDefault(); close() }}
              aria-label="關閉"
              className="absolute top-2 right-2 w-7 h-7 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-sm touch-manipulation"
            >
              ✕
            </button>

            {loading && (
              <div className="flex items-center gap-2 py-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-block w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                查詢「{state.token}」中…
              </div>
            )}

            {error && (
              <div className="text-sm text-amber-600 dark:text-amber-400 py-3">{error}</div>
            )}

            {result && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span data-english className="text-2xl font-bold text-gray-900 dark:text-white break-words">
                    {result.english}
                  </span>
                  <SpeakButton text={result.english} size="md" />
                </div>
                <div data-ipa className="text-purple-600 dark:text-purple-400">{result.ipa}</div>
                {result.pos && (
                  <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                    {result.pos}
                  </span>
                )}
                <div className="text-gray-800 dark:text-gray-200 font-medium">{result.meaning}</div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={save}
                    onTouchEnd={e => { e.preventDefault(); save() }}
                    disabled={saving || saved}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition touch-manipulation ${
                      saved
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                    }`}
                  >
                    {saved ? '✅ 已加入' : saving ? '儲存中…' : '💾 加入單字庫'}
                  </button>
                  <button
                    onClick={goFull}
                    onTouchEnd={e => { e.preventDefault(); goFull() }}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline touch-manipulation"
                  >
                    📖 查看完整內容 →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}

function clampPosition(x: number, y: number): React.CSSProperties {
  if (typeof window === 'undefined') return { top: y, left: x }
  const popupW = 320
  const popupH = 260
  const padding = 8
  const left = Math.max(padding, Math.min(x, window.innerWidth - popupW - padding))
  const top = Math.max(padding, Math.min(y, window.innerHeight - popupH - padding))
  return { top, left }
}
