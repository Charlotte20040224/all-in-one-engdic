'use client'

// Font-switching UI was removed for the English-only build (was used to swap
// between Thai display fonts). Keeping this provider as a no-op stub so
// any lingering imports keep compiling; safe to delete once consumers are
// fully cleaned up.
export function FontProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
