'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { setTtsSpeedCache, getTtsVoice, setTtsVoiceCache, type TtsVoice } from '@/lib/tts'
import {
  REMINDER_ENABLED_KEY,
  REMINDER_TIME_KEY,
  DEFAULT_REMINDER_TIME,
} from '@/components/ReminderRunner'

const SPEED_OPTIONS = [
  { value: 0.7, label: '🐢 慢速', desc: '初學者推薦' },
  { value: 1.0, label: '🚶 正常', desc: '一般' },
  { value: 1.2, label: '🏃 快速', desc: '進階' },
]

const VOICE_OPTIONS: { value: TtsVoice; emoji: string; accent: string; gender: string }[] = [
  { value: 'us-f', emoji: '🇺🇸', accent: '美式', gender: '女聲' },
  { value: 'us-m', emoji: '🇺🇸', accent: '美式', gender: '男聲' },
  { value: 'gb-f', emoji: '🇬🇧', accent: '英式', gender: '女聲' },
  { value: 'gb-m', emoji: '🇬🇧', accent: '英式', gender: '男聲' },
]

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [dailyGoal, setDailyGoal] = useState(10)
  const [ttsSpeed, setTtsSpeed] = useState(0.7)
  const [ttsVoice, setTtsVoiceState] = useState<TtsVoice>('us-f')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [nickname, setNickname] = useState('')
  const [nicknameSaving, setNicknameSaving] = useState(false)
  const [nicknameSaved, setNicknameSaved] = useState(false)
  const [nicknameError, setNicknameError] = useState<string | null>(null)

  const googleName = session?.user?.name ?? ''
  const currentNickname = session?.user?.nickname ?? ''

  useEffect(() => {
    setNickname(currentNickname)
  }, [currentNickname])

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setDailyGoal(data.dailyGoal ?? 10)
        const speed = data.ttsSpeed ?? 0.7
        setTtsSpeed(speed)
        setTtsSpeedCache(speed)
        setLoading(false)
      })
    if (typeof window !== 'undefined') {
      setReminderEnabled(localStorage.getItem(REMINDER_ENABLED_KEY) === '1')
      setReminderTime(localStorage.getItem(REMINDER_TIME_KEY) || DEFAULT_REMINDER_TIME)
      setTtsVoiceState(getTtsVoice())
      if (typeof Notification === 'undefined') setPermission('unsupported')
      else setPermission(Notification.permission)
    }
  }, [])

  const toggleReminder = async (next: boolean) => {
    if (typeof window === 'undefined') return
    if (next && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') {
        setReminderEnabled(false)
        localStorage.setItem(REMINDER_ENABLED_KEY, '0')
        return
      }
    }
    setReminderEnabled(next)
    localStorage.setItem(REMINDER_ENABLED_KEY, next ? '1' : '0')
  }

  const updateReminderTime = (t: string) => {
    setReminderTime(t)
    if (typeof window !== 'undefined') localStorage.setItem(REMINDER_TIME_KEY, t)
  }

  const save = async () => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyGoal, ttsSpeed }),
    })
    setTtsSpeedCache(ttsSpeed)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const saveNickname = async () => {
    const trimmed = nickname.trim()
    if (trimmed.length > 20) {
      setNicknameError('暱稱最多 20 字')
      return
    }
    setNicknameSaving(true)
    setNicknameError(null)
    try {
      const res = await fetch('/api/user/nickname', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: trimmed }),
      })
      if (res.ok) {
        await updateSession()
        setNicknameSaved(true)
        setTimeout(() => setNicknameSaved(false), 2000)
      } else {
        const data = await res.json().catch(() => ({}))
        setNicknameError(data?.error || '儲存失敗')
      }
    } finally {
      setNicknameSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">設定</h1>

      {/* Nickname */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            暱稱
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            顯示在社群貼文與留言；留空則使用 Google 帳號名字
          </p>
        </div>
        <input
          type="text"
          value={nickname}
          onChange={e => { setNickname(e.target.value); setNicknameError(null) }}
          maxLength={20}
          placeholder={googleName || '輸入暱稱'}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="flex justify-between items-center text-xs">
          <span className="text-rose-500 min-h-[1em]">{nicknameError || ''}</span>
          <span className="text-gray-400 dark:text-gray-500">{nickname.length}/20</span>
        </div>
        <button
          onClick={saveNickname}
          disabled={nicknameSaving || nickname === currentNickname}
          className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {nicknameSaving ? '儲存中...' : nicknameSaved ? '✓ 已儲存' : '儲存暱稱'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
        {/* Daily goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            每日複習目標（張）
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={50}
              value={dailyGoal}
              onChange={e => setDailyGoal(Number(e.target.value))}
              className="flex-1 accent-purple-600"
            />
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400 w-10 text-right">
              {dailyGoal}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        {/* TTS speed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            音檔語速
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SPEED_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTtsSpeed(opt.value)}
                className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition ${
                  ttsSpeed === opt.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-300'
                }`}
              >
                <span className="text-xl mb-1">{opt.label.split(' ')[0]}</span>
                <span className="text-xs font-medium">{opt.label.split(' ')[1]}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TTS voice */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            發音語音
          </label>
          <div className="grid grid-cols-2 gap-2">
            {VOICE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setTtsVoiceState(opt.value)
                  setTtsVoiceCache(opt.value)
                }}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition ${
                  ttsVoice === opt.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-300'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.accent} {opt.gender}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            🔊 點任何單字旁的喇叭按鈕就會用所選語音播放
          </p>
        </div>

        <button
          onClick={save}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
        >
          {saved ? '✓ 已儲存' : '儲存設定'}
        </button>
      </div>

      {/* Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">學習提醒</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">每天到設定時間，App 開著時會送系統通知</p>
          </div>
          <button
            type="button"
            onClick={() => toggleReminder(!reminderEnabled)}
            disabled={permission === 'unsupported'}
            className={`relative w-12 h-7 rounded-full transition ${
              reminderEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
            } disabled:opacity-50`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition ${
              reminderEnabled ? 'left-5' : 'left-0.5'
            }`} />
          </button>
        </div>

        {reminderEnabled && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700 dark:text-gray-300">提醒時間</label>
            <input
              type="time"
              value={reminderTime}
              onChange={e => updateReminderTime(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {permission === 'unsupported' && (
          <p className="text-xs text-gray-500 dark:text-gray-400">這個瀏覽器不支援系統通知</p>
        )}
        {permission === 'denied' && (
          <p className="text-xs text-amber-600 dark:text-amber-400">通知權限被拒，請從瀏覽器設定中開啟</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">關於 SRS 間隔複習</h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-16 text-center px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs">不熟</span>
            → 1 天後再複習
          </li>
          <li className="flex items-center gap-2">
            <span className="w-16 text-center px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs">還好</span>
            → 3 天後再複習
          </li>
          <li className="flex items-center gap-2">
            <span className="w-16 text-center px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs">熟悉</span>
            → 7 天後再複習
          </li>
        </ul>
      </div>
    </div>
  )
}
