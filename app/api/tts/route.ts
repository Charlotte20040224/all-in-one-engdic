import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit, tooManyRequests } from '@/lib/rateLimit'

type TtsVoiceKey = 'us-f' | 'us-m' | 'gb-f' | 'gb-m'

const VOICE_CONFIG: Record<TtsVoiceKey, { languageCode: string; name: string; ssmlGender: 'FEMALE' | 'MALE' }> = {
  'us-f': { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
  'us-m': { languageCode: 'en-US', name: 'en-US-Neural2-D', ssmlGender: 'MALE' },
  'gb-f': { languageCode: 'en-GB', name: 'en-GB-Neural2-C', ssmlGender: 'FEMALE' },
  'gb-m': { languageCode: 'en-GB', name: 'en-GB-Neural2-D', ssmlGender: 'MALE' },
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimit('tts', session.user.id, 30, '1 m')
  if (!rl.success) return tooManyRequests(rl.reset)

  const { text, speed, voice } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Missing text' }, { status: 400 })
  if (text.length > 500) return NextResponse.json({ error: 'Text too long (max 500)' }, { status: 400 })
  const speakingRate = typeof speed === 'number' ? Math.min(Math.max(speed, 0.25), 4.0) : 0.9
  const voiceKey: TtsVoiceKey = (voice && voice in VOICE_CONFIG ? voice : 'us-f') as TtsVoiceKey

  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'TTS not configured' }, { status: 503 })

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: text.trim() },
        voice: VOICE_CONFIG[voiceKey],
        audioConfig: { audioEncoding: 'MP3', speakingRate, pitch: 0.0, effectsProfileId: ['headphone-class-device'] },
      }),
    }
  )

  if (!res.ok) return NextResponse.json({ error: 'TTS API error' }, { status: 502 })

  const { audioContent } = await res.json()
  return NextResponse.json({ audioContent })
}
