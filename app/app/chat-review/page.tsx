'use client'

import { useState } from 'react'
import { FeedbackModal } from '@/components/FeedbackBar'

export default function ChatReviewPage() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📱 聊天記錄複習</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-5 text-center">
        <div className="text-5xl">🚧</div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">敬請期待</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
          {`這個功能目前還在開發中，即將開放！
如果你對這個功能有興趣，歡迎填寫回饋表單告訴我，
你的支持是我繼續開發的動力 🙏`}
        </p>
        <button
          onClick={() => setFeedbackOpen(true)}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
        >
          💬 我想要這個功能！
        </button>
      </div>

      {feedbackOpen && (
        <FeedbackModal
          onClose={() => setFeedbackOpen(false)}
          initialTypes={['🌟 許願功能']}
        />
      )}
    </div>
  )
}
