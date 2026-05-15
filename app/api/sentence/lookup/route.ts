import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import { rateLimit, tooManyRequests } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimit('sentence-lookup', session.user.id, 10, '1 m')
  if (!rl.success) return tooManyRequests(rl.reset)

  const { query } = await req.json()
  if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })
  if (query.length > 200) return NextResponse.json({ error: 'Query too long (max 200)' }, { status: 400 })

  const prompt = `請幫我分析英文句子：「${query}」

重要規則：
- "thai" 欄位必須是英文句子（拉丁字母、標點），不能填中文
- 如果使用者輸入中文，請先翻譯成自然流暢、道地的英文再填入 "thai"
- 如果使用者輸入的已經是英文，直接放入 "thai"
- "pinyin" 是整句的 IPA 國際音標（用 / / 包起來，重音用 ˈ）。預設用美式發音
- "pinyinUS" = 整句用美式發音的 IPA
- "pinyinGB" = 整句用英式發音的 IPA
- pinyinUS 跟 pinyinGB 都要回。**只有在句中真的含有英美發音「明顯可聽出差別」的字時才填不同值**，否則兩邊填一樣即可
- 「明顯差別」指：不同子音（schedule）、不同母音音質（tomato、dance、can't、path、ask）、重音位置不同（advertisement、garage）。
- **不要因為**字尾 /r/ 捲舌差異（water、teacher）、/oʊ/ vs /əʊ/ 細節（hello、go、no），或弱音節 /ɪ/ vs /ə/ 差別 **就分開填**——這類細節英美兩邊都填一樣的 IPA
- "zh" 是整句的繁體中文翻譯（Traditional Chinese），絕不能用簡體中文
- "grammar" 請用繁體中文詳細解析句子結構，包含：
  - 句型分類（陳述句／疑問句／祈使句／否定句／感嘆句）
  - 主詞、動詞、受詞、補語的位置
  - 時態（簡單式／進行式／完成式／完成進行式）與助動詞
  - 子句類型（名詞子句／形容詞子句／副詞子句／條件句）
  - 重要文法點（被動語態、虛擬語氣、片語動詞、慣用語）
- "grammarPattern"：這個句子使用的核心句型，格式範例：S + V + O、If + S + V, S + will + V、S + have + V-ed、be going to + V。只取句型骨架，用 S/V/O/N/adj 等抽象符號代表可填入的內容
- "vocabulary" 是句中重要單字的陣列。每項格式為：
  {"thai":"英文單字","pinyin":"IPA 音標","meaning":"繁體中文意思"}
  太基本的詞（例如 I、you、is、the、a）可省略；若整句都很基本，vocabulary 填 []

所有中文內容請使用繁體中文（Traditional Chinese）。

只回覆 JSON，格式範例：
{"thai":"I am learning English.","pinyin":"/aɪ æm ˈlɜːrnɪŋ ˈɪŋɡlɪʃ/","pinyinUS":"/aɪ æm ˈlɜːrnɪŋ ˈɪŋɡlɪʃ/","pinyinGB":"/aɪ əm ˈlɜːnɪŋ ˈɪŋɡlɪʃ/","zh":"我正在學英文。","grammar":"這是陳述句（現在進行式）。主詞 I（我）+ be 動詞 am + 現在分詞 learning（正在學）+ 受詞 English（英文）。be + V-ing 表示正在進行的動作。","grammarPattern":"S + be + V-ing + O","vocabulary":[{"thai":"learn","pinyin":"/lɜːrn/","meaning":"學習"},{"thai":"English","pinyin":"/ˈɪŋɡlɪʃ/","meaning":"英文"}]}

請用完全相同的格式分析「${query}」。
注意：
- "thai" 必須是英文，不能留中文
- "pinyin" 必須是 IPA 音標，不是拼音
- "vocabulary" 必須是物件陣列，不可以是字串`

  const friendlyError = { error: '目前查詢人數較多，請稍後再試 🙏' }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: '你是一個英文句子分析助手。所有中文必須使用繁體中文（Traditional Chinese）。pinyin 欄位一律使用 IPA 國際音標（用 / / 包圍）。',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[sentence-lookup] no JSON in response:', text.slice(0, 200))
      return NextResponse.json(friendlyError, { status: 503 })
    }

    const result = JSON.parse(jsonMatch[0])

    if (!Array.isArray(result.vocabulary)) {
      result.vocabulary = []
    } else {
      result.vocabulary = result.vocabulary.filter(
        (v: any) => v && typeof v === 'object' && v.thai
      )
    }
    console.log('[sentence-lookup] thai:', result.thai, '| vocab count:', result.vocabulary.length)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Sentence lookup error:', err)
    return NextResponse.json(friendlyError, { status: 503 })
  }
}
