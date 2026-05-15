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

  const rl = await rateLimit('chat-review', session.user.id, 3, '1 m')
  if (!rl.success) return tooManyRequests(rl.reset)

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 })
  if (text.length > 5000) return NextResponse.json({ error: 'Text too long (max 5000)' }, { status: 400 })

  console.log('[chat-review] received:', text.length, 'chars')
  const startedAt = Date.now()

  const prompt = `分析下面聊天記錄／文章，提取有學習價值的英文單字與句子。

過濾忽略：人名、時間戳、系統訊息（已讀／撤回等）、emoji、純數字／電話／帳號、URL、@提及、#標籤。
只取英文單字與句子，忽略中文部分。中文說明一律使用繁體中文。
"pinyin" 欄位填 IPA 國際音標（用 / / 包圍，重音用 ˈ）。

⚠️ 嚴格上限：words ≤ 20 個（挑最值得學的，避開 the / a / is 等基本詞）、sentences ≤ 10 個（最有學習價值的）。
寧可少也不要讓 JSON 不完整被截斷。回傳必須是合法 JSON。

格式：{"words":[{"thai":"jump","pinyin":"/dʒʌmp/","zh":"跳","context":"出現在：原片段"}],"sentences":[{"thai":"I'm running late.","pinyin":"/aɪm ˈrʌnɪŋ leɪt/","zh":"我要遲到了。","grammar":"S + be + V-ing 現在進行式 + adj 補語"}]}

聊天記錄／文章：
${text}`

  const friendlyError = { error: '分析失敗，請稍後再試 🙏' }

  try {
    console.log('[chat-review] calling claude…')
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system: '英文學習助手。只提取英文單字與句子，所有說明使用繁體中文（Traditional Chinese）。pinyin 欄位一律使用 IPA 國際音標（用 / / 包圍）。輸出必須是嚴格合法的 JSON，每個 array 元素之間都要有逗號，不可有多餘的逗號。',
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: '{' },
      ],
    })
    const elapsedMs = Date.now() - startedAt
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const txt = '{' + raw
    console.log('[chat-review] claude responded in', elapsedMs, 'ms | resp length:', txt.length, '| stop_reason:', message.stop_reason, '| usage:', JSON.stringify(message.usage))
    console.log('[chat-review] resp preview:', txt.slice(0, 200))

    const m = txt.match(/\{[\s\S]*\}/)
    if (!m) {
      console.error('[chat-review] no JSON in response')
      return NextResponse.json(friendlyError, { status: 503 })
    }

    const parsed = parseLooseJson(m[0])
    if (!parsed) {
      console.error('[chat-review] JSON.parse failed even after fixer; first 500 chars:', m[0].slice(0, 500))
      return NextResponse.json(friendlyError, { status: 503 })
    }

    const words = Array.isArray(parsed.words)
      ? parsed.words.filter((w: any) => w && typeof w === 'object' && typeof w.thai === 'string' && w.thai.trim())
      : []
    const sentences = Array.isArray(parsed.sentences)
      ? parsed.sentences.filter((s: any) => s && typeof s === 'object' && typeof s.thai === 'string' && s.thai.trim())
      : []
    console.log('[chat-review] returning words:', words.length, '| sentences:', sentences.length, '| total elapsed:', Date.now() - startedAt, 'ms')
    return NextResponse.json({ words, sentences })
  } catch (err) {
    const elapsedMs = Date.now() - startedAt
    const e: any = err
    console.error('[chat-review] error after', elapsedMs, 'ms:', {
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
      // missing comma between objects in an array: `}\n  {` → `},\n  {`
      .replace(/}(\s*)\{/g, '},$1{')
      // missing comma between adjacent arrays: `]\n  [` → `],\n  [`
      .replace(/](\s*)\[/g, '],$1[')
      // missing comma between value and next key: `"\n  "x":` → `",\n  "x":`
      .replace(/"(\s*\n\s*)"([^"]+)":/g, '",$1"$2":')
      // trailing comma before } or ]
      .replace(/,(\s*[}\]])/g, '$1')
    try {
      const result = JSON.parse(fixed)
      console.log('[chat-review] parseLooseJson recovered after fixer; original error:', firstErr instanceof Error ? firstErr.message : firstErr)
      return result
    } catch (secondErr) {
      console.error('[chat-review] parseLooseJson firstErr:', firstErr instanceof Error ? firstErr.message : firstErr)
      console.error('[chat-review] parseLooseJson secondErr:', secondErr instanceof Error ? secondErr.message : secondErr)
      return null
    }
  }
}
