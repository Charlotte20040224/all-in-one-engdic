'use client'

import { useEffect, useState } from 'react'
import { grammarPatterns, type GrammarPattern } from '@/data/grammarPatterns'
import { bumpStudyLog } from '@/lib/studyLog'
import { SpeakButton } from './SpeakButton'
import { FavoriteButton } from './FavoriteButton'
import { ShareButton } from './ShareButton'
import { sharePatternImage } from '@/lib/shareImage'

interface Props {
  isDark?: boolean
  speechRate?: number
}

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all',          label: '全部' },
  { value: 'hard',         label: '🔖 困難' },
  { value: 'A_modal',      label: 'A 助動詞' },
  { value: 'B_tense',      label: 'B 時態' },
  { value: 'C_connector',  label: 'C 連接詞' },
  { value: 'D_question',   label: 'D 疑問' },
  { value: 'E_comparison', label: 'E 比較' },
  { value: 'F_confusable', label: 'F 混淆字' },
  { value: 'G_daily',      label: 'G 生活' },
]

const categoryLabel: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map(o => [o.value, o.label])
)

const levelLabel: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '進階',
}

const levelColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const CATEGORY_STORAGE_KEY = 'daily-pattern-category'
const COLLAPSED_STORAGE_KEY = 'daily-pattern-collapsed'
const LEARNED_STORAGE_KEY = 'learned-patterns'
const HARD_STORAGE_KEY = 'hard-patterns'
const STATS_STORAGE_KEY = 'pattern-stats'

type PatternStats = Record<number, { correct: number; wrong: number }>

function readNumberArray(key: string): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : []
  } catch {
    return []
  }
}

function writeNumberArray(key: string, arr: number[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(arr))
  } catch {}
}

function readStats(): PatternStats {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as PatternStats) : {}
  } catch {
    return {}
  }
}

function writeStats(stats: PatternStats) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats))
  } catch {}
}

function shortDate(iso: string): string {
  // Accepts "YYYY-MM-DD" and returns "MM/DD" to keep the header compact on
  // narrow screens. Falls back to the original string if it doesn't match.
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})$/)
  return m ? `${m[1]}/${m[2]}` : iso
}

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

const DIFFICULTY_FILTER_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all',    label: '全部' },
  { value: 'easy',   label: '簡單' },
  { value: 'medium', label: '中等' },
  { value: 'hard',   label: '困難' },
]

const DIFFICULTY_FILTER_KEY = 'daily-pattern-difficulty'

interface PatternViewProps {
  pattern: GrammarPattern
  dateLabel?: string
  learned: boolean
  hard: boolean
  stats?: { correct: number; wrong: number }
  difficultyFilter: DifficultyFilter
  onToggleLearned: () => void
  onToggleHard: () => void
  onAnswer: (correct: boolean) => void
}

