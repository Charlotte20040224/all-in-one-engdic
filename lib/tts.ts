// Speed preference is stored in DB (UserSettings.ttsSpeed) + localStorage cache.
// Voice preference is currently localStorage-only (no DB column yet).

const SPEED_KEY = 'tts-speed'
const VOICE_KEY = 'tts-voice'
const audioCache = new Map<string, string>() // `${text}::${speed}::${voice}` → base64

export type TtsVoice = 'us-f' | 'us-m' | 'gb-f' | 'gb-m'
export const DEFAULT_VOICE: TtsVoice = 'us-f'

export function getTtsSpeed(): number {
  if (typeof window === 'undefined') return 0.9
  return parseFloat(localStorage.getItem(SPEED_KEY) ?? '0.9')
}

export function setTtsSpeedCache(speed: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SPEED_KEY, String(speed))
}

export function getTtsVoice(): TtsVoice {
  if (typeof window === 'undefined') return DEFAULT_VOICE
  const v = localStorage.getItem(VOICE_KEY) as TtsVoice | null
  return v && ['us-f', 'us-m', 'gb-f', 'gb-m'].includes(v) ? v : DEFAULT_VOICE
}

export function setTtsVoiceCache(voice: TtsVoice) {
  if (typeof window === 'undefined') return
  localStorage.setItem(VOICE_KEY, voice)
}

async function fetchAudio(text: string, speed: number, voice: TtsVoice): Promise<string> {
  const key = `${text}::${speed}::${voice}`
  if (audioCache.has(key)) return audioCache.get(key)!
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, speed, voice }),
  })
  if (!res.ok) throw new Error('TTS API failed')
  const { audioContent } = await res.json()
  audioCache.set(key, audioContent)
  return audioContent
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
  if (!text?.trim()) return
  const speed = getTtsSpeed()
  const voice = getTtsVoice()
  try {
    const audioContent = await fetchAudio(text, speed, voice)
    await playAudio(audioContent)
  } catch {
    webSpeechFallback(text, voice)
  }
}

export async function prefetchAudio(text: string): Promise<void> {
  if (!text?.trim()) return
  const speed = getTtsSpeed()
  const voice = getTtsVoice()
  const key = `${text}::${speed}::${voice}`
  if (audioCache.has(key)) return
  try {
    await fetchAudio(text, speed, voice)
  } catch {
    // silent — prefetch failures are non-critical
  }
}

function pickFallbackVoice(voice: TtsVoice): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  const langPrefix = voice.startsWith('us-') ? 'en-US' : 'en-GB'
  const isFemale = voice.endsWith('-f')
  // Heuristic name matchers — browsers don't expose gender directly, so we
  // match the well-known voice names per OS.
  const femaleNames = /samantha|ava|allison|joanna|kate|kimberly|salli|karen|moira|zira|female|google.+female|google us english|google uk english female/i
  const maleNames   = /alex|daniel|fred|tom|matthew|justin|joey|brian|david|male|google.+male|google uk english male/i
  const matcher = isFemale ? femaleNames : maleNames

  const sameLang = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()))
  const named = sameLang.find(v => matcher.test(v.name))
  if (named) return named
  // Fallback: any voice in that lang
  if (sameLang.length) return sameLang[0]
  // Fallback: any English voice
  return voices.find(v => v.lang.startsWith('en')) ?? null
}

function webSpeechFallback(text: string, voice: TtsVoice) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voice.startsWith('us-') ? 'en-US' : 'en-GB'
  utterance.rate = getTtsSpeed()
  utterance.pitch = 1.0
  const picked = pickFallbackVoice(voice)
  if (picked) utterance.voice = picked
  window.speechSynthesis.speak(utterance)
}
