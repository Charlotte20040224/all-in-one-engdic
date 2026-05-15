'use client'

import { useState } from 'react'

const TYPES = ['功能建議', '問題回報', '發音錯誤', '🌟 許願功能', '其他'] as const
const ACCOUNTS = [
  { bank: '郵局（700）', number: '24411940274630' },
  { bank: '國泰（013）', number: '699514722424' },
  { bank: '中國信託（822）', number: '259540229338' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={copy}
      className="shrink-0 text-xs px-2.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition whitespace-nowrap"
    >
      {copied ? '✓ 已複製' : '複製'}
    </button>
  )
}

function DonationFloat() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating ☕ button — fixed bottom-right */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title="支持 Charlotte"
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center transition"
      >
        ☕
      </button>

      {/* Card panel — anchored above the button */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[min(380px,calc(100vw-2rem))] max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-2xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white">☕ 喜歡這個字典嗎？</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="關閉"
              className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            每次查詢都從 Charlotte 帳戶扣款 🫠
          </p>

          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            สวัสดีค่ะทุกคน 🙏 我是 Charlotte！是一名半工半讀養活自己的大學生。你們每一次查詢都會從我的帳戶扣款 🫠 即使是一杯 ☕️ 的錢，我都會感到非常感恩，並持續優化系統和開放字典讓大家使用。
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 space-y-1">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">🇹🇼 台灣粉絲：直接匯款</div>
            {ACCOUNTS.map(({ bank, number }) => (
              <div key={bank} className="flex items-center justify-between gap-2">
                <span className="text-xs text-amber-800 dark:text-amber-300">
                  {bank}｜<span className="font-mono">{number}</span>
                </span>
                <CopyButton text={number} />
              </div>
            ))}
          </div>

          <a
            href="https://buymeacoffee.com/charlottehsu"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-sm px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition"
          >
            ☕ Buy Me a Coffee
          </a>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-snug">
            🌐 海外粉絲可透過 Buy Me a Coffee 贊助
            <br />
            International supporters are welcome 💕
          </p>
        </div>
      )}
    </>
  )
}

export function FeedbackBar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">使用上有任何問題或建議？</span>
          <button
            onClick={() => setOpen(true)}
            className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
          >
            💬 回饋
          </button>
        </div>
      </div>

      <DonationFloat />

      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  )
}

export function FeedbackModal({ onClose, initialTypes }: { onClose: () => void; initialTypes?: string[] }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialTypes ?? [])
  const [rating, setRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const toggleType = (t: string) =>
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const submit = async () => {
    if (!message.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedTypes, rating, message }),
      })
      setDone(true)
      setTimeout(onClose, 1800)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        {done ? (
          <div className="text-center py-6 space-y-2">
            <div className="text-3xl">🎉</div>
            <p className="font-semibold text-gray-800 dark:text-white">感謝你的回饋！</p>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">💬 使用回饋</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">你的意見對改善這個 App 很重要！</p>
            </div>

            {/* Type chips */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">回饋類型（可多選）</p>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition ${
                      selectedTypes.includes(t)
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Star rating */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">整體評分</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`text-2xl transition ${n <= (rating ?? 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">詳細說明</p>
              {selectedTypes.includes('🌟 許願功能') && (
                <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                  你希望我做什麼英文學習資源或功能？例如：英文文法教學、發音練習、會話練習...
                </p>
              )}
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="請描述你遇到的問題或建議..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                取消
              </button>
              <button
                onClick={submit}
                disabled={submitting || !message.trim()}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition"
              >
                {submitting ? '送出中…' : '送出回饋'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
