import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import { rateLimit, tooManyRequests } from '@/lib/rateLimit'

// 注意：DB schema 沿用泰文版的欄位名稱（thai / pinyin），目前儲存：
// - thai   → 英文單字本身
// - pinyin → IPA 國際音標（含 / / 包圍與重音符號 ˈ ˌ）
// - meaning / pos / examples.zh 等中文欄位 → 一律繁體中文

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimit('lookup', session.user.id, 10, '1 m')
  if (!rl.success) return tooManyRequests(rl.reset)

  const { query: rawQuery, mode } = await req.json()
  if (!rawQuery?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })
  if (rawQuery.length > 200) return NextResponse.json({ error: 'Query too long (max 200)' }, { status: 400 })

  const query = rawQuery.trim()
  const isQuick = mode === 'quick'

  const commonRules = `重要規則：
- 所有中文說明必須使用繁體中文（Traditional Chinese），不能出現簡體中文、韓文、日文
- "thai" 欄位必須是英文單字／片語（只能使用拉丁字母、空格、連字號 -、撇號 '），不能填中文
- 如果使用者輸入中文（例如「跳」、「謝謝」），請先翻成最常用、最自然的英文再填入 "thai"
- 如果使用者輸入英文，直接放入 "thai"
- "pinyin" 必須是 IPA 國際音標，用 / / 包起來（例如 /dʒʌmp/、/ˈhæpi/）；重音用 ˈ（主重音）和 ˌ（次重音）
- "pos" 用繁體中文表示詞性，可用「名詞 / 動詞 / 形容詞 / 副詞 / 介系詞 / 連接詞 / 代名詞 / 感嘆詞 / 助動詞 / 片語動詞 / 慣用語」等
- 如果不確定，寧可省略也不要猜測`

  const quickPrompt = `查英文「${query}」（快速模式）。

${commonRules}

一字多義處理：
- 如果這個字有多種完全不同的意思（一字多義），meaning 欄位請列出所有主要意思，用分號（；）隔開
- 例如：bank → "銀行；河岸；倚靠"

只回 JSON（只給 1 個例句，例句不需 vocabulary 或 grammar）：
{"thai":"jump","pinyin":"/dʒʌmp/","meaning":"跳、跳躍","pos":"動詞","examples":[{"thai":"He jumped over the fence.","pinyin":"/hi dʒʌmpt ˈoʊvər ðə fens/","zh":"他跳過了圍牆。"}]}

注意：thai 必須是英文，不能填「${query}」本身（除非輸入就是英文）。`

  const fullPrompt = `查英文「${query}」。

${commonRules}

回傳欄位：
- 必填：thai, pinyin, meaning, pos, examples（每例含 thai / pinyin / zh / vocabulary / grammar）
- collocations：常見搭配片語 2-3 個，每項 {thai, pinyin, zh}；無則填 []
- synonyms：近義詞 2-3 個，每項 {thai, pinyin, zh}；無則填 []
- antonyms：反義詞 2-3 個，每項 {thai, pinyin, zh}；無則填 []
- related：同字根、同主題、常一起出現的相關字 2-3 個（例如 jump 的 related 可包含 leap, hop, skip），每項 {thai, pinyin, zh}；無則填 []
- 【重要】synonyms / antonyms / related 每一項都必須完整包含 thai、pinyin、zh 三個欄位，zh 不能省略也不能為空字串；如果想不到中文意思就不要列出該項
- vocabulary（例句中的）：列出例句中出現的重要單字，每個含 {thai, pinyin, meaning}，至少 3-5 個；極短或極簡的例句才可填 []
- variants：如果這個概念在英文有不同的表達方式（如英式 vs 美式、正式 vs 口語、俚語），列出 2-5 個常見說法，每項含 {thai, pinyin, meaning, frequency, context}，按使用頻率從高到低排序；若無明顯變體則回傳 []
- note：僅當有非平凡補充（例如英美用法差異、常見錯誤、文化背景）才回傳；無則整個欄位省略
- frequency 只能填「最常用」/「常用」/「較少用」

【重要】一字多義處理：
如果這個字有多種完全不同的意思（一字多義），請務必完整呈現所有主要意思：

1. meaning 欄位：列出所有主要意思，用分號（；）隔開
   例如：bank → "銀行；河岸；倚靠"

2. examples 欄位：針對每個不同意思各提供一個例句
   例如 bank 應該有：
   - 例句 1：I need to go to the bank. → 「我需要去銀行。」（呈現「銀行」的用法）
   - 例句 2：We had a picnic on the river bank. → 「我們在河岸上野餐。」（呈現「河岸」的用法）
   - 例句 3：The plane banked sharply to the left. → 「飛機向左大幅傾斜。」（呈現「傾斜、倚靠」的用法）

3. variants 欄位：將每個不同意思當成一個 variant 列出，並在 context 欄位標注該意思的使用情境
   例如 bank：
   - {thai:"bank", meaning:"銀行", context:"金融機構，最常用"}
   - {thai:"bank", meaning:"河岸", context:"地理／自然，河流、湖泊的岸邊"}
   - {thai:"bank", meaning:"傾斜、倚靠", context:"動詞，描述飛機或物體傾斜"}

請全面思考查詢單字是否為一字多義，不要只回傳最常見的意思。

grammar 欄位（句型分析）：
- 用繁體中文簡短說明句子結構，例如「S + V + O」、「S + be + adj」、「If + S + V, S + will + V」
- 如有重要文法點（時態、語氣、片語動詞、慣用語），可附帶說明

只回 JSON：
{"thai":"jump","pinyin":"/dʒʌmp/","meaning":"跳、跳躍","pos":"動詞","examples":[{"thai":"He jumped over the high fence.","pinyin":"/hi dʒʌmpt ˈoʊvər ðə haɪ fens/","zh":"他跳過了高的圍牆。","vocabulary":[{"thai":"jump","pinyin":"/dʒʌmp/","meaning":"跳"},{"thai":"over","pinyin":"/ˈoʊvər/","meaning":"越過"},{"thai":"fence","pinyin":"/fens/","meaning":"圍牆"},{"thai":"high","pinyin":"/haɪ/","meaning":"高的"}],"grammar":"S + V(過去式) + over + N（主詞 + 動詞 + 介系詞 + 受詞），描述跨越動作"}],"collocations":[{"thai":"jump rope","pinyin":"/dʒʌmp roʊp/","zh":"跳繩"},{"thai":"jump in","pinyin":"/dʒʌmp ɪn/","zh":"加入、插話"}],"synonyms":[{"thai":"leap","pinyin":"/liːp/","zh":"跳躍（較文學）"},{"thai":"hop","pinyin":"/hɒp/","zh":"單腳跳"}],"antonyms":[{"thai":"land","pinyin":"/lænd/","zh":"著陸、降落"}],"related":[{"thai":"skip","pinyin":"/skɪp/","zh":"蹦蹦跳跳、略過"},{"thai":"bounce","pinyin":"/baʊns/","zh":"彈跳"}],"variants":[{"thai":"jump","pinyin":"/dʒʌmp/","meaning":"跳、跳躍","frequency":"最常用","context":"標準說法"},{"thai":"leap","pinyin":"/liːp/","meaning":"躍、大跳","frequency":"常用","context":"較文學或強調幅度"},{"thai":"hop","pinyin":"/hɒp/","meaning":"單腳跳、小跳","frequency":"常用","context":"小跳或輕鬆語氣"}]}

注意：thai 必須是英文。`

  const prompt = isQuick ? quickPrompt : fullPrompt

  const friendlyError = { error: '查詢失敗，請稍後再試' }

  const CJK = /[一-鿿]/
  const containsKorean = (text: string): boolean => /[가-힯ᄀ-ᇿ]/.test(text)
  const containsJapanese = (text: string): boolean => /[぀-ゟ゠-ヿ]/.test(text)

  const hasCJKInThai = (r: any): boolean => {
    if (typeof r?.thai === 'string' && CJK.test(r.thai)) return true
    if (Array.isArray(r?.examples) && r.examples.some((ex: any) => typeof ex?.thai === 'string' && CJK.test(ex.thai))) return true
    if (Array.isArray(r?.variants) && r.variants.some((v: any) => typeof v?.thai === 'string' && CJK.test(v.thai))) return true
    return false
  }

  const collectThaiFields = (r: any): string[] => {
    const fields: string[] = []
    if (typeof r?.thai === 'string') fields.push(r.thai)
    const collectFromArr = (arr: any) => {
      if (!Array.isArray(arr)) return
      for (const item of arr) {
        if (typeof item?.thai === 'string') fields.push(item.thai)
        if (Array.isArray(item?.vocabulary)) {
          for (const v of item.vocabulary) if (typeof v?.thai === 'string') fields.push(v.thai)
        }
      }
    }
    collectFromArr(r?.examples)
    collectFromArr(r?.variants)
    collectFromArr(r?.collocations)
    collectFromArr(r?.synonyms)
    collectFromArr(r?.antonyms)
    collectFromArr(r?.related)
    return fields
  }

  const hasWrongLanguageInThai = (r: any): boolean => {
    return collectThaiFields(r).some((t) => containsKorean(t) || containsJapanese(t))
  }

  const callClaude = async () => {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: isQuick ? 400 : 4096,
      system: '英文字典助手。中文一律使用繁體中文。絕不可出現韓文、日文、簡體中文或其他語言。thai 欄位只能是英文（拉丁字母、空格、連字號、撇號）。pinyin 欄位是 IPA 國際音標，用 / / 包圍，重音用 ˈ 標示。',
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const stopReason = message.stop_reason

    try {
      return JSON.parse(text)
    } catch {}

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {}
    }

    console.error('[lookup] JSON parse failed. stop_reason:', stopReason, 'preview:', text.slice(0, 300))
    return null
  }

  try {
    let result = await callClaude()
    if (!result) return NextResponse.json(friendlyError)

    if (hasCJKInThai(result) || hasWrongLanguageInThai(result)) {
      console.warn('[lookup] invalid chars detected in thai fields (CJK/Korean/Japanese), retrying once. thai:', result.thai)
      const retry = await callClaude()
      if (retry) result = retry
    }

    if (Array.isArray(result.examples)) {
      result.examples = result.examples.map((ex: any) => {
        const vocab = ex.vocabulary
        let normalized: any[] = []
        if (Array.isArray(vocab)) {
          normalized = vocab.filter((v: any) => v && typeof v === 'object' && v.thai)
        }
        console.log('[lookup] example vocabulary:', JSON.stringify(normalized))
        return { ...ex, vocabulary: normalized }
      })
    }

    if (!Array.isArray(result.variants)) {
      result.variants = []
    } else {
      result.variants = result.variants.filter(
        (v: any) => v && typeof v === 'object' && v.thai
      )
    }
    console.log('[lookup] thai:', result.thai, '| variants count:', result.variants.length)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Lookup error:', err)
    return NextResponse.json(friendlyError)
  }
}
