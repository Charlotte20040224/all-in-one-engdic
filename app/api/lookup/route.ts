import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import { rateLimit, tooManyRequests } from '@/lib/rateLimit'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimit('lookup', session.user.id, 10, '1 m')
  if (!rl.success) return tooManyRequests(rl.reset)

  const { query: rawQuery, mode } = await req.json()
  if (!rawQuery?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })
  if (rawQuery.length > 200) return NextResponse.json({ error: 'Query too long (max 200)' }, { status: 400 })

  // ๆ (U+0E46) 是英文重複符號，例如 เป็นๆ = 重複「เป็น」。移除後再查詢，避免 AI 找不到對應條目。
  const hasRepetitionMark = rawQuery.includes('ๆ')
  const query = hasRepetitionMark ? rawQuery.replace(/ๆ/g, '').trim() : rawQuery
  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  const isQuick = mode === 'quick'

  const repetitionNote = hasRepetitionMark
    ? `\n\n注意：使用者原始查詢為「${rawQuery}」，包含英文重複符號 ๆ。請在 meaning 或 note 中說明：ๆ 是英文的重複符號，表示前一個字重複（用以強調、加強語氣或表達持續、頻繁），例如「${rawQuery}」即為「${query} ${query}」。`
    : ''

  const quickPrompt = `查英文「${query}」（快速模式）。

重要：
- 所有中文說明必須使用繁體中文
- 絕對不能出現韓文、日文、簡體中文或其他語言
- thai 欄位只能包含英文字元（unicode 0E00-0E7F）和空格
- 如果不確定某個詞的英文寫法，寧可省略也不要猜測

規則：
- "thai" 必須是英文字（ก-ฮ）；輸入若為中文/英文，先翻成英文再填入
- examples 的 thai 也只能是英文字
- 中文一律繁體（Traditional Chinese）

拼音規則（以直觀口語發音為準）：
母音規則：
- เ-อ = er，例如 เธอ = ter、เขอ = ker
- เ-ิ = er，例如 เดิน = dern、เกิน = gern
- -ั = a，例如 กัน = gan、มัน = man
- -า = aa，例如 มา = maa、กา = gaa
- -ี = ii，例如 ดี = dii、มี = mii
- -ู = uu，例如 รู้ = rúu、ดู = duu
- เ-า = ao，例如 เรา = rao、เขา = kao
- -อ = or，例如 พอ = por、กอ = gor
- โ- = oh，例如 โต = dtoh、โก = goh
- เ-ย = oey，例如 เลย = loey、เคย = koey
- -ว = uay 或 ao（依前面子音判斷）
- -็ = short vowel，例如 ก็ = gor、จ็ = jor

子音規則：
- ก 字首 = g
- ค = k
- ด 字首 = d
- ต 字首 = dt
- ป 字首 = bp
- พ/ภ = p
- ข/ฃ = k
- จ = j
- ซ/ส/ศ/ษ = s
- ช = ch
- ท/ธ = t
- น = n、ม = m、ง = ng
- ล = l、ร = r
- ว = w、ย = y
- ห = h、ฮ = h
- ฝ/ฟ = f
- ฆ = k

聲調符號：
- 低聲 = à（falling from low）
- 降聲 = â（falling）
- 高聲 = á（high）
- 升聲 = ǎ（rising）
- 中聲 = 無符號

音節用 - 分隔

一字多義處理：
- 如果這個單字有多種完全不同的意思（一字多義），meaning 欄位請列出所有主要意思，用分號（；）隔開
- 例如：ทอด 的 meaning 應為「油炸；延伸、鋪展；放棄」

只回 JSON（只給 1 個例句，例句不需 vocabulary 或 grammar）：
{"thai":"กระโดด","pinyin":"grà-dòot","meaning":"跳、跳躍","pos":"動詞","examples":[{"thai":"เขากระโดดข้ามรั้ว","pinyin":"kǎo grà-dòot kâam rúa","zh":"他跳過圍牆"}]}

注意：thai 必須是英文字（不能填「${query}」本身）。${repetitionNote}`

  const fullPrompt = `查英文「${query}」。

重要：
- 所有中文說明必須使用繁體中文
- 絕對不能出現韓文、日文、簡體中文或其他語言
- thai 欄位只能包含英文字元（unicode 0E00-0E7F）和空格
- 如果不確定某個詞的英文寫法，寧可省略也不要猜測

規則：
- "thai" 必須是英文字（ก-ฮ）；輸入若為中文/英文，先翻成英文再填入
- examples、vocabulary、variants 的 thai 也只能是英文字，不可混中文/英文
- 中文一律繁體（Traditional Chinese）

拼音規則（以直觀口語發音為準）：
母音規則：
- เ-อ = er，例如 เธอ = ter、เขอ = ker
- เ-ิ = er，例如 เดิน = dern、เกิน = gern
- -ั = a，例如 กัน = gan、มัน = man
- -า = aa，例如 มา = maa、กา = gaa
- -ี = ii，例如 ดี = dii、มี = mii
- -ู = uu，例如 รู้ = rúu、ดู = duu
- เ-า = ao，例如 เรา = rao、เขา = kao
- -อ = or，例如 พอ = por、กอ = gor
- โ- = oh，例如 โต = dtoh、โก = goh
- เ-ย = oey，例如 เลย = loey、เคย = koey
- -ว = uay 或 ao（依前面子音判斷）
- -็ = short vowel，例如 ก็ = gor、จ็ = jor

子音規則：
- ก 字首 = g
- ค = k
- ด 字首 = d
- ต 字首 = dt
- ป 字首 = bp
- พ/ภ = p
- ข/ฃ = k
- จ = j
- ซ/ส/ศ/ษ = s
- ช = ch
- ท/ธ = t
- น = n、ม = m、ง = ng
- ล = l、ร = r
- ว = w、ย = y
- ห = h、ฮ = h
- ฝ/ฟ = f
- ฆ = k

聲調符號：
- 低聲 = à（falling from low）
- 降聲 = â（falling）
- 高聲 = á（high）
- 升聲 = ǎ（rising）
- 中聲 = 無符號

音節用 - 分隔

回傳欄位：
- 必填：thai, pinyin, meaning, pos, examples（每例含 thai/pinyin/zh/vocabulary/grammar）
- collocations：常見搭配詞 2-3 個，每項 {thai, pinyin, zh}；無則填 []
- synonyms：近義詞 2-3 個，每項 {thai, pinyin, zh}；無則填 []
- antonyms：反義詞 2-3 個，每項 {thai, pinyin, zh}；無則填 []
- related：同家族詞 2-3 個（同字根、同詞群、常一起出現的相關概念字，例如 ดู 的 related 可包含 มอง、เห็น 等視覺類動詞），每項 {thai, pinyin, zh}；無則填 []
- 【重要】synonyms / antonyms / related 每一項都必須完整包含 thai、pinyin、zh 三個欄位，zh 不能省略也不能為空字串；如果想不到中文意思就不要列出該項
- vocabulary（例句中的）：列出例句中出現的重要單字，每個含 {thai, pinyin, meaning}，至少 3-5 個；極短或極簡的例句才可填 []
- variants：如果這個概念在英文有多種表達方式，列出所有常見說法，每項含 {thai, pinyin, meaning, frequency, context}，按使用頻率從高到低排序，最多 5 個；如果只有一種說法，回傳空陣列 []
- note：僅當有非平凡補充才回傳；無則整個欄位省略
- frequency 只能填「最常用」/「常用」/「較少用」

【重要】一字多義處理：
如果這個單字有多種完全不同的意思（一字多義），請務必完整呈現所有主要意思：

1. meaning 欄位：列出所有主要意思，用分號（；）隔開
   例如：ทอด → "油炸；延伸、鋪展；放棄"

2. examples 欄位：針對每個不同意思各提供一個例句，讓使用者清楚看到每個意思的用法
   例如 ทอด 應該有：
   - 例句 1：ทอดไก่ → 「炸雞」（呈現「油炸」的用法）
   - 例句 2：ทางทอดไปสู่ภูเขา → 「路延伸通往山上」（呈現「延伸」的用法）
   - 例句 3：ทอดทิ้ง → 「拋棄、放棄」（呈現「放棄」的用法）

3. variants 欄位：將每個不同意思當成一個 variant 列出，並在 context 欄位標注該意思的使用情境
   例如 ทอด：
   - {thai:"ทอด", meaning:"油炸", context:"烹飪相關，如炸食物"}
   - {thai:"ทอด", meaning:"延伸、鋪展", context:"描述空間延伸或鋪設"}
   - {thai:"ทอด", meaning:"放棄、拋棄", context:"常與 ทิ้ง 連用為 ทอดทิ้ง"}

請全面思考查詢單字是否為一字多義，不要只回傳最常見的意思。

只回 JSON：
{"thai":"กระโดด","pinyin":"grà-dòot","meaning":"跳、跳躍","pos":"動詞","examples":[{"thai":"เขากระโดดข้ามรั้วสูง","pinyin":"kǎo grà-dòot kâam rúa sǔung","zh":"他跳過高的圍牆","vocabulary":[{"thai":"เขา","pinyin":"kǎo","meaning":"他"},{"thai":"ข้าม","pinyin":"kâam","meaning":"越過、跨過"},{"thai":"รั้ว","pinyin":"rúa","meaning":"圍牆"},{"thai":"สูง","pinyin":"sǔung","meaning":"高"}],"grammar":"主語 + กระโดด + ข้าม + 地點"}],"collocations":[{"thai":"กระโดดเชือก","pinyin":"grà-dòot chûeak","zh":"跳繩"},{"thai":"กระโดดสูง","pinyin":"grà-dòot sǔung","zh":"跳高"}],"synonyms":[{"thai":"โดด","pinyin":"dòot","zh":"跳（口語）"}],"antonyms":[{"thai":"นั่ง","pinyin":"nâng","zh":"坐"}],"related":[{"thai":"วิ่ง","pinyin":"wîng","zh":"跑"},{"thai":"เต้น","pinyin":"dtên","zh":"跳舞"}],"variants":[{"thai":"กระโดด","pinyin":"grà-dòot","meaning":"跳、跳躍","frequency":"最常用","context":"標準說法"},{"thai":"โดด","pinyin":"dòot","meaning":"跳（口語）","frequency":"常用","context":"日常口語"},{"thai":"เต้น","pinyin":"dtên","meaning":"跳動","frequency":"較少用","context":"心臟跳動或跳舞"}]}

注意：thai 必須是英文字（不能填「${query}」本身）。${repetitionNote}`

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
      system: '泰語字典助手。中文一律使用繁體中文。絕不可出現韓文、日文、簡體中文或其他語言。thai 欄位只能包含英文字元（unicode 0E00-0E7F）與空格。拼音照 thai2english.com（ก=g、ต=dt、ป=bp、เดิน=dern）。',
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

    // Normalize vocabulary in every example to always be an array of objects
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

    // Normalize variants to always be an array of valid objects
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
