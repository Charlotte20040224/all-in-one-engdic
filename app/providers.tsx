'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from './theme-provider'
import { FontProvider } from './font-provider'
import { IpaProvider } from './ipa-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <FontProvider>
          <IpaProvider>{children}</IpaProvider>
        </FontProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
