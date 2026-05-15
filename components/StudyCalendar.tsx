'use client'

import { useEffect, useMemo, useState } from 'react'
import { entryActivity, readStudyLog, todayKey, type StudyLog, type StudyLogEntry } from '@/lib/studyLog'

const MONTHS_TO_SHOW = 3
const DAY_BOX = 'w-3.5 h-3.5 rounded-sm'

function intensityClass(activity: number): string {
  if (activity <= 0) return 'bg-gray-100 dark:bg-gray-700'
  if (activity < 3) return 'bg-green-200 dark:bg-green-900/60'
  if (activity < 8) return 'bg-green-400 dark:bg-green-700'
  if (activity < 15) return 'bg-green-500 dark:bg-green-600'
  return 'bg-green-600 dark:bg-green-500'
}

interface DayCell {
  key: string
  date: Date
  inRange: boolean
}

export function StudyCalendar() {
  const [log, setLog] = useState<StudyLog>({})
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    setLog(readStudyLog())
  }, [])

  const { weeks, dayHeaders } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setMonth(start.getMonth() - MONTHS_TO_SHOW)
    // align start to nearest previous Sunday (so columns are weeks)
    start.setDate(start.getDate() - start.getDay())

    const cells: DayCell[] = []
    const cursor = new Date(start)
    while (cursor <= today) {
      cells.push({
        key: todayKey(cursor),
        date: new Date(cursor),
        inRange: cursor.getMonth() >= today.getMonth() - MONTHS_TO_SHOW || cursor.getFullYear() > today.getFullYear() - 1,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    // chunk into weeks (7 rows per column)
    const ws: DayCell[][] = []
    for (let i = 0; i < cells.length; i += 7) ws.push(cells.slice(i, i + 7))
    return { weeks: ws, dayHeaders: ['日', '一', '二', '三', '四', '五', '六'] }
  }, [])

  const selectedEntry: StudyLogEntry | undefined = selected ? log[selected] : undefined
  const todayK = todayKey()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">📅 學習日曆</h2>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
          <span>少</span>
          {[0, 2, 6, 12, 20].map(v => (
            <span key={v} className={`${DAY_BOX} ${intensityClass(v)}`} />
          ))}
          <span>多</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-3 items-start">
          <div className="flex flex-col gap-1 pt-4 text-[10px] text-gray-400 dark:text-gray-500">
            {dayHeaders.map((d, i) => (
              <span key={i} className="h-3.5 leading-3.5">{i % 2 === 1 ? d : ''}</span>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((wk, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {wk.map(cell => {
                  const e = log[cell.key]
                  const activity = entryActivity(e)
                  const isToday = cell.key === todayK
                  const isSelected = selected === cell.key
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => setSelected(isSelected ? null : cell.key)}
                      title={`${cell.key}：複習 ${e?.reviewed ?? 0}、新增 ${e?.learned ?? 0}、句型 ${e?.patterns ?? 0}`}
                      className={`${DAY_BOX} ${intensityClass(activity)} transition ${
                        isSelected
                          ? 'ring-2 ring-purple-500'
                          : isToday ? 'ring-1 ring-blue-400 dark:ring-blue-300' : ''
                      }`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedEntry && selected && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{selected}</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <DayStat label="複習" value={selectedEntry.reviewed ?? 0} />
            <DayStat label="新增單字" value={selectedEntry.learned ?? 0} />
            <DayStat label="句型" value={selectedEntry.patterns ?? 0} />
          </div>
          {(selectedEntry.quizCorrect || selectedEntry.quizWrong) ? (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
              小測驗：{selectedEntry.quizCorrect ?? 0} 對 / {selectedEntry.quizWrong ?? 0} 錯
            </div>
          ) : null}
        </div>
      )}

      {selected && !selectedEntry && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          {selected}：這天沒有學習紀錄
        </div>
      )}
    </div>
  )
}

function DayStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  )
}
