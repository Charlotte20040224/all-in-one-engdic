'use client'

import { useRef, useState } from 'react'

const faqs: { q: string; a: string }[] = [
  {
    q: '從 IG / Threads 點進來登入失敗？',
    a: '點右上角 ⋯ 選「用瀏覽器開啟」，再用 Chrome 或 Safari 登入就好！',
  },
  {
    q: '單字庫會消失嗎？',
    a: '不會！存在雲端，任何裝置用同一個 Google 帳號登入都看得到。',
  },
  {
    q: '可以輸入中文查英文嗎？',
    a: '可以！輸入「吃」或「謝謝」，AI 會直接找出對應英文。',
  },
  {
    q: '這個 App 要付費嗎？',
    a: '完全免費！但每次查詢都從開發者帳戶扣款，歡迎小額贊助 ☕',
  },
  {
    q: '發音語速太快 / 太慢怎麼辦？',
    a: '去「⚙️ 設定」調整音檔語速，有 🐢 慢速 / 🚶 正常 / 🏃 快速可以選！',
  },
  {
    q: '每次都要重新登入很麻煩？',
    a: '記得用固定的瀏覽器開啟，不要從 IG 內建瀏覽器進入，登入後 10 天內不需要重新登入。',
  },
  {
    q: '英文例句裡出現了中文字是 bug 嗎？',
    a: '是的！這是 AI 偶爾會犯的錯誤，如果遇到歡迎透過回饋按鈕告訴我，我會盡快修正。',
  },
]

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: { q: string; a: string }
  isOpen: boolean
  onToggle: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <span
          className={`text-xs text-gray-500 dark:text-gray-400 mt-1 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-90' : ''
          }`}
          aria-hidden="true"
        >
          ▶
        </span>
        <span className="font-bold text-gray-900 dark:text-white flex-1">
          Q：{item.q}
        </span>
      </button>

      <div
        ref={contentRef}
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 500}px` : '0px',
        }}
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
      >
        <p className="px-4 pb-4 pl-10 text-gray-500 dark:text-gray-400 leading-relaxed">
          A：{item.a}
        </p>
      </div>
    </div>
  )
}

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          常見問答 Q&amp;A
        </h1>

        <div className="space-y-3">
          {faqs.map((item, idx) => (
            <FaqItem
              key={idx}
              item={item}
              isOpen={openIdx === idx}
              onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
