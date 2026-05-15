'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const PinyinContext = createContext<{
  hidden: boolean
  toggle: () => void
}>({ hidden: false, toggle: () => {} })

export function PinyinProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('hide-pinyin') === '1'
    setHidden(stored)
    document.body.classList.toggle('hide-pinyin', stored)
  }, [])

  const toggle = () => {
    setHidden(prev => {
      const next = !prev
      localStorage.setItem('hide-pinyin', next ? '1' : '0')
      document.body.classList.toggle('hide-pinyin', next)
      return next
    })
  }

  return <PinyinContext.Provider value={{ hidden, toggle }}>{children}</PinyinContext.Provider>
}

export const usePinyin = () => useContext(PinyinContext)
