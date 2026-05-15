export interface WordEntry {
  id: string
  thai: string
  pinyin: string | null
  pinyinUS: string | null
  pinyinGB: string | null
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
  thai: string
  pinyin: string
  meaning: string
}

export interface Example {
  thai: string
  pinyin: string
  zh: string
  vocabulary?: VocabItem[]
  grammar?: string
}

export interface WordRef {
  thai: string
  pinyin: string
  zh: string
}

export interface Variant {
  thai: string
  pinyin: string
  meaning: string
  frequency: '最常用' | '常用' | '較少用'
  context: string
}

export interface LookupResult {
  thai: string
  pinyin: string
  pinyinUS?: string
  pinyinGB?: string
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
  thai: string
  pinyin: string
  pinyinUS: string | null
  pinyinGB: string | null
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
  thai: string
  pinyin: string
  pinyinUS?: string
  pinyinGB?: string
  zh: string
  grammar: string
  grammarPattern: string
  vocabulary: VocabItem[]
}

// Render IPA pronunciation:
//  - if US/GB differ → two flagged variants
//  - if same / one missing → single unflagged value
// Returns an array so consumers can `.map()` them into UI directly.
export interface PinyinDisplay {
  label?: '🇺🇸' | '🇬🇧'
  ipa: string
}

export function getPinyinDisplay(item: {
  pinyin?: string | null
  pinyinUS?: string | null
  pinyinGB?: string | null
}): PinyinDisplay[] {
  const us = (item.pinyinUS ?? '').trim()
  const gb = (item.pinyinGB ?? '').trim()
  if (us && gb && us !== gb) return [{ label: '🇺🇸', ipa: us }, { label: '🇬🇧', ipa: gb }]
  const single = us || gb || (item.pinyin ?? '').trim()
  return single ? [{ ipa: single }] : []
}
