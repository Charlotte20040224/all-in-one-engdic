'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type FontStyle = 'default' | 'kanit' | 'sarabun' | 'mitr' | 'prompt'

const FONT_FAMILIES: Record<FontStyle, string> = {
  default: '',
  kanit:   "'Kanit', sans-serif",
  sarabun: "'Sarabun', sans-serif",
  mitr:    "'Mitr', sans-serif",
  prompt:  "'Prompt', sans-serif",
}

const FontContext = createContext<{
  fontStyle: FontStyle
  setFont: (font: FontStyle) => void
}>({ fontStyle: 'default', setFont: () => {} })

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontStyle, setFontStyle] = useState<FontStyle>('default')

  useEffect(() => {
    const stored = (localStorage.getItem('font-style') ?? 'default') as FontStyle
    applyFont(stored)
    setFontStyle(stored)
  }, [])

  const setFont = (font: FontStyle) => {
    localStorage.setItem('font-style', font)
    applyFont(font)
    setFontStyle(font)
  }

  return <FontContext.Provider value={{ fontStyle, setFont }}>{children}</FontContext.Provider>
}

function applyFont(font: FontStyle) {
  const family = FONT_FAMILIES[font]
  if (family) {
    document.body.style.setProperty('--thai-font', family)
    document.body.classList.add('font-decorative')
  } else {
    document.body.style.removeProperty('--thai-font')
    document.body.classList.remove('font-decorative')
  }
}

export const useFont = () => useContext(FontContext)
