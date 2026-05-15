'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/app/theme-provider'
import { useFont, FontStyle } from '@/app/font-provider'
import { usePinyin } from '@/app/pinyin-provider'

const primaryLinks = [
  { href: '/app',           label: '主頁',   icon: '🏠' },
  { href: '/app/review',    label: '複習',   icon: '📖' },
  { href: '/app/add',       label: '新增',   icon: '＋' },
  { href: '/app/words',     label: '單字庫', icon: '📚' },
  { href: '/app/sentences', label: '句子庫', icon: '✏️' },
  { href: '/app/settings',  label: '設定',   icon: '⚙️' },
]

const secondaryLinks: { href: string; label: string; icon: string }[] = [
  { href: '/app/community', label: '社群',     icon: '👥' },
  { href: '/app/faq',       label: '常見問答', icon: '💡' },
  { href: '/app/about',     label: '關於開發者', icon: '🛠️' },
]

const FONT_OPTIONS: { id: FontStyle; label: string }[] = [
  { id: 'default', label: '標準字體' },
  { id: 'kanit',   label: 'Kanit（海報體）' },
  { id: 'sarabun', label: 'Sarabun（政府/正式）' },
  { id: 'mitr',    label: 'Mitr（圓潤可愛）' },
  { id: 'prompt',  label: 'Prompt（設計感）' },
]

export function NavBar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const { fontStyle, setFont } = useFont()
  const { hidden: pinyinHidden, toggle: togglePinyin } = usePinyin()
  const [moreOpen, setMoreOpen] = useState(false)
  const [fontExpanded, setFontExpanded] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
        setFontExpanded(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const closeMore = () => {
    setMoreOpen(false)
    setFontExpanded(false)
  }

  const navLinkClass = (href: string) =>
    `px-2 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
      pathname === href
        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`

  const menuItemClass =
    'w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left'

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around md:justify-center gap-0.5 md:gap-1 h-12 md:h-14">
          {primaryLinks.map(l => (
            <Link key={l.href} href={l.href} className={navLinkClass(l.href)} title={l.label}>
              <span>{l.icon}</span>
              <span className="hidden md:inline">{l.label}</span>
            </Link>
          ))}

          <div ref={moreRef} className="relative">
            <button
              onClick={() => { setMoreOpen(o => !o); setFontExpanded(false) }}
              title={moreOpen ? '收合' : '更多'}
              aria-label={moreOpen ? '收合更多選項' : '展開更多選項'}
              aria-expanded={moreOpen}
              className={`px-2 py-1.5 rounded-lg text-lg font-bold leading-none transition ${
                moreOpen
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              ⋯
            </button>

            {moreOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                {secondaryLinks.map(l => {
                  const active = pathname === l.href
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={closeMore}
                      className={`${menuItemClass} ${active ? 'text-purple-600 dark:text-purple-300' : ''}`}
                    >
                      <span>{l.icon}</span>
                      <span>{l.label}</span>
                    </Link>
                  )
                })}

                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                <button
                  onClick={() => setFontExpanded(e => !e)}
                  className={menuItemClass}
                  aria-expanded={fontExpanded}
                >
                  <span className="font-serif italic">abc</span>
                  <span>字體切換</span>
                  <span className="ml-auto text-xs text-gray-400">{fontExpanded ? '▾' : '▸'}</span>
                </button>
                {fontExpanded && (
                  <div className="bg-gray-50 dark:bg-gray-900/40">
                    {FONT_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setFont(opt.id); setFontExpanded(false) }}
                        className="w-full flex items-center justify-between pl-10 pr-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <span>{opt.label}</span>
                        {fontStyle === opt.id && <span className="text-purple-500">✓</span>}
                      </button>
                    ))}
                  </div>
                )}

                <button onClick={() => { togglePinyin(); closeMore() }} className={menuItemClass}>
                  <span>👁️</span>
                  <span>{pinyinHidden ? '顯示拼音' : '隱藏拼音'}</span>
                </button>

                <button onClick={() => { toggle(); closeMore() }} className={menuItemClass}>
                  <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                  <span>{theme === 'dark' ? '切換淺色模式' : '切換深色模式'}</span>
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                <button
                  onClick={() => { closeMore(); signOut({ callbackUrl: '/' }) }}
                  className={`${menuItemClass} text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400`}
                >
                  <span>↩︎</span>
                  <span>登出</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
