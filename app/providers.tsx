'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from './theme-provider'
import { FontProvider } from './font-provider'
import { PinyinProvider } from './pinyin-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <FontProvider>
          <PinyinProvider>{children}</PinyinProvider>
        </FontProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