function PatternView({
  pattern,
  dateLabel,
  learned,
  hard,
  stats,
  difficultyFilter,
  onToggleLearned,
  onToggleHard,
  onAnswer,
}: PatternViewProps) {
  const [revealQuiz, setRevealQuiz] = useState(false)
  const [expandedExample, setExpandedExample] = useState<number | null>(null)
  const [answeredThisRound, setAnsweredThisRound] = useState<null | 'correct' | 'wrong'>(null)
  const p = pattern

  const total = (stats?.correct ?? 0) + (stats?.wrong ?? 0)
  const percent = total > 0 ? Math.round(((stats?.correct ?? 0) / total) * 100) : 0

  const handleAnswer = (correct: boolean) => {
    if (answeredThisRound) return
    setAnsweredThisRound(correct ? 'correct' : 'wrong')
    onAnswer(correct)
  }

  return (
    <div className={`space-y-4 transition-opacity ${learned ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {dateLabel ? (
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
              📅 {shortDate(dateLabel)} · 每日句型 #{p.id}
            </div>
          ) : (
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap">
              ➕ 句型 #{p.id}
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {learned && <span className="text-green-600 dark:text-green-400">✅</span>}
            <span>{p.nameZh}</span>
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0 flex-nowrap">
          <button
            type="button"
            onClick={onToggleLearned}
            aria-pressed={learned}
            title={learned ? '取消已學過' : '標記為已學過'}
            className={`text-xs w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition ${
              learned
                ? 'bg-green-500 text-white shadow'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30'
            }`}
          >
            ✅
          </button>
          <button
            type="button"
            onClick={onToggleHard}
            aria-pressed={hard}
            title={hard ? '取消困難' : '標記為困難'}
            className={`text-xs w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition ${
              hard
                ? 'bg-amber-500 text-white shadow'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
            }`}
          >
            🔖
          </button>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium whitespace-nowrap shrink-0">
            {categoryLabel[p.category] ?? p.category}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${levelColor[p.level]}`}>
            {levelLabel[p.level]}
          </span>
        </div>
      </div>

      {/* Keyword */}
      <div className="flex items-center gap-2 flex-wrap">
        <SpeakButton text={p.keyword} size="md" />
        <FavoriteButton
          kind="word"
          size="md"
          entry={{
            english: p.keyword,
            ipa: p.keywordIpa,
            chinese: p.nameZh,
          }}
        />
        <span data-english className="text-xl font-bold text-gray-900 dark:text-white">
          {p.keyword}
        </span>
      </div>

      {/* Pattern formula */}
      <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded text-sm">
        <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">📐 句型結構</div>
        <div className="text-gray-800 dark:text-gray-200" data-english>{p.pattern}</div>
        <div className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">{p.patternZh}</div>
      </div>

      {/* Explanation */}
      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {p.explanationZh}
      </div>

      {/* Tip */}
      {p.tipZh && (
        <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded text-xs text-amber-800 dark:text-amber-200">
          💡 {p.tipZh}
        </div>
      )}

      {/* Common mistakes */}
      {p.commonMistakes && p.commonMistakes.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-3 py-2 rounded">
          <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">⚠️ 常見錯誤</div>
          <ul className="text-xs text-orange-800 dark:text-orange-200 space-y-1 list-disc pl-4">
            {p.commonMistakes.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Examples */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">例句</h4>
        {(() => {
          const filtered = difficultyFilter === 'all'
            ? p.examples.map((ex, i) => ({ ex, i }))
            : p.examples.map((ex, i) => ({ ex, i })).filter(({ ex }) => ex.difficulty === difficultyFilter)
          if (filtered.length === 0) {
            return (
              <div className="text-xs text-gray-500 dark:text-gray-400 italic py-2">
                此句型沒有「{DIFFICULTY_FILTER_OPTIONS.find(o => o.value === difficultyFilter)?.label}」難度的例句
              </div>
            )
          }
          return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filtered.map(({ ex, i }) => {
            const open = expandedExample === i
            const hasWords = !!ex.words?.length
            return (
              <div key={i} className="py-2">
                <div className="flex items-start gap-2">
                  <SpeakButton text={ex.english} size="sm" className="mt-0.5 shrink-0" />
                  <button
                    type="button"
                    onClick={() => hasWords && setExpandedExample(open ? null : i)}
                    className="min-w-0 flex-1 text-left"
                    aria-expanded={open}
                  >
                    <div className="flex items-center gap-1">
                      <span data-english className="text-base text-gray-900 dark:text-white">{ex.english}</span>
                      {hasWords && (
                        <span className={`text-xs text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{ex.chinese}</div>
                  </button>
                </div>
                {open && hasWords && (
                  <div className="mt-2 ml-8 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded divide-y divide-amber-200 dark:divide-amber-800">
                    {ex.words!.map((w, j) => (
                      <div key={j} className="py-1 first:pt-0 last:pb-0 flex items-start gap-1.5">
                        <SpeakButton text={w.english} size="sm" className="mt-0.5 shrink-0" />
                        <div>
                          <div data-english className="text-sm font-medium text-gray-800 dark:text-gray-200">{w.english}</div>
                          <div className="text-xs text-amber-700 dark:text-amber-300">{w.zh}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
          )
        })()}
      </div>

      {/* Quiz */}
      <div className="bg-purple-50 dark:bg-purple-900/20 px-3 py-3 rounded">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">🎯 小測驗</div>
          <button
            onClick={() => setRevealQuiz(v => !v)}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline shrink-0"
          >
            {revealQuiz ? '隱藏答案' : '看答案'}
          </button>
        </div>
        <div className="text-sm text-gray-800 dark:text-gray-200 mb-1">{p.quiz.question}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">提示：{p.quiz.hint}</div>
        {revealQuiz && (
          <div className="pt-2 border-t border-purple-200 dark:border-purple-800 space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <SpeakButton text={p.quiz.blanks.join(' ')} size="sm" />
                <span data-english className="text-base font-medium text-gray-900 dark:text-white">
                  {p.quiz.blanks.join(' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAnswer(true)}
                disabled={!!answeredThisRound}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition ${
                  answeredThisRound === 'correct'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/60 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                ✅ 答對
              </button>
              <button
                type="button"
                onClick={() => handleAnswer(false)}
                disabled={!!answeredThisRound}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition ${
                  answeredThisRound === 'wrong'
                    ? 'bg-red-500 text-white'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                ❌ 答錯
              </button>
            </div>
          </div>
        )}
        {total > 0 && (
          <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300">
            你的正確率 {stats!.correct}/{total} 次 {percent}%
          </div>
        )}
      </div>
    </div>
  )
}

export default function DailyPattern({ isDark, speechRate }: Props) {
  const [category, setCategory] = useState<string>('all')
  const [data, setData] = useState<{ pattern: GrammarPattern; date: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [history, setHistory] = useState<GrammarPattern[]>([])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [extraLoading, setExtraLoading] = useState(false)
  const [extraError, setExtraError] = useState<string | null>(null)
  const [exhausted, setExhausted] = useState(false)
  const [learnedIds, setLearnedIds] = useState<number[]>([])
  const [hardIds, setHardIds] = useState<number[]>([])
  const [stats, setStats] = useState<PatternStats>({})
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')

  // Load saved state once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedCategory = localStorage.getItem(CATEGORY_STORAGE_KEY)
    if (savedCategory && CATEGORY_OPTIONS.some(o => o.value === savedCategory)) {
      setCategory(savedCategory)
    }
    const savedCollapsed = localStorage.getItem(COLLAPSED_STORAGE_KEY)
    if (savedCollapsed === '1') setCollapsed(true)
    setLearnedIds(readNumberArray(LEARNED_STORAGE_KEY))
    setHardIds(readNumberArray(HARD_STORAGE_KEY))
    setStats(readStats())
    const savedDiff = localStorage.getItem(DIFFICULTY_FILTER_KEY)
    if (savedDiff && DIFFICULTY_FILTER_OPTIONS.some(o => o.value === savedDiff)) {
      setDifficultyFilter(savedDiff as DifficultyFilter)
    }
  }, [])

  const handleDifficultyChange = (value: DifficultyFilter) => {
    setDifficultyFilter(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(DIFFICULTY_FILTER_KEY, value)
    }
  }

  // Fetch when category changes
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    setHistory([])
    setHistoryIndex(0)
    setExtraError(null)
    setExhausted(false)

    // Hard category: pull from local data, no API call.
    if (category === 'hard') {
      const list = grammarPatterns.filter(p => hardIds.includes(p.id))
      if (list.length === 0) {
        setData(null)
        setHistory([])
        setExhausted(true)
      } else {
        const today = new Date().toISOString().slice(0, 10)
        setData({ pattern: list[0], date: today })
        setHistory(list)
        setHistoryIndex(0)
        setExhausted(true) // no random fetch in hard mode; whole hard list is the pool
      }
      setLoading(false)
      return () => { alive = false }
    }

    const url = category === 'all'
      ? '/api/daily-pattern'
      : `/api/daily-pattern?category=${encodeURIComponent(category)}`

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(json => {
        if (!alive) return
        setData(json)
        const todayPattern = json.pattern as GrammarPattern
        bumpStudyLog({ category: todayPattern.category })
        // Surface prior-marked hard patterns BEFORE today's pattern.
        const priorHard = grammarPatterns.filter(
          p => hardIds.includes(p.id)
            && p.id !== todayPattern.id
            && (category === 'all' || p.category === category)
        )
        setHistory([...priorHard, todayPattern])
        setHistoryIndex(0)
      })
      .catch(e => {
        if (alive) setError(e.message)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
    // hardIds intentionally excluded — re-running the fetch every time hard
    // toggles would feel jumpy. Re-prioritization happens on next category switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(CATEGORY_STORAGE_KEY, value)
    }
  }

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? '1' : '0')
      }
      return next
    })
  }

  const goPrev = () => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1)
      setExtraError(null)
    }
  }

  const goNext = async () => {
    setExtraError(null)
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1)
      return
    }
    if (category === 'hard') return // no random fetch in hard mode
    setExtraLoading(true)

    const seenIds = history.map(p => p.id)
    const params = new URLSearchParams()
    params.set('random', '1')
    params.set('exclude', seenIds.join(','))
    if (category !== 'all') params.set('category', category)

    try {
      const r = await fetch(`/api/daily-pattern?${params.toString()}`)
      if (r.status === 404) {
        const json = await r.json().catch(() => ({}))
        if (json?.exhausted) {
          setExhausted(true)
          return
        }
        throw new Error(`HTTP ${r.status}`)
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const json = await r.json()
      const next = json.pattern as GrammarPattern
      setHistory(prev => [...prev, next])
      setHistoryIndex(prev => prev + 1)
    } catch (e) {
      setExtraError(e instanceof Error ? e.message : String(e))
    } finally {
      setExtraLoading(false)
    }
  }

  const toggleLearned = (id: number) => {
    setLearnedIds(prev => {
      const wasLearned = prev.includes(id)
      const next = wasLearned ? prev.filter(x => x !== id) : [...prev, id]
      writeNumberArray(LEARNED_STORAGE_KEY, next)
      if (!wasLearned) bumpStudyLog({ patterns: 1 })
      return next
    })
  }

  const toggleHard = (id: number) => {
    setHardIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      writeNumberArray(HARD_STORAGE_KEY, next)
      return next
    })
  }

  const recordAnswer = (id: number, correct: boolean) => {
    setStats(prev => {
      const cur = prev[id] ?? { correct: 0, wrong: 0 }
      const next: PatternStats = {
        ...prev,
        [id]: {
          correct: cur.correct + (correct ? 1 : 0),
          wrong: cur.wrong + (correct ? 0 : 1),
        },
      }
      writeStats(next)
      return next
    })
    bumpStudyLog(correct ? { quizCorrect: 1 } : { quizWrong: 1 })
  }

  const current = history[historyIndex]
  const isToday = !!current && !!data && current.id === data.pattern.id && category !== 'hard'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        className="w-full flex items-center justify-between gap-2 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition"
      >
        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          📐 每日句型
          <span className={`text-xs text-gray-500 dark:text-gray-400 transition-transform ${!collapsed ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </span>
        {data && (
          <span className="text-xs font-medium text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full">
            #{data.pattern.id}
          </span>
        )}
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          {/* Category bar */}
          <div className="-mx-1 px-1 overflow-x-auto">
            <div className="flex gap-2 pb-1 w-max">
              {CATEGORY_OPTIONS.map(opt => {
                const active = category === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleCategoryChange(opt.value)}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition ${
                      active
                        ? 'bg-blue-500 text-white shadow'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-gray-500 dark:text-gray-400">例句難度</span>
            {DIFFICULTY_FILTER_OPTIONS.map(opt => {
              const active = difficultyFilter === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleDifficultyChange(opt.value)}
                  className={`px-2.5 py-1 rounded-full font-medium transition ${
                    active
                      ? 'bg-purple-500 text-white shadow'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {loading && (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-4">載入今日句型…</div>
          )}

          {error && !loading && (
            <div className="text-sm text-red-500 py-4">無法載入今日句型（{error}）</div>
          )}

          {!loading && !error && category === 'hard' && history.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
              還沒有標記過困難的句型。看到不熟悉的可以按右上角的 🔖 加進來。
            </div>
          )}

          {!loading && !error && current && (() => {
            const atStart = historyIndex === 0
            const atEnd = historyIndex >= history.length - 1
            const forwardDisabled = extraLoading || (atEnd && exhausted)
            const isLearned = learnedIds.includes(current.id)
            const isHard = hardIds.includes(current.id)
            return (
              <>
                <PatternView
                  key={current.id}
                  pattern={current}
                  dateLabel={isToday && data ? data.date : undefined}
                  learned={isLearned}
                  hard={isHard}
                  stats={stats[current.id]}
                  difficultyFilter={difficultyFilter}
                  onToggleLearned={() => toggleLearned(current.id)}
                  onToggleHard={() => toggleHard(current.id)}
                  onAnswer={correct => recordAnswer(current.id, correct)}
                />

                {extraError && (
                  <div className="text-sm text-red-500">無法載入下一個句型（{extraError}）</div>
                )}

                {atEnd && exhausted && category !== 'hard' && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                    🎉 這個類別的句型都看過了！
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={atStart}
                    className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 text-sm font-medium transition"
                  >
                    ← 上一個
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={forwardDisabled}
                    className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium transition"
                  >
                    {extraLoading ? '載入中…' : '再學一個 +'}
                  </button>
                </div>

                <div className="pt-1 flex justify-end">
                  <ShareButton
                    label="分享"
                    onShare={() => sharePatternImage({
                      id: current.id,
                      nameZh: current.nameZh,
                      keyword: current.keyword,
                      keywordIpa: current.keywordIpa,
                      pattern: current.pattern,
                      patternZh: current.patternZh,
                      explanationZh: current.explanationZh,
                      examples: current.examples.map(ex => ({
                        english: ex.english,
                        ipa: ex.ipa,
                        chinese: ex.chinese,
                      })),
                    })}
                  />
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Hidden props acknowledgement (kept for parent integration) */}
      <span className="hidden" data-is-dark={isDark ? '1' : '0'} data-speech-rate={speechRate ?? ''} />
    </div>
  )
}
