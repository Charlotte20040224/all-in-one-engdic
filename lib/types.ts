export interface WordEntry {
  id: string
  thai: string
  pinyin: string | null
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
  zh: string
  grammar: string
  grammarPattern: string
  vocabulary: VocabItem[]
}
