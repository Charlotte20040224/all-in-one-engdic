import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import { rateLimit, tooManyRequests } from '@/lib/rateLimit'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimit('song-learning', session.user.id, 3, '1 m')
  if (!rl.success) return tooManyRequests(rl.reset)

  const { songName } = await req.json()
  if (!songName?.trim()) return NextResponse.json({ error: 'songName required' }, { status: 400 })
  if (songName.length > 200) return NextResponse.json({ error: 'songName too long (max 200)' }, { status: 400 })

  const trimmed = songName.trim()
  console.log('[song-learning] received:', trimmed)
  const startedAt = Date.now()

  const prompt = `你必須只回傳 JSON 格式，不要有任何其他文字、說明或前言。直接從 { 開始，到 } 結束。

搜尋英文歌曲「${trimmed}」並回傳以下 JSON，不要有任何其他文字。

⚠️ 嚴禁版權問題：絕對不可以回傳完整歌詞段落、不可連續複製超過 1 句歌詞。
你只能挑出「精選代表性短句」做英中對照（不是把整首歌翻譯出來）。

⚠️ 嚴格上限：words ≤ 20 個（最值得學的單字，避開 the / a / is 等基本詞）、sentences ≤ 10 個（有代表性的精選短句）。
寧可少也不要讓 JSON 不完整被截斷。回傳必須是合法 JSON。

規則：
- words.thai / sentences.thai 都只能是英文（拉丁字母）
- 中文一律繁體
- pinyin 欄位填 IPA 國際音標（用 / / 包圍，重音用 ˈ）

格式（每項只有 thai / pinyin / zh 三欄）：
{"songName":"完整英文歌曲名稱","artist":"歌手名","words":[{"thai":"dream","pinyin":"/driːm/","zh":"夢、夢想"}],"sentences":[{"thai":"Don't stop believing.","pinyin":"/doʊnt stɒp bɪˈliːvɪŋ/","zh":"不要停止相信。"}]}

再次強調：不要有「以下是」「我搜尋到」「JSON 如下」這種前言或結語，只回 JSON 物件本身。`

  const friendlyError = { error: '分析失敗，請稍後再試 🙏' }

  try {
    console.log('[song-learning] calling claude with web_search…')
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: '你是英文歌曲分析助手。你必須只回傳 JSON 格式，絕對不能有任何其他文字、Markdown 標記或解釋。輸出必須直接從 { 開始，到 } 結束。中文用繁體（Traditional Chinese）。pinyin 欄位一律使用 IPA 國際音標（用 / / 包圍）。',
      tools: [{ type: 'web_search_20250305', name: 'web_search' }] as any,
      messages: [{ role: 'user', content: prompt }],
    })
    const elapsedMs = Date.now() - startedAt

    const textBlocks = message.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text as string)
    const txt = textBlocks.join('\n')
    console.log('[song-learning] claude responded in', elapsedMs, 'ms | content blocks:', message.content.length, '| text length:', txt.length, '| stop_reason:', message.stop_reason, '| usage:', JSON.stringify(message.usage))
    console.log('[song-learning] resp preview:', txt.slice(0, 200))

    const m = txt.match(/\{[\s\S]*\}/)
    if (!m) {
      console.error('[song-learning] no JSON in response')
      return NextResponse.json(friendlyError, { status: 503 })
    }

    const parsed = parseLooseJson(m[0])
    if (!parsed) {
      console.error('[song-learning] JSON parse failed; first 500 chars:', m[0].slice(0, 500))
      return NextResponse.json(friendlyError, { status: 503 })
    }

    const words = Array.isArray(parsed.words)
      ? parsed.words.filter((w: any) => w && typeof w === 'object' && typeof w.thai === 'string' && w.thai.trim())
      : []
    const sentences = Array.isArray(parsed.sentences)
      ? parsed.sentences.filter((s: any) => s && typeof s === 'object' && typeof s.thai === 'string' && s.thai.trim())
      : []

    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(parsed.songName || trimmed)}`

    console.log('[song-learning] returning words:', words.length, '| sentences:', sentences.length, '| total elapsed:', Date.now() - startedAt, 'ms')
    return NextResponse.json({
      songName: parsed.songName || trimmed,
      artist: parsed.artist || null,
      words,
      sentences,
      youtubeUrl,
    })
  } catch (err) {
    const elapsedMs = Date.now() - startedAt
    const e: any = err
    console.error('[song-learning] error after', elapsedMs, 'ms:', {
      name: e?.name,
      message: e?.message,
      status: e?.status,
      type: e?.type,
      error: e?.error,
    })
    return NextResponse.json(friendlyError, { status: 503 })
  }
}

function parseLooseJson(s: string): any | null {
  try {
    return JSON.parse(s)
  } catch (firstErr) {
    const fixed = s
      .replace(/}(\s*)\{/g, '},$1{')
      .replace(/](\s*)\[/g, '],$1[')
      .replace(/"(\s*\n\s*)"([^"]+)":/g, '",$1"$2":')
      .replace(/,(\s*[}\]])/g, '$1')
    try {
      const result = JSON.parse(fixed)
      console.log('[song-learning] parseLooseJson recovered after fixer; original error:', firstErr instanceof Error ? firstErr.message : firstErr)
      return result
    } catch (secondErr) {
      console.error('[song-learning] parseLooseJson firstErr:', firstErr instanceof Error ? firstErr.message : firstErr)
      console.error('[song-learning] parseLooseJson secondErr:', secondErr instanceof Error ? secondErr.message : secondErr)
      return null
    }
  }
}
