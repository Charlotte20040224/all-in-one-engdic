'use client'

import { useEffect, useRef, useState } from 'react'
import { SpeakButton } from '@/components/SpeakButton'

interface SongWord {
  thai: string
  pinyin: string
  zh: string
}

interface SongSentence {
  thai: string
  pinyin: string
  zh: string
}

interface SongResult {
  songName: string
  artist: string | null
  words: SongWord[]
  sentences: SongSentence[]
  youtubeUrl: string
}

export default function SongLearningPage() {
  const [songName, setSongName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SongResult | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'words' | 'sentences'>('words')
  const [wordChecks, setWordChecks] = useState<boolean[]>([])
  const [sentChecks, setSentChecks] = useState<boolean[]>([])
  const [savingWords, setSavingWords] = useState(false)
  const [savingSents, setSavingSents] = useState(false)
  const [toast, setToast] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 3500)
    return () => clearTimeout(t)
  }, [error])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const analyze = async () => {
    if (!songName.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/song-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songName: songName.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error('[song-learning]', res.status, data)
        throw new Error(data?.error || `分析失敗 (${res.status})`)
      }
      setResult(data)
      setWordChecks((data.words || []).map(() => true))
      setSentChecks((data.sentences || []).map(() => true))
      setTab((data.words?.length ?? 0) >= (data.sentences?.length ?? 0) ? 'words' : 'sentences')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '分析失敗'
      setError(`${msg}，請再試一次 🙏`)
    } finally {
      setLoading(false)
    }
  }

  const toggleAllWords = (val: boolean) => setWordChecks(wordChecks.map(() => val))
  const toggleAllSents = (val: boolean) => setSentChecks(sentChecks.map(() => val))

  const saveWords = async () => {
    if (!result) return
    const selected = result.words.filter((_, i) => wordChecks[i])
    if (selected.length === 0) {
      setError('沒有勾選任何單字')
      return
    }
    setSavingWords(true)
    try {
      const settled = await Promise.all(
        selected.map(w =>
          fetch('/api/words', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              thai: w.thai,
              pinyin: w.pinyin ?? null,
              meaning: w.zh ?? null,
              note: result.songName ? `來自歌曲：${result.songName}` : null,
            }),
          }).then(r => r.ok).catch(() => false)
        )
      )
      const ok = settled.filter(Boolean).length
      setToast(ok === selected.length ? `✅ 已加入 ${ok} 個單字` : `⚠️ 加入 ${ok}/${selected.length} 個單字（部分失敗）`)
    } finally {
      setSavingWords(false)
    }
  }

  const saveSentences = async () => {
    if (!result) return
    const selected = result.sentences.filter((_, i) => sentChecks[i])
    if (selected.length === 0) {
      setError('沒有勾選任何句子')
      return
    }
    setSavingSents(true)
    try {
      const settled = await Promise.all(
        selected.map(s =>
          fetch('/api/sentences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              thai: s.thai,
              pinyin: s.pinyin,
              zh: s.zh,
              grammar: result.songName ? `來自歌曲：${result.songName}` : null,
            }),
          }).then(r => r.ok).catch(() => false)
        )
      )
      const ok = settled.filter(Boolean).length
      setToast(ok === selected.length ? `✅ 已加入 ${ok} 個句子` : `⚠️ 加入 ${ok}/${selected.length} 個句子（部分失敗）`)
    } finally {
      setSavingSents(false)
    }
  }

  const words = result?.words ?? []
  const sentences = result?.sentences ?? []
  const wordSelected = wordChecks.filter(Boolean).length
  const sentSelected = sentChecks.filter(Boolean).length

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🎵 用歌曲學英文</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          輸入英文歌曲名稱，AI 自動搜尋歌詞並分析！
        </p>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium pointer-events-none">
          {toast}
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-amber-500 text-white rounded-xl shadow-lg text-sm font-medium pointer-events-none max-w-[90vw] text-center">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={songName}
          onChange={e => setSongName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && analyze()}
          placeholder="輸入英文歌曲名稱，例如：ลืมไปแล้วว่าลืมยังไง"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          💡 建議輸入英文歌名，效果最好！<br />
          輸入英文或中文歌名可能找不到結果。<br />
          不知道英文歌名？可以先去 YouTube 搜尋，<br />
          歌名通常會顯示在標題旁邊 🎵
        </p>
        <button
          onClick={analyze}
          disabled={loading || !songName.trim()}
          className="w-full px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
        >
          {loading ? '搜尋並分析中…' : '開始分析'}
        </button>
        {loading && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            這個動作會搜尋網路歌詞，可能需要 10-30 秒
          </p>
        )}
      </div>

      {result && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-3">
            <div>
              <div data-thai className="text-xl font-bold text-gray-900 dark:text-white break-words">
                {result.songName}
              </div>
              {result.artist && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">🎤 {result.artist}</div>
              )}
            </div>
            <a
              href={result.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              ▶ 在 YouTube 搜尋這首歌
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              ⚠️ 因版權限制，僅提供精選句子供學習參考，完整歌詞請至 YouTube 或串流平台收聽。
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setTab('words')}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  tab === 'words'
                    ? 'text-purple-600 dark:text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                📝 重要單字（{words.length}）
              </button>
              <button
                onClick={() => setTab('sentences')}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  tab === 'sentences'
                    ? 'text-purple-600 dark:text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                💬 句子對照（{sentences.length}）
              </button>
            </div>

            {tab === 'words' && (
              <div className="p-4 space-y-3">
                {words.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">沒有偵測到單字</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>已勾選 {wordSelected}/{words.length}</span>
                      <div className="flex gap-2">
                        <button onClick={() => toggleAllWords(true)} className="hover:text-purple-600">全選</button>
                        <span>/</span>
                        <button onClick={() => toggleAllWords(false)} className="hover:text-purple-600">全不選</button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {words.map((w, i) => (
                        <label key={i} className="flex items-start gap-3 py-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={wordChecks[i] ?? false}
                            onChange={e => {
                              const next = [...wordChecks]
                              next[i] = e.target.checked
                              setWordChecks(next)
                            }}
                            className="mt-1 w-4 h-4 accent-purple-600 cursor-pointer"
                          />
                          <SpeakButton text={w.thai} size="sm" className="mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div data-thai className="font-medium text-gray-900 dark:text-white break-words">{w.thai}</div>
                            <div data-pinyin className="text-xs text-purple-600 dark:text-purple-400">{w.pinyin}</div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">{w.zh}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={saveWords}
                      disabled={savingWords || wordSelected === 0}
                      className="w-full py-3 mt-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                      {savingWords ? '儲存中…' : `加入單字庫（${wordSelected}）`}
                    </button>
                  </>
                )}
              </div>
            )}

            {tab === 'sentences' && (
              <div className="p-4 space-y-3">
                {sentences.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">沒有偵測到句子</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>已勾選 {sentSelected}/{sentences.length}</span>
                      <div className="flex gap-2">
                        <button onClick={() => toggleAllSents(true)} className="hover:text-purple-600">全選</button>
                        <span>/</span>
                        <button onClick={() => toggleAllSents(false)} className="hover:text-purple-600">全不選</button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {sentences.map((s, i) => (
                        <label key={i} className="flex items-start gap-3 py-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sentChecks[i] ?? false}
                            onChange={e => {
                              const next = [...sentChecks]
                              next[i] = e.target.checked
                              setSentChecks(next)
                            }}
                            className="mt-1 w-4 h-4 accent-purple-600 cursor-pointer"
                          />
                          <SpeakButton text={s.thai} size="sm" className="mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div data-thai className="font-medium text-gray-900 dark:text-white break-words">{s.thai}</div>
                            <div data-pinyin className="text-xs text-purple-600 dark:text-purple-400">{s.pinyin}</div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">{s.zh}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={saveSentences}
                      disabled={savingSents || sentSelected === 0}
                      className="w-full py-3 mt-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                      {savingSents ? '儲存中…' : `加入句子庫（${sentSelected}）`}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
