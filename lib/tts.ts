const SPEED_KEY = 'tts-speed'
const audioCache = new Map<string, string>() // `${text}::${speed}` → base64

export function getTtsSpeed(): number {
  if (typeof window === 'undefined') return 0.9
  return parseFloat(localStorage.getItem(SPEED_KEY) ?? '0.9')
}

export function setTtsSpeedCache(speed: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SPEED_KEY, String(speed))
}

async function fetchAudio(text: string, speed: number): Promise<string> {
  const key = `${text}::${speed}`
  if (audioCache.has(key)) return audioCache.get(key)!
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, speed }),
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
  try {
    const audioContent = await fetchAudio(text, speed)
    await playAudio(audioContent)
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
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  utterance.pitch = 1.0
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.lang.startsWith('en') && /google|natural|premium|enhanced/i.test(v.name))
  const fallback = voices.find(v => v.lang.startsWith('en'))
  if (preferred) utterance.voice = preferred
  else if (fallback) utterance.voice = fallback
  window.speechSynthesis.speak(utterance)
}
