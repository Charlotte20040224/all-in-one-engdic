// Local-only study activity log keyed by YYYY-MM-DD.
// Powers the calendar, weekly report, and reminder logic. No backend.

export const STUDY_LOG_KEY = 'study-log'

export interface StudyLogEntry {
  reviewed?: number          // SRS review answers
  learned?: number           // words saved
  patterns?: number          // patterns marked learned
  quizCorrect?: number       // pattern quiz correct
  quizWrong?: number         // pattern quiz wrong
  categories?: Record<string, number>  // pattern category counts
}

export type StudyLog = Record<string, StudyLogEntry>

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function readStudyLog(): StudyLog {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STUDY_LOG_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as StudyLog) : {}
  } catch {
    return {}
  }
}

function writeStudyLog(log: StudyLog) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(log))
  } catch {}
}

export function bumpStudyLog(
  patch: Partial<Omit<StudyLogEntry, 'categories'>> & { category?: string },
  date: string = todayKey(),
) {
  const log = readStudyLog()
  const cur: StudyLogEntry = { ...(log[date] ?? {}) }
  if (patch.reviewed) cur.reviewed = (cur.reviewed ?? 0) + patch.reviewed
  if (patch.learned) cur.learned = (cur.learned ?? 0) + patch.learned
  if (patch.patterns) cur.patterns = (cur.patterns ?? 0) + patch.patterns
  if (patch.quizCorrect) cur.quizCorrect = (cur.quizCorrect ?? 0) + patch.quizCorrect
  if (patch.quizWrong) cur.quizWrong = (cur.quizWrong ?? 0) + patch.quizWrong
  if (patch.category) {
    const cats = { ...(cur.categories ?? {}) }
    cats[patch.category] = (cats[patch.category] ?? 0) + 1
    cur.categories = cats
  }
  log[date] = cur
  writeStudyLog(log)
}

export function entryActivity(e: StudyLogEntry | undefined): number {
  if (!e) return 0
  return (e.reviewed ?? 0) + (e.learned ?? 0) + (e.patterns ?? 0)
}

export function streakFromLog(log: StudyLog, from: Date = new Date()): number {
  let streak = 0
  const cursor = new Date(from)
  while (true) {
    const k = todayKey(cursor)
    if (entryActivity(log[k]) > 0) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      // allow today to be empty if streak hasn't started; otherwise stop
      if (streak === 0 && k === todayKey(from)) {
        cursor.setDate(cursor.getDate() - 1)
        continue
      }
      break
    }
  }
  return streak
}
