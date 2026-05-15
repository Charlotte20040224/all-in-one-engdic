'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const PinyinContext = createContext<{
  hidden: boolean
  toggle: () => void
}>({ hidden: false, toggle: () => {} })

export function IpaProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('hide-ipa') === '1'
    setHidden(stored)
    document.body.classList.toggle('hide-ipa', stored)
  }, [])

  const toggle = () => {
    setHidden(prev => {
      const next = !prev
      localStorage.setItem('hide-ipa', next ? '1' : '0')
      document.body.classList.toggle('hide-ipa', next)
      return next
    })
  }

  return <PinyinContext.Provider value={{ hidden, toggle }}>{children}</PinyinContext.Provider>
}

export const useIpa = () => useContext(PinyinContext)
