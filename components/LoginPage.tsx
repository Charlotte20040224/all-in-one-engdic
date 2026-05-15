'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'

function detectWebView(ua: string): boolean {
  return /Instagram|Threads|FBAN|FBAV|Line|GSA|\bwv\b/i.test(ua)
}

const BANNER_DISMISS_KEY = 'webview_banner_dismissed'

export function LoginPage() {
  const [isWebView, setIsWebView] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [bannerOpen, setBannerOpen] = useState(false)

  useEffect(() => {
    setIsWebView(detectWebView(navigator.userAgent))
    setCurrentUrl(window.location.origin)
    setBannerOpen(localStorage.getItem(BANNER_DISMISS_KEY) !== 'true')
  }, [])

  const dismissBanner = () => {
    setBannerOpen(false)
    localStorage.setItem(BANNER_DISMISS_KEY, 'true')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {bannerOpen && (
        <button
          onClick={dismissBanner}
          className="fixed top-0 inset-x-0 z-50 bg-amber-400 hover:bg-amber-500 text-amber-900 text-xs sm:text-sm font-medium px-4 py-2 flex items-center justify-between gap-3 transition text-left"
        >
          <span>📱 從 Instagram/Threads 點進來？請用瀏覽器開啟以正常登入</span>
          <span className="shrink-0 opacity-70">✕</span>
        </button>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇹🇭</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">英文單字學習</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">用 SRS 系統高效學習英文</p>
        </div>

        {isWebView ? (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-5 mb-4">
            <h2 className="text-lg font-bold text-yellow-800 mb-2">⚠️ 請用瀏覽器開啟</h2>
            <p className="text-yellow-900 text-sm leading-relaxed mb-3">
              目前你是從 App 內建瀏覽器開啟，Google 登入無法在這裡使用。
            </p>
            <p className="text-yellow-900 text-sm font-semibold mb-1">請照以下步驟操作：</p>
            <ol className="text-yellow-900 text-sm space-y-1 list-decimal list-inside mb-3">
              <li>點右上角的 ⋯ 或選單按鈕</li>
              <li>選擇「用瀏覽器開啟」或「Open in Browser」</li>
              <li>在 Chrome 或 Safari 裡重新登入</li>
            </ol>
            <p className="text-yellow-900 text-sm mb-2">或者複製網址手動貼到瀏覽器：</p>
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2 text-xs text-yellow-800 break-all font-mono select-all">
              {currentUrl}
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => signIn('google', { callbackUrl: '/app' })}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登入
            </button>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              💡 小提示：請固定使用同一個瀏覽器（建議 Chrome 或 Safari）開啟本網站，避免從 Instagram / Threads 的內建瀏覽器進入，這樣就不需要一直重新登入！
            </p>
          </>
        )}
      </div>
    </div>
  )
}
