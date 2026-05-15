export interface WordEntry {
  id: string
  english: string
  ipa: string | null
  ipaUS: string | null
  ipaGB: string | null
  meaning: string | null
  pos: string | null
  examples: Example[]
  collocations: WordRef[]
  synonyms: WordRef[]
  antonyms: WordRef[]
  related?: WordRef[]
  variants: Variant[]
  note: string | null
  srsLevel: number
  nextReview: string
  lastReview: string | null
  createdAt: string
}

export interface VocabItem {
  english: string
  ipa: string
  meaning: string
}

export interface Example {
  english: string
  ipa: string
  zh: string
  vocabulary?: VocabItem[]
  grammar?: string
}

export interface WordRef {
  english: string
  ipa: string
  zh: string
}

export interface Variant {
  english: string
  ipa: string
  meaning: string
  frequency: '最常用' | '常用' | '較少用'
  context: string
}

export interface LookupResult {
  english: string
  ipa: string
  ipaUS?: string
  ipaGB?: string
  meaning: string
  pos: string
  examples: Example[]
  collocations: WordRef[]
  synonyms: WordRef[]
  antonyms: WordRef[]
  related?: WordRef[]
  note: string
  variants: Variant[]
}

export interface SentenceEntry {
  id: string
  english: string
  ipa: string
  ipaUS: string | null
  ipaGB: string | null
  zh: string
  grammar: string | null
  grammarPattern: string | null
  vocabulary: VocabItem[]
  nextReview: string
  interval: number
  easeFactor: number
  repetitions: number
  createdAt: string
}

export interface SentenceLookupResult {
  english: string
  ipa: string
  ipaUS?: string
  ipaGB?: string
  zh: string
  grammar: string
  grammarPattern: string
  vocabulary: VocabItem[]
}

// Render IPA pronunciation:
//  - if US/GB differ → two flagged variants
//  - if same / one missing → single unflagged value
// Returns an array so consumers can `.map()` them into UI directly.
export interface IpaDisplay {
  label?: '🇺🇸' | '🇬🇧'
  ipa: string
}

export function getIpaDisplay(item: {
  ipa?: string | null
  ipaUS?: string | null
  ipaGB?: string | null
}): IpaDisplay[] {
  const us = (item.ipaUS ?? '').trim()
  const gb = (item.ipaGB ?? '').trim()
  if (us && gb && us !== gb) return [{ label: '🇺🇸', ipa: us }, { label: '🇬🇧', ipa: gb }]
  const single = us || gb || (item.ipa ?? '').trim()
  return single ? [{ ipa: single }] : []
}
