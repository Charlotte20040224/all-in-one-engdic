'use client'

import { useEffect, useMemo, useState } from 'react'
import { entryActivity, readStudyLog, streakFromLog, todayKey, type StudyLog } from '@/lib/studyLog'

const DISMISS_KEY_PREFIX = 'weekly-report-dismissed:'

const CATEGORY_LABEL: Record<string, string> = {
  all: '全部',
  hard: '困難',
  A_modal: 'A 助動詞',
  B_tense: 'B 時態',
  C_connector: 'C 連接詞',
  D_question: 'D 疑問',
  E_comparison: 'E 比較',
  F_confusable: 'F 混淆字',
  G_daily: 'G 生活',
}

function isMonday(d: Date) {
  return d.getDay() === 1
}

function rangeKeys(end: Date, days: number): string[] {
  const out: string[] = []
  const cur = new Date(end)
  for (let i = 0; i < days; i++) {
    out.push(todayKey(cur))
    cur.setDate(cur.getDate() - 1)
  }
  return out
}

interface WeeklySummary {
  weekLabel: string
  newWords: number
  reviews: number
  accuracyPct: number | null
  topCategory: string | null
  streak: number
}

function summarizeLastWeek(log: StudyLog): WeeklySummary {
  // "Last week" = previous Monday → Sunday relative to today.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastSun = new Date(today)
  // back up to most recent Sunday (this week's Sunday is today if today is Sunday)
  lastSun.setDate(today.getDate() - ((today.getDay() + 0) % 7) - 0)
  // Actually simpler: take the 7 days preceding today.
  const keys = rangeKeys(new Date(today.getTime() - 86400000), 7).reverse()
  const start = keys[0]
  const end = keys[keys.length - 1]

  let newWords = 0
  let reviews = 0
  let correct = 0
  let wrong = 0
  const cats: Record<string, number> = {}
  for (const k of keys) {
    const e = log[k]
    if (!e) continue
    newWords += e.learned ?? 0
    reviews += e.reviewed ?? 0
    correct += e.quizCorrect ?? 0
    wrong += e.quizWrong ?? 0
    if (e.categories) for (const [c, n] of Object.entries(e.categories)) cats[c] = (cats[c] ?? 0) + n
  }
  const total = correct + wrong
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : null
  const topCategory = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  return {
    weekLabel: `${start} ～ ${end}`,
    newWords,
    reviews,
    accuracyPct,
    topCategory,
    streak: streakFromLog(log),
  }
}

export function WeeklyReport() {
  const [log, setLog] = useState<StudyLog>({})
  const [dismissed, setDismissed] = useState(false)
  const dismissKey = useMemo(() => {
    const t = new Date()
    return DISMISS_KEY_PREFIX + todayKey(t)
  }, [])

  useEffect(() => {
    setLog(readStudyLog())
    if (typeof window !== 'undefined') {
      setDismissed(localStorage.getItem(dismissKey) === '1')
    }
  }, [dismissKey])

  const today = new Date()
  if (!isMonday(today) || dismissed) return null

  const summary = summarizeLastWeek(log)
  // No activity at all → don't bother showing the report
  const hasAny = summary.newWords + summary.reviews > 0 || (summary.accuracyPct !== null)
  if (!hasAny) return null

  const close = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') localStorage.setItem(dismissKey, '1')
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl shadow p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">📊 上週學習報告</h2>
          <div className="text-xs text-gray-500 dark:text-gray-400">{summary.weekLabel}</div>
        </div>
        <button
          type="button"
          onClick={close}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 transition"
          title="關閉"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="新增單字" value={summary.newWords.toString()} />
        <Stat label="複習次數" value={summary.reviews.toString()} />
        <Stat label="正確率" value={summary.accuracyPct === null ? '—' : `${summary.accuracyPct}%`} />
        <Stat label="連續天數" value={`${summary.streak} 天`} />
      </div>
      {summary.topCategory && (
        <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
          🔥 最常學的類別：<span className="font-semibold">{CATEGORY_LABEL[summary.topCategory] ?? summary.topCategory}</span>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 rounded p-2 text-center">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  )
}
