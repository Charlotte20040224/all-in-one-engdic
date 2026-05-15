'use client'

import Link from 'next/link'
import confetti from 'canvas-confetti'
import { useEffect, useState, useMemo } from 'react'
import { TodayPlayer } from '@/components/TodayPlayer'
import { SpeakButton } from '@/components/SpeakButton'
import DailyPattern from '@/components/DailyPattern'
import { StudyCalendar } from '@/components/StudyCalendar'
import { WeeklyReport } from '@/components/WeeklyReport'
import { DAILY_SENTENCES, type DailySentence } from '@/lib/dailySentences'
import type { WordEntry } from '@/lib/types'

interface ActivityData {
  streak: number
  weekTotal: number
  logs: Array<{ date: string; reviewed: number }>
}

interface WordStats {
  total: number
  due: number
}

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

const THEMES = [
  { key: '👋 打招呼 & 自我介紹', short: '👋 打招呼' },
  { key: '🍜 餐廳 & 點餐', short: '🍜 餐廳' },
  { key: '🚕 交通 & 移動', short: '🚕 交通' },
  { key: '🛍️ 購物 & 殺價', short: '🛍️ 購物' },
  { key: '🏨 住宿 & 飯店', short: '🏨 住宿' },
  { key: '🏥 緊急狀況 & 求助', short: '🏥 緊急' },
  { key: '💬 日常閒聊', short: '💬 閒聊' },
  { key: '🎓 學業 & 工作', short: '🎓 學業' },
  { key: '💆 休閒娛樂', short: '💆 休閒' },
  { key: '🔢 數字 & 時間', short: '🔢 數字' },
]
const VALID_THEME_KEYS = new Set(THEMES.map(t => t.key))
const THEME_STORAGE_KEY = 'dailySentence:selectedTheme'

