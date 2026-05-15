'use client'

import { useEffect, useRef, useState } from 'react'
import type { WordEntry } from '@/lib/types'
import { speak as speakThai } from '@/lib/tts'

interface Props {
  words: WordEntry[]
  onClose: () => void
}

const PAUSE_AFTER_THAI_MS = 1000
const PAUSE_AFTER_ZH_MS = 1500

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function speakZh(text: string): Promise<void> {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return resolve()
    window.speechSynthesis.cancel()
    if (!text?.trim()) return resolve()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-TW'
    u.rate = 0.9
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('zh') && /google|natural|premium|enhanced/i.test(v.name))
    const fallback = voices.find(v => v.lang.startsWith('zh'))
    if (preferred) u.voice = preferred
    else if (fallback) u.voice = fallback
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}

export function TodayPlayer({ words, onClose }: Props) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [done, setDone] = useState(false)
  const runIdRef = useRef(0)

  const current = words[index]
  const total = words.length

  const cancelLoops = () => {
    runIdRef.current++
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  const playLoop = async (startIdx: number) => {
    const myRun = ++runIdRef.current
    for (let i = startIdx; i < words.length; i++) {
      if (myRun !== runIdRef.current) return
      setIndex(i)
      try { await speakThai(words[i].thai) } catch { /* ignore */ }
      if (myRun !== runIdRef.current) return
      await delay(PAUSE_AFTER_THAI_MS)
      if (myRun !== runIdRef.current) return
      const meaning = words[i].meaning?.trim()
      if (meaning) await speakZh(meaning)
      if (myRun !== runIdRef.current) return
      await delay(PAUSE_AFTER_ZH_MS)
    }
    if (myRun === runIdRef.current) {
      setPlaying(false)
      setDone(true)
    }
  }

  useEffect(() => {
    if (words.length === 0) return
    playLoop(0)
    return () => {
      cancelLoops()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelLoops()
        onClose()
      }
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  const togglePlay = () => {
    if (done) {
      setDone(false)
      setIndex(0)
      setPlaying(true)
      playLoop(0)
      return
    }
    if (playing) {
      cancelLoops()
      setPlaying(false)
    } else {
      setPlaying(true)
      playLoop(index)
    }
  }

  const goPrev = () => {
    if (index === 0) return
    cancelLoops()
    const next = index - 1
    setIndex(next)
    setDone(false)
    if (playing) playLoop(next)
  }

  const goNext = () => {
    if (index >= total - 1) return
    cancelLoops()
    const next = index + 1
    setIndex(next)
    setDone(false)
    if (playing) playLoop(next)
  }

  const handleClose = () => {
    cancelLoops()
    onClose()
  }

  if (total === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="關閉"
          className="absolute top-3 right-3 w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-base touch-manipulation"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">📻 今日單字複習</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {done ? '已播放完畢' : `${index + 1} / ${total}`}
        </div>

        {!done && current && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 text-center space-y-2 min-h-[180px] flex flex-col justify-center">
            <div data-thai className="text-4xl font-bold text-gray-900 dark:text-white break-words">
              {current.thai}
            </div>
            {current.pinyin && (
              <div data-pinyin className="text-purple-600 dark:text-purple-400">{current.pinyin}</div>
            )}
            {current.pos && (
              <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                {current.pos}
              </span>
            )}
            <div className="text-gray-700 dark:text-gray-200 text-lg">{current.meaning}</div>
          </div>
        )}

        {done && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-8 text-center min-h-[180px] flex flex-col justify-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-lg font-semibold text-green-700 dark:text-green-300">今日單字複習完成！</div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">共播放 {total} 個單字</div>
          </div>
        )}

        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${((done ? total : index + 1) / total) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            onClick={goPrev}
            disabled={index === 0 || done}
            aria-label="上一個"
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 transition flex items-center justify-center text-lg touch-manipulation"
          >
            ⏮
          </button>
          <button
            onClick={togglePlay}
            aria-label={playing ? '暫停' : '播放'}
            className="w-14 h-14 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition flex items-center justify-center text-xl touch-manipulation"
          >
            {done ? '🔁' : playing ? '⏸' : '▶'}
          </button>
          <button
            onClick={goNext}
            disabled={index >= total - 1 || done}
            aria-label="下一個"
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 transition flex items-center justify-center text-lg touch-manipulation"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  )
}
