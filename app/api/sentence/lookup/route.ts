import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import { rateLimit, tooManyRequests } from '@/lib/rateLimit'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimit('sentence-lookup', session.user.id, 10, '1 m')
  if (!rl.success) return tooManyRequests(rl.reset)

  const { query } = await req.json()
  if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })
  if (query.length > 200) return NextResponse.json({ error: 'Query too long (max 200)' }, { status: 400 })

  const prompt = `請幫我分析英文句子：「${query}」
重要規則：
- "thai" 欄位必須永遠填入英文句子（ก-ฮ 英文字元），不能填中文或英文
- 如果用戶輸入的是中文或英文，請先翻譯成自然流暢、道地的英文再填入 "thai"
- 如果用戶輸入的已經是英文，直接放入 "thai"
- "pinyin" 是整句 "thai" 欄位的羅馬拼音，每個詞之間用空格分隔
- "zh" 是整句的繁體中文翻譯（Traditional Chinese），不要使用簡體中文
- "grammar" 請用繁體中文詳細解析句子結構，包含：
  - 句型（陳述句／疑問句／祈使句／否定句等）
  - 主詞、動詞、賓語的位置
  - 時態或語氣標記（例如 กำลัง / แล้ว / จะ / ได้ / มา）
  - 重要的語尾詞或疑問詞（例如 ครับ / ค่ะ / ไหม / หรือ）
  - 若有片語或固定結構，請額外說明
- "grammarPattern"：這個句子使用的核心句型，格式範例：ถ้า...จะ...、กำลัง...อยู่、เพราะ...จึง...。只取句型關鍵字，用 ... 代表可填入的內容
- "vocabulary" 是句中重要單字的陣列，選出學習者可能不熟的詞。每項格式為：
  {"thai":"英文單字","pinyin":"拼音","meaning":"繁體中文意思"}
  太基本的詞（例如 ฉัน、คุณ、ครับ）可省略；若整句都很基本，vocabulary 填 []。

所有中文內容請使用繁體中文（Traditional Chinese）。

拼音請嚴格遵守 thai2english.com 的標準：
母音：
- เ-ิน 唸 ern（เดิน = dern、เกิน = gern）
- เ-อ 唸 er（เธอ = ter）
- -ั 唸 a（กัน = gan）
- โ- 唸 oh（โต = dtoh）
- -า 唸 aa（มา = maa）
- -ี 唸 ii（ดี = dii）
- -ู 唸 uu（รู้ = ruu）
子音：
- ก 字首 g（กิน = gin）
- ค 唸 k（คน = kon）
- ด 字首 d（ดี = dii）
- ต 字首 dt（ตา = dtaa）
- ป 字首 bp（ปาก = bpaak）
- พ/ภ 唸 p（พ่อ = por）
- ร = r、ล = l、ว = w、ย = y、น = n、ม = m、ง = ng
- หน/หม/หง 等 ห 帶領的輔音，ห 不發音只改聲調
聲調：低聲 à、降聲 â、高聲 á、升聲 ǎ、中聲無符號

只回覆 JSON，格式範例：
{"thai":"ฉันกำลังเรียนภาษาไทย","pinyin":"chǎn gam-lang rian paa-sǎa tai","zh":"我正在學英文","grammar":"這是陳述句。主詞 ฉัน（我）+ 時態標記 กำลัง（正在／表示進行式）+ 動詞 เรียน（學）+ 賓語 ภาษาไทย（英文）。กำลัง 放在動詞前表示現在進行式。","grammarPattern":"กำลัง...","vocabulary":[{"thai":"กำลัง","pinyin":"gam-lang","meaning":"正在（表進行式）"},{"thai":"เรียน","pinyin":"rian","meaning":"學、學習"},{"thai":"ภาษาไทย","pinyin":"paa-sǎa tai","meaning":"英文、泰語"}]}

請用完全相同的格式分析「${query}」。
注意：
- "thai" 必須是英文字元，不能留中文
- "vocabulary" 必須是物件陣列，不可以是字串
- 嚴格依 thai2english.com 拼音規則`

  const friendlyError = { error: '目前查詢人數較多，請稍後再試 🙏' }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: '你是一個泰語句子分析助手。所有回覆的中文必須使用繁體中文（Traditional Chinese）。拼音嚴格遵守 thai2english.com 標準，例如 เดิน = dern、ต 字首 = dt、ป 字首 = bp、ก 字首 = g。',
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
