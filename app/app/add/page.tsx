'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SpeakButton } from '@/components/SpeakButton'
import { FavoriteButton } from '@/components/FavoriteButton'
import { ClickableWord } from '@/components/ClickableWord'
import { ModeTabs } from '@/components/ModeTabs'
import { ShareButton } from '@/components/ShareButton'
import { grammarPatterns, type GrammarPattern } from '@/data/grammarPatterns'
import { bumpStudyLog } from '@/lib/studyLog'
import { shareWordImage } from '@/lib/shareImage'
import { getIpaDisplay, type LookupResult } from '@/lib/types'

type LookupMode = 'quick' | 'full'

const SEARCH_HISTORY_KEY = 'search-history'
const SEARCH_HISTORY_LIMIT = 50

interface SearchHistoryEntry {
  query: string
  timestamp: number
  result: { english: string; ipa: string; chinese: string }
}

function readSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SearchHistoryEntry[]) : []
  } catch {
    return []
  }
}

function writeSearchHistory(entries: SearchHistoryEntry[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(entries))
  } catch {}
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '剛剛'
  if (m < 60) return `${m} 分鐘前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小時前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} 天前`
  const mo = Math.floor(d / 30)
  return `${mo} 個月前`
}

export default function AddPage() {
  return (
    <Suspense fallback={null}>
      <AddPageInner />
    </Suspense>
  )
}