export default function AppPage() {
  const [activity, setActivity] = useState<ActivityData | null>(null)
  const [stats, setStats] = useState<WordStats>({ total: 0, due: 0 })
  const [dailyGoal, setDailyGoal] = useState(10)
  const [todayReviewed, setTodayReviewed] = useState(0)
  const [now, setNow] = useState<Date | null>(null)
  const [todayWords, setTodayWords] = useState<WordEntry[]>([])
  const [playerOpen, setPlayerOpen] = useState(false)
  const [sentenceSaving, setSentenceSaving] = useState(false)
  const [savedThai, setSavedThai] = useState<Set<string>>(new Set())
  const [sentenceError, setSentenceError] = useState<string | null>(null)
  const [currentSentence, setCurrentSentence] = useState<DailySentence | null>(null)
  const [seenToday, setSeenToday] = useState<string[]>([])
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [themeIndex, setThemeIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem('dailySentence:expanded')
      if (v === '1') setExpanded(true)
    } catch {}
  }, [])

  const toggleExpanded = () => {
    setExpanded(prev => {
      const next = !prev
      try {
        localStorage.setItem('dailySentence:expanded', next ? '1' : '0')
      } catch {}
      return next
    })
  }

  useEffect(() => {
    const currentDate = new Date()
    setNow(currentDate)

    Promise.all([
      fetch('/api/activity').then(r => r.json()),
      fetch('/api/words').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
      fetch('/api/words?date=today').then(r => r.json()),
    ]).then(([act, words, settings, today]) => {
      setActivity(act)
      const due = words.filter((w: any) => new Date(w.nextReview) <= currentDate).length
      setStats({ total: words.length, due })
      setDailyGoal(settings.dailyGoal ?? 10)
      setTodayWords(Array.isArray(today) ? today : [])

      const todayKey = currentDate.toISOString().split('T')[0]
      const todayLog = act.logs?.find((l: any) => l.date?.startsWith(todayKey))
      setTodayReviewed(todayLog?.reviewed ?? 0)
    })

    fetch('/api/sentences')
      .then(r => (r.ok ? r.json() : []))
      .then((list: Array<{ thai: string }>) => {
        if (!Array.isArray(list)) return
        setSavedThai(new Set(list.map(s => s.thai)))
      })
      .catch(() => {})
  }, [])

  const weekData = useMemo(() => {
    if (!now) return weekDays.map(day => ({ day, reviewed: 0, isToday: false }))
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
    return weekDays.map((_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      const key = d.toISOString().split('T')[0]
      const log = activity?.logs?.find(l => l.date?.startsWith(key))
      return { day: weekDays[i], reviewed: log?.reviewed ?? 0, isToday: d.toDateString() === now.toDateString() }
    })
  }, [now, activity])

  const goalPct = Math.min(100, (todayReviewed / dailyGoal) * 100)
  const [celebrating, setCelebrating] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (todayReviewed < dailyGoal) return
    const today = new Date().toISOString().split('T')[0]
    const storageKey = `goal-celebrated:${today}`
    if (localStorage.getItem(storageKey) === '1') return
    localStorage.setItem(storageKey, '1')
    setCelebrating(true)
    const fire = (origin: { x: number; y: number }) =>
      confetti({
        particleCount: 80,
        spread: 70,
        origin,
        colors: ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
      })
    fire({ x: 0.2, y: 0.7 })
    fire({ x: 0.5, y: 0.6 })
    fire({ x: 0.8, y: 0.7 })
    const t = setTimeout(() => setCelebrating(false), 3000)
    return () => clearTimeout(t)
  }, [todayReviewed, dailyGoal])

  const todayKey = useMemo(() => (now ? now.toISOString().split('T')[0] : null), [now])
  const seenStorageKey = todayKey ? `dailySentence:seen:${todayKey}` : null

  const persistSeen = (list: string[]) => {
    setSeenToday(list)
    if (seenStorageKey) {
      try {
        localStorage.setItem(seenStorageKey, JSON.stringify(list))
      } catch {}
    }
  }

  // Initialize current sentence + seen list once we know "now"
  useEffect(() => {
    if (!now || !seenStorageKey) return

    let stored: string[] = []
    try {
      const raw = localStorage.getItem(seenStorageKey)
      if (raw) stored = JSON.parse(raw)
    } catch {}

    let savedTheme: string | null = null
    try {
      const raw = localStorage.getItem(THEME_STORAGE_KEY)
      if (raw && VALID_THEME_KEYS.has(raw)) savedTheme = raw
    } catch {}

    if (savedTheme) {
      const themeList = DAILY_SENTENCES.filter(s => s.context === savedTheme)
      if (themeList.length > 0) {
        setSelectedTheme(savedTheme)
        setThemeIndex(0)
        setCurrentSentence(themeList[0])
        setSeenToday(stored)
        return
      }
    }

    const startOfYear = new Date(now.getFullYear(), 0, 0).getTime()
    const dayOfYear = Math.floor((now.getTime() - startOfYear) / 86400000)
    const initial = DAILY_SENTENCES[dayOfYear % DAILY_SENTENCES.length]

    const updated = stored.includes(initial.thai) ? stored : [...stored, initial.thai]
    if (updated !== stored) {
      try {
        localStorage.setItem(seenStorageKey, JSON.stringify(updated))
      } catch {}
    }
    setSeenToday(updated)
    setCurrentSentence(initial)
  }, [now, seenStorageKey])

  const themeSentences = useMemo(() => {
    if (!selectedTheme) return [] as DailySentence[]
    return DAILY_SENTENCES.filter(s => s.context === selectedTheme)
  }, [selectedTheme])

  const selectTheme = (themeKey: string | null) => {
    try {
      if (themeKey) localStorage.setItem(THEME_STORAGE_KEY, themeKey)
      else localStorage.removeItem(THEME_STORAGE_KEY)
    } catch {}

    setSentenceError(null)

    if (themeKey) {
      const list = DAILY_SENTENCES.filter(s => s.context === themeKey)
      if (list.length === 0) return
      setSelectedTheme(themeKey)
      setThemeIndex(0)
      setCurrentSentence(list[0])
    } else {
      setSelectedTheme(null)
      if (!now) return
      const startOfYear = new Date(now.getFullYear(), 0, 0).getTime()
      const dayOfYear = Math.floor((now.getTime() - startOfYear) / 86400000)
      const initial = DAILY_SENTENCES[dayOfYear % DAILY_SENTENCES.length]
      setCurrentSentence(initial)
      if (!seenToday.includes(initial.thai)) {
        persistSeen([...seenToday, initial.thai])
      }
    }
  }

  const nextInSelectedTheme = () => {
    if (themeSentences.length === 0) return
    if (themeIndex >= themeSentences.length - 1) return
    const newIdx = themeIndex + 1
    setThemeIndex(newIdx)
    setCurrentSentence(themeSentences[newIdx])
    setSentenceError(null)
  }

  const prevInSelectedTheme = () => {
    if (themeIndex <= 0) return
    const newIdx = themeIndex - 1
    setThemeIndex(newIdx)
    setCurrentSentence(themeSentences[newIdx])
    setSentenceError(null)
  }

  const themeRemaining = useMemo(() => {
    if (!currentSentence) return [] as DailySentence[]
    return DAILY_SENTENCES.filter(
      s => s.context === currentSentence.context && !seenToday.includes(s.thai),
    )
  }, [currentSentence, seenToday])

  const showSentence = (s: DailySentence) => {
    setCurrentSentence(s)
    setSentenceError(null)
    if (!seenToday.includes(s.thai)) {
      persistSeen([...seenToday, s.thai])
    }
  }

  const nextInTheme = () => {
    if (themeRemaining.length === 0) return
    showSentence(themeRemaining[0])
  }

  const switchTheme = () => {
    if (!currentSentence) return
    const themes = Array.from(new Set(DAILY_SENTENCES.map(s => s.context)))
    const currentIdx = themes.indexOf(currentSentence.context)
    for (let i = 1; i <= themes.length; i++) {
      const t = themes[(currentIdx + i) % themes.length]
      const unseen = DAILY_SENTENCES.find(s => s.context === t && !seenToday.includes(s.thai))
      if (unseen) {
        showSentence(unseen)
        return
      }
    }
  }

  const isCurrentSaved = !!currentSentence && savedThai.has(currentSentence.thai)

  const addDailySentence = async () => {
    if (!currentSentence || sentenceSaving || isCurrentSaved) return
    setSentenceSaving(true)
    setSentenceError(null)
    try {
      const res = await fetch('/api/sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thai: currentSentence.thai,
          pinyin: currentSentence.pinyin,
          zh: currentSentence.zh,
        }),
      })
      if (res.status === 401) {
        setSentenceError('請先登入')
        return
      }
      if (!res.ok) throw new Error('save failed')
      setSavedThai(prev => {
        const next = new Set(prev)
        next.add(currentSentence.thai)
        return next
      })
    } catch {
      setSentenceError('儲存失敗，請稍後再試')
    } finally {
      setSentenceSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {celebrating && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 pointer-events-none">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl text-lg font-bold animate-bounce">
            🎉 今日目標達成！
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">學習概況</h1>

      <WeeklyReport />

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="總單字數" value={stats.total} icon="📚" color="purple" />
        <StatCard label="待複習" value={stats.due} icon="⏰" color="orange" />
        <StatCard label="連續學習" value={`${activity?.streak ?? 0} 天`} icon="🔥" color="red" />
        <StatCard label="本週複習" value={activity?.weekTotal ?? 0} icon="📈" color="green" />
      </div>

      {/* Today review player */}
      <button
        onClick={() => setPlayerOpen(true)}
        disabled={todayWords.length === 0}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
      >
        📻 今日單字複習（{todayWords.length}個）
      </button>

      {playerOpen && todayWords.length > 0 && (
        <TodayPlayer words={todayWords} onClose={() => setPlayerOpen(false)} />
      )}

      {/* Daily sentence + pattern + goal — visually one block */}
      <div className="space-y-2">
      {/* Daily sentence (collapsible) */}
      {currentSentence && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition"
          >
            <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              📅 每日學一句
              <span className={`text-xs text-gray-500 dark:text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </span>
            <span className="text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-full">
              {currentSentence.context}
            </span>
          </button>

          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="space-y-3">
                <div className="-mx-1 px-1 overflow-x-auto">
                  <div className="flex gap-2 pb-1 w-max">
                    <ThemeButton
                      label="📅 每日推薦"
                      active={selectedTheme === null}
                      onClick={() => selectTheme(null)}
                    />
                    {THEMES.map(t => (
                      <ThemeButton
                        key={t.key}
                        label={t.short}
                        active={selectedTheme === t.key}
                        onClick={() => selectTheme(t.key)}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl shadow p-5">
          <div className="flex items-start gap-2 mb-2">
            <span data-thai className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
              {currentSentence.thai}
            </span>
            <SpeakButton text={currentSentence.thai} size="md" className="mt-1 shrink-0" />
          </div>
          <div data-pinyin className="text-sm text-purple-600 dark:text-purple-400 mb-1">
            {currentSentence.pinyin}
          </div>
          <div className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">
            {currentSentence.zh}
          </div>

          <button
            onClick={addDailySentence}
            disabled={sentenceSaving || isCurrentSaved}
            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium transition"
          >
            {isCurrentSaved ? '✅ 已儲存' : sentenceSaving ? '儲存中…' : '➕ 儲存'}
          </button>
          {sentenceError && (
            <p className="text-xs text-red-500 mt-2">{sentenceError}</p>
          )}

          <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800/50 flex items-center justify-between gap-2 flex-wrap">
            {selectedTheme ? (
              <>
                <span className="text-xs text-amber-800 dark:text-amber-200">
                  第 {themeIndex + 1} 句 / 共 {themeSentences.length} 句
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevInSelectedTheme}
                    disabled={themeIndex <= 0}
                    className="text-sm font-medium text-amber-700 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 px-3 py-1 rounded-full bg-white/60 dark:bg-amber-900/30 hover:bg-white dark:hover:bg-amber-900/50 transition disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700"
                  >
                    ← 上一句
                  </button>
                  <button
                    onClick={nextInSelectedTheme}
                    disabled={themeIndex >= themeSentences.length - 1}
                    className="text-sm font-medium text-amber-700 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 px-3 py-1 rounded-full bg-white/60 dark:bg-amber-900/30 hover:bg-white dark:hover:bg-amber-900/50 transition disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700"
                  >
                    下一句 →
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-xs text-amber-800 dark:text-amber-200">
                  今日已學 {seenToday.length} 句
                </span>
                {themeRemaining.length > 0 ? (
                  <button
                    onClick={nextInTheme}
                    className="text-sm font-medium text-amber-700 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 px-3 py-1 rounded-full bg-white/60 dark:bg-amber-900/30 hover:bg-white dark:hover:bg-amber-900/50 transition"
                  >
                    下一句 →
                  </button>
                ) : (
                  <button
                    onClick={switchTheme}
                    className="text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded-full transition"
                  >
                    換個主題
                  </button>
                )}
              </>
            )}
          </div>

          {!selectedTheme && themeRemaining.length === 0 && (
            <p className="mt-2 text-sm text-amber-800 dark:text-amber-200 text-center">
              🎉 這個主題都學完了！
            </p>
          )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DailyPattern />

      {/* Daily goal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900 dark:text-white">今日目標</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {todayReviewed} / {dailyGoal} 張
          </span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        {goalPct >= 100 && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
            🎉 今日目標達成！
          </p>
        )}
      </div>
      </div>

      {/* Weekly progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">本週進度</h2>
        <div className="flex items-end justify-between gap-2">
          {weekData.map(d => {
            const maxH = 80
            const h = d.reviewed > 0 ? Math.max(8, Math.min(maxH, (d.reviewed / dailyGoal) * maxH)) : 4
            return (
              <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{d.reviewed || ''}</span>
                <div
                  className={`w-full rounded-t transition-all ${
                    d.isToday ? 'bg-purple-500' : d.reviewed > 0 ? 'bg-purple-300 dark:bg-purple-700' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ height: `${h}px` }}
                />
                <span className={`text-xs ${d.isToday ? 'font-bold text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {d.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <StudyCalendar />

      {/* 延伸功能 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">延伸功能</h2>
        <ExtensionCard
          href="/app/favorites"
          icon="♥"
          title="收藏例句"
          description="儲存喜歡的例句，隨時複習"
          accent="border-l-pink-500"
        />
        <ExtensionCard
          href="/app/song-learning"
          icon="🎵"
          title="用歌曲學英文"
          description="搭配英文歌詞，邊聽邊學"
          accent="border-l-violet-600"
        />
        <ExtensionCard
          href="/app/conversation"
          icon="🗣️"
          title="英文會話練習"
          description="模擬真實情境對話，練習開口說英文"
          accent="border-l-emerald-600"
          comingSoon
        />
        <ExtensionCard
          href="/app/chat-review"
          icon="📱"
          title="聊天記錄複習"
          description="從聊天記錄回顧英文用法"
          accent="border-l-amber-600"
          comingSoon
        />
      </div>
    </div>
  )
}

function ExtensionCard({
  href,
  icon,
  title,
  description,
  accent,
  comingSoon,
}: {
  href: string
  icon: string
  title: string
  description: string
  accent: string
  comingSoon?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 bg-white dark:bg-gray-800 border-l-4 ${accent} rounded-xl px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition shadow-sm`}
    >
      <span className="text-2xl shrink-0" aria-hidden>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 dark:text-white truncate">{title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
      </div>
      {comingSoon ? (
        <span className="shrink-0 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md">
          敬請期待
        </span>
      ) : (
        <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
          →
        </span>
      )}
    </Link>
  )
}

function ThemeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
        active
          ? 'bg-purple-500 text-white shadow'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  )
}
