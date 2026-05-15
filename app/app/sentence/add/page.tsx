'use client'

import { useEffect, useRef, useState } from 'react'
import { SpeakButton } from '@/components/SpeakButton'
import { ClickableThai } from '@/components/ClickableThai'
import { ModeTabs } from '@/components/ModeTabs'
import type { SentenceLookupResult } from '@/lib/types'

export default function SentenceAddPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SentenceLookupResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 3500)
    return () => clearTimeout(t)
  }, [error])

  const FRIENDLY_ERROR = '目前查詢人數較多，請稍後再試 🙏'

  const lookup = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)
    try {
      const res = await fetch('/api/sentence/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.error) {
        setError(data?.error || FRIENDLY_ERROR)
        return
      }
      setResult(data)
    } catch {
      setError(FRIENDLY_ERROR)
    } finally {
      setLoading(false)
    }
  }

  const resetAndFocus = () => {
    setQuery('')
    setResult(null)
    setError('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const save = async () => {
    if (!result) return
    setSaving(true)
    try {
      const res = await fetch('/api/sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('[sentence-save]', res.status, data)
        throw new Error(data?.error || `儲存失敗 (${res.status})`)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '儲存失敗'
      setError(`${msg}，請再試一次 🙏`)
    } finally {
      setSaving(false)
    }
  }

  const vocabulary = result?.vocabulary ?? []

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">新增句子</h1>
        <ModeTabs section="add" current="sentence" />
      </div>

      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium pointer-events-none">
          ✅ 已儲存到句子庫
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-amber-500 text-white rounded-xl shadow-lg text-sm font-medium pointer-events-none max-w-[90vw] text-center">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">輸入英文句子或中文意思，AI 會分析句型並列出重要單字</p>
        <div className="flex flex-col gap-2">
          <textarea
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) lookup()
            }}
            placeholder="例：I am learning English 或 我正在學英文"
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
          />
          <button
            onClick={lookup}
            disabled={loading || !query.trim()}
            className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
          >
            {loading ? '查詢中…' : '查詢'}
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
            <div className="flex items-start gap-3">
              <SpeakButton text={result.thai} size="md" />
              <span data-thai className="text-2xl font-bold text-gray-900 dark:text-white break-words">
                {result.thai}
              </span>
            </div>
            <div data-pinyin className="text-purple-600 dark:text-purple-400">{result.pinyin}</div>
            <div className="text-gray-800 dark:text-gray-200 font-medium">{result.zh}</div>

            {result.grammar && (
              <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
                <div className="text-xs font-semibold mb-1">📐 句型解析</div>
                <div className="whitespace-pre-wrap">{result.grammar}</div>
              </div>
            )}

            {vocabulary.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">句中單字</h4>
                <div className="bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded divide-y divide-amber-200 dark:divide-amber-800">
                  {vocabulary.map((v, i) => (
                    <div key={i} className="py-1 first:pt-0 last:pb-0 flex items-start gap-1.5">
                      <SpeakButton text={v.thai} size="sm" className="mt-0.5 shrink-0" />
                      <div>
                        <ClickableThai text={v.thai} className="text-sm font-medium text-gray-800 dark:text-gray-200" />
                        <div data-pinyin className="text-xs text-orange-500 dark:text-orange-400">{v.pinyin}</div>
                        <div className="text-xs text-amber-700 dark:text-amber-300">{v.meaning}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={`https://youglish.com/pronounce/${encodeURIComponent(result.thai)}/english`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                🎬 在 YouGlish 聽真實發音
              </a>
              {result.grammarPattern && (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent('English grammar ' + result.grammarPattern + ' explained')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  ▶ YouTube 句型教學
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {saving ? '儲存中…' : '儲存句子'}
            </button>
            <button
              onClick={resetAndFocus}
              className="w-full py-3 border-2 border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
            >
              🔍 查詢新句子
            </button>
          </div>
        </>
      )}
    </div>
  )
}
