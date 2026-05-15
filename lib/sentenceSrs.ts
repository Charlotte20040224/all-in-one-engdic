export type Rating = 'hard' | 'ok' | 'easy'

export interface SentenceSrsState {
  interval: number
  easeFactor: number
  repetitions: number
}

export function nextSentenceSrsState(state: SentenceSrsState, rating: Rating) {
  let { interval, easeFactor, repetitions } = state

  if (rating === 'hard') {
    repetitions = 0
    interval = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  } else if (rating === 'ok') {
    repetitions += 1
    if (repetitions === 1) interval = 1
    else if (repetitions === 2) interval = 3
    else interval = Math.max(1, Math.round(interval * easeFactor))
  } else {
    repetitions += 1
    if (repetitions === 1) interval = 3
    else if (repetitions === 2) interval = 7
    else interval = Math.max(1, Math.round(interval * easeFactor * 1.3))
    easeFactor = easeFactor + 0.15
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)
  nextReview.setHours(0, 0, 0, 0)

  return { interval, easeFactor, repetitions, nextReview }
}

export function sentenceLevel(repetitions: number, interval: number): number {
  if (repetitions === 0) return 0
  if (interval < 7) return 1
  return 2
}

export function sentenceLevelLabel(level: number) {
  if (level === 0) return '不熟'
  if (level === 1) return '還好'
  return '已掌握'
}

export function sentenceLevelColor(level: number) {
  if (level === 0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/25 dark:text-yellow-100'
  if (level === 1) return 'bg-blue-100 text-blue-800 dark:bg-blue-500/25 dark:text-blue-100'
  return 'bg-green-100 text-green-800 dark:bg-green-500/25 dark:text-green-100'
}
