// Local-only favorites — both sentences (under `favorite-sentences`) and
// single words (under `favorite-words`).

export const FAVORITES_KEY = 'favorite-sentences'
export const FAVORITE_WORDS_KEY = 'favorite-words'

export interface FavoriteSentence {
  english: string
  ipa?: string
  chinese?: string
  source?: string  // e.g. "句型 #34", "單字 must"
  addedAt: number
}

export interface FavoriteWord {
  english: string
  ipa?: string
  chinese?: string
  savedAt: number
}

// ─── sentences ──────────────────────────────────────────────────────────────

export function readFavorites(): FavoriteSentence[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as FavoriteSentence[]) : []
  } catch {
    return []
  }
}

export function writeFavorites(list: FavoriteSentence[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
  } catch {}
}

export function isFavorited(english: string, list?: FavoriteSentence[]): boolean {
  const items = list ?? readFavorites()
  return items.some(f => f.english === english)
}

export function toggleFavorite(entry: Omit<FavoriteSentence, 'addedAt'>): { added: boolean; list: FavoriteSentence[] } {
  const cur = readFavorites()
  const i = cur.findIndex(f => f.english === entry.english)
  let list: FavoriteSentence[]
  let added: boolean
  if (i >= 0) {
    list = cur.filter((_, idx) => idx !== i)
    added = false
  } else {
    list = [{ ...entry, addedAt: Date.now() }, ...cur]
    added = true
  }
  writeFavorites(list)
  return { added, list }
}

export function removeFavorite(english: string): FavoriteSentence[] {
  const list = readFavorites().filter(f => f.english !== english)
  writeFavorites(list)
  return list
}

// ─── words ──────────────────────────────────────────────────────────────────

export function readFavoriteWords(): FavoriteWord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FAVORITE_WORDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as FavoriteWord[]) : []
  } catch {
    return []
  }
}

export function writeFavoriteWords(list: FavoriteWord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FAVORITE_WORDS_KEY, JSON.stringify(list))
  } catch {}
}

export function isFavoritedWord(english: string, list?: FavoriteWord[]): boolean {
  const items = list ?? readFavoriteWords()
  return items.some(f => f.english === english)
}

export function toggleFavoriteWord(entry: Omit<FavoriteWord, 'savedAt'>): { added: boolean; list: FavoriteWord[] } {
  const cur = readFavoriteWords()
  const i = cur.findIndex(f => f.english === entry.english)
  let list: FavoriteWord[]
  let added: boolean
  if (i >= 0) {
    list = cur.filter((_, idx) => idx !== i)
    added = false
  } else {
    list = [{ ...entry, savedAt: Date.now() }, ...cur]
    added = true
  }
  writeFavoriteWords(list)
  return { added, list }
}