function AddPageInner() {
  const searchParams = useSearchParams()
  const urlQuery = searchParams?.get('q') ?? ''
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<LookupMode>('quick')
  const [lastMode, setLastMode] = useState<LookupMode | null>(null)
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<SearchHistoryEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHistory(readSearchHistory())
  }, [])

  const recordHistory = (q: string, r: LookupResult) => {
    const entry: SearchHistoryEntry = {
      query: q,
      timestamp: Date.now(),
      result: { english: r.english, ipa: r.ipa ?? '', chinese: r.meaning ?? '' },
    }
    setHistory(prev => {
      const filtered = prev.filter(e => e.query !== q)
      const next = [entry, ...filtered].slice(0, SEARCH_HISTORY_LIMIT)
      writeSearchHistory(next)
      return next
    })
  }

  const removeHistoryAt = (idx: number) => {
    setHistory(prev => {
      const next = prev.filter((_, i) => i !== idx)
      writeSearchHistory(next)
      return next
    })
  }

  const clearHistory = () => {
    setHistory([])
    writeSearchHistory([])
  }

  const replayHistory = (entry: SearchHistoryEntry) => {
    setQuery(entry.query)
    lookup(undefined, entry.query)
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 3500)
    return () => clearTimeout(t)
  }, [error])

  useEffect(() => {
    const q = urlQuery.trim()
    if (!q) return
    setQuery(q)
    lookup(undefined, q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery])

  const FRIENDLY_ERROR = '目前查詢人數較多，請稍後再試 🙏'

  const lookup = async (modeOverride?: LookupMode, queryOverride?: string) => {
    const q = (queryOverride ?? query).trim()
    if (!q) return
    const m = modeOverride ?? mode
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, mode: m }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.error) {
        setError(data?.error || FRIENDLY_ERROR)
        return
      }
      setResult(data)
      setLastMode(m)
      recordHistory(q, data)
    } catch {
      setError(FRIENDLY_ERROR)
    } finally {
      setLoading(false)
    }
  }

  const upgradeToFull = () => {
    setMode('full')
    lookup('full')
  }

  const resetAndFocus = () => {
    setQuery('')
    setResult(null)
    setLastMode(null)
    setError('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const save = async () => {
    if (!result) return
    setSaving(true)
    try {
      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
      if (!res.ok) throw new Error('儲存失敗')
      bumpStudyLog({ learned: 1 })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('儲存失敗，請再試一次 🙏')
    } finally {
      setSaving(false)
    }
  }

  const collocations = result?.collocations?.filter(c => c.english) ?? []
  const synonyms    = result?.synonyms?.filter(s => s.english) ?? []
  const antonyms    = result?.antonyms?.filter(a => a.english) ?? []
  const related     = result?.related?.filter(r => r.english) ?? []
  const variants    = result?.variants?.filter(v => v.english) ?? []

  const frequencyBadge: Record<string, string> = {
    '最常用': 'bg-green-100 text-green-700',
    '常用':   'bg-blue-100 text-blue-700',
    '較少用': 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">新增單字</h1>
        <ModeTabs section="add" current="word" />
      </div>

      {/* Toast */}
      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium pointer-events-none">
          ✅ 已儲存到單字庫
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-amber-500 text-white rounded-xl shadow-lg text-sm font-medium pointer-events-none max-w-[90vw] text-center">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">輸入英文單字或中文意思，AI 將自動查詢詳細資訊</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`py-2 rounded-lg text-sm font-medium transition border ${
              mode === 'quick'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            ⚡ 快速查詢
          </button>
          <button
            type="button"
            onClick={() => setMode('full')}
            className={`py-2 rounded-lg text-sm font-medium transition border ${
              mode === 'full'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            📚 完整查詢
          </button>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            placeholder="例：hello 或 你好"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => lookup()}
            disabled={loading || !query.trim()}
            className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
          >
            {loading ? '查詢中…' : '查詢'}
          </button>
        </div>

        {/* Search history */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">查詢歷史</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{history.length} 筆</span>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-72 overflow-y-auto -mx-2">
              {history.map((entry, i) => (
                <li key={`${entry.timestamp}-${i}`} className="flex items-start gap-2 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                  <button
                    type="button"
                    onClick={() => replayHistory(entry)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span data-english className="text-sm font-medium text-gray-900 dark:text-white">{entry.result.english}</span>
                      {entry.result.ipa && (
                        <span data-ipa className="text-xs text-purple-600 dark:text-purple-400">{entry.result.ipa}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 truncate">{entry.result.chinese}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{relativeTime(entry.timestamp)}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeHistoryAt(i)}
                    title="刪除這筆"
                    className="shrink-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-sm w-6 h-6 flex items-center justify-center transition"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={clearHistory}
              className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
            >
              清除全部
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      {result && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span data-english className="text-3xl font-bold text-gray-900 dark:text-white">{result.english}</span>
              <SpeakButton text={result.english} size="md" />
              <FavoriteButton
                kind="word"
                size="md"
                entry={{
                  english: result.english,
                  ipa: result.ipa,
                  chinese: result.meaning,
                }}
              />
            </div>
            <div data-ipa className="text-purple-600 dark:text-purple-400 flex flex-wrap items-center gap-x-4 gap-y-1">
              {getIpaDisplay(result).map((p, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {p.label && <span className="text-base">{p.label}</span>}
                  <span>{p.ipa}</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{result.pos}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.meaning}</span>
            </div>

            {result.examples?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">例句</h4>
                <div className="space-y-3">
                  {result.examples.map((ex, i) => (
                    <div key={i} className="border-l-2 border-purple-300 dark:border-purple-700 pl-3">
                      <div className="flex items-center gap-2">
                        <SpeakButton text={ex.english} />
                        <span data-english className="text-sm text-gray-800 dark:text-gray-200">{ex.english}</span>
                      </div>
                      <div data-ipa className="text-xs text-purple-600 dark:text-purple-400">{ex.ipa}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{ex.zh}</div>
                      {ex.vocabulary && ex.vocabulary.length > 0 && (
                        <div className="mt-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded">
                          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">📝 單字</div>
                          <div className="divide-y divide-amber-200 dark:divide-amber-800">
                            {ex.vocabulary.map((v, vi) => (
                              <div key={vi} className="py-1 first:pt-0 last:pb-0 flex items-start gap-1.5">
                                <SpeakButton text={v.english} size="sm" className="mt-0.5 shrink-0" />
                                <div>
                                  <ClickableWord text={v.english} className="text-xs font-medium text-gray-800 dark:text-gray-200" />
                                  <div data-ipa className="text-xs text-orange-500 dark:text-orange-400">{v.ipa}</div>
                                  <div className="text-xs text-amber-700 dark:text-amber-300">{v.meaning}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {ex.grammar && (
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                          📐 <span className="font-semibold">句型</span>　{ex.grammar}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {collocations.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">搭配詞</h4>
                <div className="space-y-2">
                  {collocations.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <SpeakButton text={c.english} className="mt-0.5 shrink-0" />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0 flex-1">
                        <span data-english className="text-gray-800 dark:text-gray-200 break-words">{c.english}</span>
                        <span data-ipa className="text-gray-500 break-words">{c.ipa}</span>
                        <span className="text-gray-600 dark:text-gray-300 break-words">
                          <span className="hidden sm:inline">— </span>{c.zh}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {synonyms.length > 0 && (
              <RelatedWordList title="近義詞" items={synonyms} onLookup={t => { setQuery(t); lookup(undefined, t) }} />
            )}

            {antonyms.length > 0 && (
              <RelatedWordList title="反義詞" items={antonyms} onLookup={t => { setQuery(t); lookup(undefined, t) }} />
            )}

            {related.length > 0 && (
              <RelatedWordList title="同家族詞" items={related} onLookup={t => { setQuery(t); lookup(undefined, t) }} />
            )}

            {result.note && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                💡 {result.note}
              </div>
            )}

            {variants.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">📚 多種表達方式</h4>
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="flex flex-col gap-0.5 border-l-2 border-indigo-300 dark:border-indigo-700 pl-3">
                      <div className="flex items-center gap-2">
                        <SpeakButton text={v.english} />
                        <span data-english className="text-lg font-bold text-gray-900 dark:text-white">{v.english}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${frequencyBadge[v.frequency] ?? frequencyBadge['較少用']}`}>{v.frequency}</span>
                      </div>
                      <div data-ipa className="text-sm text-orange-500 dark:text-orange-400">{v.ipa}</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{v.meaning}</div>
                      {v.context && <div className="text-xs text-gray-400">{v.context}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <RelatedPatterns english={result.english} />

            <a
              href={`https://youglish.com/pronounce/${encodeURIComponent(result.english)}/english`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              🎬 在 YouGlish 聽真實發音
            </a>

            {lastMode === 'quick' && (
              <button
                onClick={upgradeToFull}
                disabled={loading}
                className="w-full mt-2 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-50 transition"
              >
                {loading ? '查詢中…' : '📚 查看完整資訊'}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {saving ? '儲存中…' : '儲存單字'}
            </button>
            <button
              onClick={resetAndFocus}
              className="w-full py-3 border-2 border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
            >
              🔍 查詢新單字
            </button>
            <div className="flex justify-center pt-1">
              <ShareButton
                label="分享到 IG"
                variant="subtle"
                onShare={() => shareWordImage({
                  english: result.english,
                  ipa: result.ipa,
                  pos: result.pos,
                  meaning: result.meaning,
                  example: result.examples?.[0]
                    ? {
                        english: result.examples[0].english,
                        ipa: result.examples[0].ipa,
                        zh: result.examples[0].zh,
                      }
                    : undefined,
                })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function RelatedWordList({
  title,
  items,
  onLookup,
}: {
  title: string
  items: { english: string; ipa: string; zh: string }[]
  onLookup: (english: string) => void
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map((item, i) => {
          const zh = (item.zh ?? '').trim()
          return (
            <div key={i} className="flex items-start gap-2 text-sm">
              <SpeakButton text={item.english} className="mt-0.5 shrink-0" />
              <button
                type="button"
                onClick={() => onLookup(item.english)}
                title={`查詢「${item.english}」`}
                className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0 flex-1 text-left rounded -mx-1 px-1 py-0.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
              >
                <span data-english className="text-purple-700 dark:text-purple-300 break-words underline-offset-2 hover:underline">{item.english}</span>
                {item.ipa && (
                  <span data-ipa className="text-gray-500 break-words">{item.ipa}</span>
                )}
                {zh && (
                  <span className="text-gray-600 dark:text-gray-300 break-words">
                    <span className="hidden sm:inline">— </span>{zh}
                  </span>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RelatedPatterns({ english }: { english: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const matches = useRelatedPatterns(english)

  if (matches.length === 0) return null

  return (
    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">📐 相關句型</h4>
      <div className="space-y-2">
        {matches.map((p, i) => {
          const open = openIdx === i
          const matchingExamples = p.examples.filter(ex => ex.english.includes(english))
          return (
            <div key={p.id} className="bg-blue-50 dark:bg-blue-900/20 rounded">
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
                aria-expanded={open}
              >
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  #{p.id} {p.nameZh}
                </span>
                <span className={`text-xs text-blue-600 dark:text-blue-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {open && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400" data-english>
                    句型結構：{p.pattern}
                  </div>
                  {matchingExamples.map((ex, ei) => (
                    <div key={ei} className="border-l-2 border-blue-300 dark:border-blue-700 pl-2">
                      <div className="flex items-center gap-2">
                        <SpeakButton text={ex.english} size="sm" />
                        <span data-english className="text-sm text-gray-800 dark:text-gray-200">{ex.english}</span>
                      </div>
                      <div data-ipa className="text-xs text-gray-500 dark:text-gray-400">{ex.ipa}</div>
                      <div className="text-xs text-gray-700 dark:text-gray-300">{ex.chinese}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function useRelatedPatterns(english: string): GrammarPattern[] {
  if (!english) return []
  const out: GrammarPattern[] = []
  for (const p of grammarPatterns) {
    if (p.examples.some(ex => ex.english.includes(english))) {
      out.push(p)
      if (out.length >= 3) break
    }
  }
  return out
}
