export const SRS_INTERVALS = [1, 3, 7] // days

export type Rating = 'hard' | 'ok' | 'easy'

export function nextSrsState(currentLevel: number, rating: Rating) {
  let newLevel: number
  let daysUntilReview: number

  if (rating === 'hard') {
    newLevel = Math.max(0, currentLevel - 1)
    daysUntilReview = SRS_INTERVALS[0]
  } else if (rating === 'ok') {
    newLevel = Math.min(currentLevel, SRS_INTERVALS.length - 1)
    daysUntilReview = SRS_INTERVALS[1]
  } else {
    newLevel = Math.min(currentLevel + 1, SRS_INTERVALS.length - 1)
    daysUntilReview = SRS_INTERVALS[Math.min(newLevel, SRS_INTERVALS.length - 1)]
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + daysUntilReview)
  nextReview.setHours(0, 0, 0, 0)

  return { newLevel, nextReview }
}

export function srsLabel(level: number) {
  if (level === 0) return '不熟'
  if (level === 1) return '還好'
  return '已掌握'
}

export function srsColor(level: number) {
  if (level === 0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/25 dark:text-yellow-100'
  if (level === 1) return 'bg-blue-100 text-blue-800 dark:bg-blue-500/25 dark:text-blue-100'
  return 'bg-green-100 text-green-800 dark:bg-green-500/25 dark:text-green-100'
}
