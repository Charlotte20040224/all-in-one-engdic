'use client'

// Reminder runner — registers the Service Worker and, once per minute while
// the app is open, checks whether we should fire today's study reminder. This
// is best-effort: a true scheduled reminder while the tab is closed needs
// server-side Web Push, which we don't have. With the app open, the SW shows a
// system notification at the configured time.

import { useEffect } from 'react'
import { entryActivity, readStudyLog, todayKey } from '@/lib/studyLog'

export const REMINDER_ENABLED_KEY = 'reminder-enabled'
export const REMINDER_TIME_KEY = 'reminder-time'
export const REMINDER_FIRED_PREFIX = 'reminder-fired:'
export const DEFAULT_REMINDER_TIME = '20:00'

export function ReminderRunner() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})

    const tick = async () => {
      try {
        if (localStorage.getItem(REMINDER_ENABLED_KEY) !== '1') return
        if (Notification.permission !== 'granted') return
        const time = localStorage.getItem(REMINDER_TIME_KEY) || DEFAULT_REMINDER_TIME
        const [h, m] = time.split(':').map(Number)
        const now = new Date()
        const target = new Date(now)
        target.setHours(h, m, 0, 0)
        if (now < target) return
        const today = todayKey(now)
        const firedKey = REMINDER_FIRED_PREFIX + today
        if (localStorage.getItem(firedKey) === '1') return

        // Skip if user already studied today.
        const log = readStudyLog()
        if (entryActivity(log[today]) > 0) {
          localStorage.setItem(firedKey, '1') // mark as handled — they don't need a nag
          return
        }

        // Try to fetch due-cards count for a more useful message.
        let dueCount = 0
        try {
          const res = await fetch('/api/words')
          if (res.ok) {
            const words = await res.json()
            const nowDate = new Date()
            dueCount = Array.isArray(words)
              ? words.filter((w: any) => new Date(w.nextReview) <= nowDate).length
              : 0
          }
        } catch {}

        const body = dueCount > 0
          ? `今天還沒複習喔！你有 ${dueCount} 張單字待複習`
          : '今天還沒複習喔！'

        localStorage.setItem(firedKey, '1')

        const reg = await navigator.serviceWorker.ready
        if (reg.active) {
          reg.active.postMessage({ type: 'show-reminder', body })
        } else if ('Notification' in window) {
          new Notification('英文學習提醒', { body })
        }
      } catch {}
    }

    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return null
}
