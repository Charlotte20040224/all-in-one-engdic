const SPEED_KEY = 'tts-speed'
const audioCache = new Map<string, string>() // `${text}::${speed}` → base64

export function getTtsSpeed(): number {
  if (typeof window === 'undefined') return 0.7
  return parseFloat(localStorage.getItem(SPEED_KEY) ?? '0.7')
}

export function setTtsSpeedCache(speed: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SPEED_KEY, String(speed))
}

// Replace vowel placeholder '-' with อ so TTS receives valid Thai.
// e.g. โ-ะ → โอะ, เ-อ → เออ, -ะ → อะ
function preprocessThai(text: string): string {
  return text.replace(/-/g, 'อ')
}

async function fetchAudio(text: string, speed: number): Promise<string> {
  const processed = preprocessThai(text)
  const key = `${processed}::${speed}`
  if (audioCache.has(key)) return audioCache.get(key)!
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: processed, speed }),
  })
  if (!res.ok) throw new Error('TTS API failed')
  const { audioContent } = await res.json()
  audioCache.set(key, audioContent)
  return audioContent
}

// Return the last syllable of a Thai word.
// Walk forward tracking the rightmost leading vowel (เ แ โ ใ ไ);
// that position is the start of the last syllable.
// Words with no leading vowel (มาก, ดี) are returned whole.
function getLastSyllable(word: string): string {
  const leadingVowels = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ'])
  const chars = [...word]
  let lastPos = -1
  for (let i = 0; i < chars.length; i++) {
    if (leadingVowels.has(chars[i])) lastPos = i
  }
  return lastPos > 0 ? chars.slice(lastPos).join('') : word
}

// Split text at ๆ into [before, lastSyllable, after?].
// Plays: full text before ๆ → repeated last syllable → remaining text after ๆ.
// e.g. "ใจเย็นๆ" → ["ใจเย็น", "เย็น"]
// e.g. "คุณต้อง ใจเย็นๆ เมื่อเกิดปัญหา" → ["คุณต้อง ใจเย็น", "เย็น", "เมื่อเกิดปัญหา"]
function splitAtRepeat(text: string): string[] {
  const idx = text.indexOf('ๆ')
  if (idx === -1) return [text]
  const before = text.slice(0, idx).trim()
  const after = text.slice(idx + 1).trim()
  const lastSpace = before.lastIndexOf(' ')
  const lastWord = lastSpace === -1 ? before : before.slice(lastSpace + 1)
  const lastSyllable = getLastSyllable(lastWord)
  return [before, lastSyllable, after].filter(s => s.length > 0)
}

function playAudio(base64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`)
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error('playback error'))
    audio.play().catch(reject)
  })
}

export async function speak(text: string): Promise<void> {
  const speed = getTtsSpeed()
  const parts = splitAtRepeat(text)
  try {
    for (let i = 0; i < parts.length; i++) {
      const audioContent = await fetchAudio(parts[i], speed)
      await playAudio(audioContent)
    }
  } catch {
    webSpeechFallback(text)
  }
}

export async function prefetchAudio(text: string): Promise<void> {
  if (!text?.trim()) return
  const speed = getTtsSpeed()
  const key = `${text}::${speed}`
  if (audioCache.has(key)) return
  try {
    await fetchAudio(text, speed)
  } catch {
    // silent — prefetch failures are non-critical
  }
}

function webSpeechFallback(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'th-TH'
  utterance.rate = 0.8
  utterance.pitch = 0.95
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.lang.startsWith('th') && /google|natural|premium|enhanced/i.test(v.name))
  const fallback = voices.find(v => v.lang.startsWith('th'))
  if (preferred) utterance.voice = preferred
  else if (fallback) utterance.voice = fallback
  window.speechSynthesis.speak(utterance)
}
