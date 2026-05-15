// ============================================================
// 英文句型庫 — 21 個常用句型（每類 3 個，可逐步擴充）
// 分類：A 助動詞 B 時態 C 連接詞 D 疑問 E 比較 F 混淆字 G 生活句型
// ============================================================
//
// 注意：欄位 `thai` / `romanization` / `pinyin` 沿用泰文版的命名，目前儲存
// 「英文文字」與「IPA 音標」，等之後決定是否做欄位重命名再一併調整。
// quiz.blanksMale / blankRomanizationsMale 是泰文敬語性別差異欄位，英文版
// 不使用，留空即可。

export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Category =
  | 'A_modal'        // 助動詞
  | 'B_tense'        // 時態與動作狀態
  | 'C_connector'    // 連接詞與複合句
  | 'D_question'     // 疑問句型
  | 'E_comparison'   // 比較與程度
  | 'F_confusable'   // 常混淆字詞
  | 'G_daily'        // 實用生活句型

export interface GrammarPattern {
  id: number
  category: Category
  level: Level
  keyword: string              // 核心字（英文）
  keywordRomanization: string  // IPA 音標
  pattern: string              // 英文公式
  patternZh: string            // 中文公式
  nameZh: string               // 句型中文名稱
  explanationZh: string        // 中文解說
  tipZh?: string               // 補充小提示
  commonMistakes?: string[]    // 常見錯誤
  examples: {
    thai: string                                // 英文例句
    romanization: string                        // IPA
    chinese: string                             // 中文翻譯
    difficulty?: 'easy' | 'medium' | 'hard'
    words?: { thai: string; rom: string; zh: string }[]
  }[]
  quiz: {
    question: string
    blanks: string[]
    blanksMale?: string[]
    hint: string
    blankRomanizations?: string[]
    blankRomanizationsMale?: string[]
  }
}

export const grammarPatterns: GrammarPattern[] = [
  // ============================================================
  // A. 助動詞（A_modal）
  // ============================================================
  {
    id: 1,
    category: 'A_modal',
    level: 'beginner',
    keyword: 'must',
    keywordRomanization: '/mʌst/',
    pattern: 'S + must + V (原形)',
    patternZh: '主詞 + must + 動詞原形',
    nameZh: '必須／一定要',
    explanationZh: 'must 表示「義務、必要」或「強烈推論」，後面一定接動詞原形，沒有單複數變化。',
    tipZh: '日常口語中，have to 比 must 常見；must 帶有強烈個人語氣或書面語感。',
    commonMistakes: [
      'must 後面不加 to：✗ I must to go ✓ I must go',
      'must 沒有過去式，過去要用 had to',
    ],
    examples: [
      {
        thai: 'I must finish this report tonight.',
        romanization: '/aɪ mʌst ˈfɪnɪʃ ðɪs rɪˈpɔːrt təˈnaɪt/',
        chinese: '我今晚一定要把這份報告做完。',
        difficulty: 'easy',
        words: [
          { thai: 'must', rom: '/mʌst/', zh: '必須' },
          { thai: 'finish', rom: '/ˈfɪnɪʃ/', zh: '完成' },
          { thai: 'tonight', rom: '/təˈnaɪt/', zh: '今晚' },
        ],
      },
      {
        thai: 'You must wear a seatbelt.',
        romanization: '/ju mʌst wer ə ˈsiːtbelt/',
        chinese: '你一定要繫安全帶。',
        difficulty: 'easy',
        words: [
          { thai: 'wear', rom: '/wer/', zh: '穿戴' },
          { thai: 'seatbelt', rom: '/ˈsiːtbelt/', zh: '安全帶' },
        ],
      },
      {
        thai: 'She must be tired after that long flight.',
        romanization: '/ʃi mʌst bi ˈtaɪərd ˈæftər ðæt lɔːŋ flaɪt/',
        chinese: '她搭那麼久的飛機，一定很累。',
        difficulty: 'medium',
        words: [
          { thai: 'tired', rom: '/ˈtaɪərd/', zh: '疲累的' },
          { thai: 'flight', rom: '/flaɪt/', zh: '航班' },
        ],
      },
    ],
    quiz: {
      question: '我必須早起。（用 must）',
      blanks: ['I must get up early.'],
      hint: '主詞 + must + 動詞原形',
      blankRomanizations: ['/aɪ mʌst ɡet ʌp ˈɜːrli/'],
    },
  },

  {
    id: 2,
    category: 'A_modal',
    level: 'beginner',
    keyword: 'can',
    keywordRomanization: '/kæn/',
    pattern: 'S + can + V (原形)',
    patternZh: '主詞 + can + 動詞原形',
    nameZh: '能夠／可以',
    explanationZh: 'can 表示「能力」或「許可」，後面接動詞原形。否定為 can\'t / cannot。',
    tipZh: '問「可以嗎？」最自然的開頭：Can I…? / Can you…?',
    commonMistakes: [
      'can 後面不加 to：✗ I can to swim ✓ I can swim',
      '第三人稱單數不加 s：✗ He cans ✓ He can',
    ],
    examples: [
      {
        thai: 'I can speak a little English.',
        romanization: '/aɪ kæn spiːk ə ˈlɪtl ˈɪŋɡlɪʃ/',
        chinese: '我會講一點英文。',
        difficulty: 'easy',
        words: [
          { thai: 'speak', rom: '/spiːk/', zh: '說' },
          { thai: 'a little', rom: '/ə ˈlɪtl/', zh: '一點點' },
        ],
      },
      {
        thai: 'Can you help me carry this?',
        romanization: '/kæn ju help miː ˈkæri ðɪs/',
        chinese: '可以幫我搬這個嗎？',
        difficulty: 'easy',
        words: [
          { thai: 'help', rom: '/help/', zh: '幫助' },
          { thai: 'carry', rom: '/ˈkæri/', zh: '搬、提' },
        ],
      },
      {
        thai: 'She can play the piano very well.',
        romanization: '/ʃi kæn pleɪ ðə piˈænoʊ ˈveri wel/',
        chinese: '她鋼琴彈得很好。',
        difficulty: 'medium',
        words: [
          { thai: 'piano', rom: '/piˈænoʊ/', zh: '鋼琴' },
        ],
      },
    ],
    quiz: {
      question: '你會游泳嗎？（用 can）',
      blanks: ['Can you swim?'],
      hint: 'Can + 主詞 + 動詞原形？',
      blankRomanizations: ['/kæn ju swɪm/'],
    },
  },

  {
    id: 3,
    category: 'A_modal',
    level: 'beginner',
    keyword: 'should',
    keywordRomanization: '/ʃʊd/',
    pattern: 'S + should + V (原形)',
    patternZh: '主詞 + should + 動詞原形',
    nameZh: '應該／建議',
    explanationZh: 'should 表示「建議、應該」，語氣比 must 軟，常用來給意見。',
    tipZh: '想委婉提建議：You should try… 比 You must… 更不會給人壓迫感。',
    commonMistakes: [
      'should 後面不加 to：✗ You should to rest ✓ You should rest',
    ],
    examples: [
      {
        thai: 'You should drink more water.',
        romanization: '/ju ʃʊd drɪŋk mɔːr ˈwɔːtər/',
        chinese: '你應該多喝水。',
        difficulty: 'easy',
        words: [
          { thai: 'drink', rom: '/drɪŋk/', zh: '喝' },
          { thai: 'water', rom: '/ˈwɔːtər/', zh: '水' },
        ],
      },
      {
        thai: 'We should leave now.',
        romanization: '/wi ʃʊd liːv naʊ/',
        chinese: '我們現在該走了。',
        difficulty: 'easy',
        words: [
          { thai: 'leave', rom: '/liːv/', zh: '離開' },
        ],
      },
      {
        thai: "You shouldn't worry too much about it.",
        romanization: '/ju ʃʊdnt ˈwɜːri tuː mʌtʃ əˈbaʊt ɪt/',
        chinese: '你不應該太過擔心這件事。',
        difficulty: 'medium',
        words: [
          { thai: "shouldn't", rom: '/ʃʊdnt/', zh: '不該' },
          { thai: 'worry', rom: '/ˈwɜːri/', zh: '擔心' },
        ],
      },
    ],
    quiz: {
      question: '你應該早點睡。（用 should）',
      blanks: ['You should go to bed earlier.'],
      hint: '主詞 + should + 動詞原形',
      blankRomanizations: ['/ju ʃʊd ɡoʊ tu bed ˈɜːrliər/'],
    },
  },

  // ============================================================
  // B. 時態（B_tense）
  // ============================================================
  {
    id: 4,
    category: 'B_tense',
    level: 'beginner',
    keyword: 'be V-ing',
    keywordRomanization: '/biː ˈverb ɪŋ/',
    pattern: 'S + am/is/are + V-ing',
    patternZh: '主詞 + be 動詞 + 動詞-ing',
    nameZh: '現在進行式',
    explanationZh: '描述「現在正在做」的動作，或「最近這陣子」持續發生的事。',
    tipZh: '常搭配 now / right now / at the moment / these days。',
    commonMistakes: [
      '別忘了 be 動詞：✗ I working ✓ I am working',
      'state verbs（know, like, want）通常不用進行式',
    ],
    examples: [
      {
        thai: 'I am studying English right now.',
        romanization: '/aɪ æm ˈstʌdiɪŋ ˈɪŋɡlɪʃ raɪt naʊ/',
        chinese: '我現在正在學英文。',
        difficulty: 'easy',
        words: [
          { thai: 'study', rom: '/ˈstʌdi/', zh: '學習、研讀' },
          { thai: 'right now', rom: '/raɪt naʊ/', zh: '現在' },
        ],
      },
      {
        thai: 'She is cooking dinner.',
        romanization: '/ʃi ɪz ˈkʊkɪŋ ˈdɪnər/',
        chinese: '她在煮晚餐。',
        difficulty: 'easy',
        words: [
          { thai: 'cook', rom: '/kʊk/', zh: '煮' },
          { thai: 'dinner', rom: '/ˈdɪnər/', zh: '晚餐' },
        ],
      },
      {
        thai: 'They are not listening to me.',
        romanization: '/ðeɪ ɑːr nɒt ˈlɪsnɪŋ tu miː/',
        chinese: '他們沒在聽我說話。',
        difficulty: 'medium',
        words: [
          { thai: 'listen', rom: '/ˈlɪsn/', zh: '聽' },
        ],
      },
    ],
    quiz: {
      question: '我正在寫一封 email。（用現在進行式）',
      blanks: ['I am writing an email.'],
      hint: '主詞 + am/is/are + V-ing',
      blankRomanizations: ['/aɪ æm ˈraɪtɪŋ ən ˈiːmeɪl/'],
    },
  },

  {
    id: 5,
    category: 'B_tense',
    level: 'intermediate',
    keyword: 'have V-ed',
    keywordRomanization: '/hæv ˈverb d/',
    pattern: 'S + have/has + V-ed (p.p.)',
    patternZh: '主詞 + have/has + 過去分詞',
    nameZh: '現在完成式',
    explanationZh: '表示「從過去到現在的經驗、結果、持續」。常見搭配：already / yet / just / ever / never / since / for。',
    tipZh: '「我去過日本」用 I have been to Japan，不能用 I went（單純講過去事件）。',
    commonMistakes: [
      'have been to（去過）vs. have gone to（已經走了還沒回來）容易混淆',
      '具體時間（yesterday, last week）不能用完成式：✗ I have seen him yesterday',
    ],
    examples: [
      {
        thai: 'I have lived here for five years.',
        romanization: '/aɪ hæv lɪvd hɪər fɔːr faɪv jɪərz/',
        chinese: '我在這住了五年了。',
        difficulty: 'medium',
        words: [
          { thai: 'live', rom: '/lɪv/', zh: '住、活' },
          { thai: 'for', rom: '/fɔːr/', zh: '持續（時間長度）' },
        ],
      },
      {
        thai: 'She has just left the office.',
        romanization: '/ʃi hæz dʒʌst left ði ˈɒfɪs/',
        chinese: '她剛剛離開辦公室。',
        difficulty: 'medium',
        words: [
          { thai: 'just', rom: '/dʒʌst/', zh: '剛剛' },
          { thai: 'left', rom: '/left/', zh: 'leave 的過去分詞' },
        ],
      },
      {
        thai: 'Have you ever tried Indian food?',
        romanization: '/hæv ju ˈevər traɪd ˈɪndiən fuːd/',
        chinese: '你吃過印度菜嗎？',
        difficulty: 'medium',
        words: [
          { thai: 'ever', rom: '/ˈevər/', zh: '曾經' },
          { thai: 'tried', rom: '/traɪd/', zh: 'try 的過去分詞' },
        ],
      },
    ],
    quiz: {
      question: '我從來沒去過巴黎。（用現在完成式）',
      blanks: ['I have never been to Paris.'],
      hint: '主詞 + have/has + never + been to + 地點',
      blankRomanizations: ['/aɪ hæv ˈnevər bɪn tu ˈpærɪs/'],
    },
  },

  {
    id: 6,
    category: 'B_tense',
    level: 'beginner',
    keyword: 'be going to',
    keywordRomanization: '/biː ˈɡoʊɪŋ tu/',
    pattern: 'S + am/is/are + going to + V',
    patternZh: '主詞 + be 動詞 + going to + 動詞原形',
    nameZh: '計畫好的未來',
    explanationZh: '表示「已經決定、有計畫」的未來。與 will 不同 — will 多半是當下才決定的事。',
    tipZh: '看到雲，知道快下雨：It\'s going to rain.（有跡象的預測）',
    commonMistakes: [
      "going to 後面接動詞原形：✗ I'm going to went ✓ I'm going to go",
    ],
    examples: [
      {
        thai: 'I am going to visit my grandma this weekend.',
        romanization: '/aɪ æm ˈɡoʊɪŋ tu ˈvɪzɪt maɪ ˈɡrænmɑː ðɪs ˈwiːkend/',
        chinese: '我這週末要去看奶奶。',
        difficulty: 'easy',
        words: [
          { thai: 'visit', rom: '/ˈvɪzɪt/', zh: '拜訪' },
          { thai: 'weekend', rom: '/ˈwiːkend/', zh: '週末' },
        ],
      },
      {
        thai: "It's going to rain soon.",
        romanization: '/ɪts ˈɡoʊɪŋ tu reɪn suːn/',
        chinese: '快下雨了。',
        difficulty: 'easy',
        words: [
          { thai: 'rain', rom: '/reɪn/', zh: '下雨' },
          { thai: 'soon', rom: '/suːn/', zh: '很快' },
        ],
      },
      {
        thai: 'They are going to get married next year.',
        romanization: '/ðeɪ ɑːr ˈɡoʊɪŋ tu ɡet ˈmærid nekst jɪər/',
        chinese: '他們明年要結婚了。',
        difficulty: 'medium',
        words: [
          { thai: 'get married', rom: '/ɡet ˈmærid/', zh: '結婚' },
        ],
      },
    ],
    quiz: {
      question: '我明天要打給她。（用 be going to）',
      blanks: ['I am going to call her tomorrow.'],
      hint: '主詞 + am/is/are + going to + 動詞原形',
      blankRomanizations: ['/aɪ æm ˈɡoʊɪŋ tu kɔːl hər təˈmɒroʊ/'],
    },
  },

  // ============================================================
  // C. 連接詞（C_connector）
  // ============================================================
  {
    id: 7,
    category: 'C_connector',
    level: 'beginner',
    keyword: 'because',
    keywordRomanization: '/bɪˈkɒz/',
    pattern: 'S + V ..., because + S + V ...',
    patternZh: '結果, because + 原因',
    nameZh: '因為（解釋原因）',
    explanationZh: 'because 接「完整句子」（有主詞動詞）。因為解釋原因，後面一定是 S + V。',
    tipZh: 'because vs. because of：because 接句子；because of 接名詞片語。',
    commonMistakes: [
      'because 後面是完整句子：✗ because the rain ✓ because it rained / because of the rain',
    ],
    examples: [
      {
        thai: "I'm tired because I didn't sleep well.",
        romanization: '/aɪm ˈtaɪərd bɪˈkɒz aɪ ˈdɪdnt sliːp wel/',
        chinese: '我很累，因為昨晚沒睡好。',
        difficulty: 'easy',
        words: [
          { thai: 'tired', rom: '/ˈtaɪərd/', zh: '累的' },
          { thai: 'sleep', rom: '/sliːp/', zh: '睡覺' },
        ],
      },
      {
        thai: 'She stayed home because she was sick.',
        romanization: '/ʃi steɪd hoʊm bɪˈkɒz ʃi wɒz sɪk/',
        chinese: '她待在家，因為生病了。',
        difficulty: 'easy',
        words: [
          { thai: 'stay', rom: '/steɪ/', zh: '停留' },
          { thai: 'sick', rom: '/sɪk/', zh: '生病的' },
        ],
      },
      {
        thai: 'We canceled the trip because of the typhoon.',
        romanization: '/wi ˈkænsld ðə trɪp bɪˈkɒz əv ðə taɪˈfuːn/',
        chinese: '我們因為颱風取消了行程。',
        difficulty: 'medium',
        words: [
          { thai: 'cancel', rom: '/ˈkænsl/', zh: '取消' },
          { thai: 'typhoon', rom: '/taɪˈfuːn/', zh: '颱風' },
        ],
      },
    ],
    quiz: {
      question: '我喜歡她，因為她很善良。（用 because）',
      blanks: ['I like her because she is kind.'],
      hint: 'S + V, because + S + V',
      blankRomanizations: ['/aɪ laɪk hər bɪˈkɒz ʃi ɪz kaɪnd/'],
    },
  },

  {
    id: 8,
    category: 'C_connector',
    level: 'intermediate',
    keyword: 'if',
    keywordRomanization: '/ɪf/',
    pattern: 'If + S + V (現在式), S + will + V',
    patternZh: '如果 + 條件（現在式）, 結果（未來式）',
    nameZh: '第一條件句（真實未來）',
    explanationZh: '描述未來「真的可能發生」的條件 — if 子句用現在式，主句用 will（不要兩邊都用 will）。',
    tipZh: '不確定 → if；確定會發生 → when。',
    commonMistakes: [
      'if 子句不用 will：✗ If it will rain ✓ If it rains',
    ],
    examples: [
      {
        thai: 'If it rains, we will stay home.',
        romanization: '/ɪf ɪt reɪnz wi wɪl steɪ hoʊm/',
        chinese: '如果下雨，我們就待在家。',
        difficulty: 'easy',
        words: [
          { thai: 'rain', rom: '/reɪn/', zh: '下雨' },
          { thai: 'stay', rom: '/steɪ/', zh: '停留' },
        ],
      },
      {
        thai: "If you study hard, you'll pass the exam.",
        romanization: '/ɪf ju ˈstʌdi hɑːrd jul pæs ði ɪɡˈzæm/',
        chinese: '如果你認真讀書，你就會通過考試。',
        difficulty: 'medium',
        words: [
          { thai: 'study hard', rom: '/ˈstʌdi hɑːrd/', zh: '認真讀書' },
          { thai: 'pass', rom: '/pæs/', zh: '通過' },
        ],
      },
      {
        thai: "If she calls, I'll let you know.",
        romanization: '/ɪf ʃi kɔːlz aɪl let ju noʊ/',
        chinese: '如果她打來，我會告訴你。',
        difficulty: 'medium',
        words: [
          { thai: 'call', rom: '/kɔːl/', zh: '打電話' },
          { thai: 'let you know', rom: '/let ju noʊ/', zh: '告訴你' },
        ],
      },
    ],
    quiz: {
      question: '如果你想去，我就跟你一起去。（用第一條件句）',
      blanks: ['If you want to go, I will go with you.'],
      hint: 'If + S + V (現在式), S + will + V',
      blankRomanizations: ['/ɪf ju wɒnt tu ɡoʊ aɪ wɪl ɡoʊ wɪð ju/'],
    },
  },

  {
    id: 9,
    category: 'C_connector',
    level: 'intermediate',
    keyword: 'although',
    keywordRomanization: '/ɔːlˈðoʊ/',
    pattern: 'Although + S + V, S + V',
    patternZh: '雖然 + 句子, 主句',
    nameZh: '雖然／儘管',
    explanationZh: 'although 表示「讓步、轉折」，後面接完整句子，跟 but 不能同時使用。',
    tipZh: 'although ≈ though ≈ even though。though 較口語，even though 語氣更強。',
    commonMistakes: [
      '不要 although 和 but 同句：✗ Although it rained, but we went out',
    ],
    examples: [
      {
        thai: 'Although it was raining, we went out.',
        romanization: '/ɔːlˈðoʊ ɪt wɒz ˈreɪnɪŋ wi went aʊt/',
        chinese: '雖然下著雨，我們還是出門了。',
        difficulty: 'medium',
        words: [
          { thai: 'although', rom: '/ɔːlˈðoʊ/', zh: '雖然' },
          { thai: 'go out', rom: '/ɡoʊ aʊt/', zh: '出門' },
        ],
      },
      {
        thai: "Although he's tired, he keeps working.",
        romanization: '/ɔːlˈðoʊ hiz ˈtaɪərd hi kiːps ˈwɜːrkɪŋ/',
        chinese: '雖然他很累，還是繼續工作。',
        difficulty: 'medium',
        words: [
          { thai: 'keep', rom: '/kiːp/', zh: '保持、繼續' },
          { thai: 'working', rom: '/ˈwɜːrkɪŋ/', zh: '工作（V-ing）' },
        ],
      },
      {
        thai: "Although the food was expensive, it wasn't very good.",
        romanization: '/ɔːlˈðoʊ ðə fuːd wɒz ɪkˈspensɪv ɪt ˈwɒznt ˈveri ɡʊd/',
        chinese: '雖然這頓飯很貴，但其實不太好吃。',
        difficulty: 'hard',
        words: [
          { thai: 'expensive', rom: '/ɪkˈspensɪv/', zh: '昂貴的' },
        ],
      },
    ],
    quiz: {
      question: '雖然她很忙，她還是來幫我。（用 although）',
      blanks: ['Although she was busy, she came to help me.'],
      hint: 'Although + S + V, S + V',
      blankRomanizations: ['/ɔːlˈðoʊ ʃi wɒz ˈbɪzi ʃi keɪm tu help miː/'],
    },
  },

  // ============================================================
  // D. 疑問（D_question）
  // ============================================================
  {
    id: 10,
    category: 'D_question',
    level: 'beginner',
    keyword: 'Do/Does ... ?',
    keywordRomanization: '/du dʌz/',
    pattern: 'Do/Does + S + V (原形) ?',
    patternZh: 'Do/Does + 主詞 + 動詞原形？',
    nameZh: 'Yes/No 問句（一般動詞）',
    explanationZh: '對一般動詞句子提問時，前面要加助動詞 Do（I/you/we/they）或 Does（he/she/it），主動詞回到原形。',
    commonMistakes: [
      'Does 後面動詞回原形：✗ Does she likes ✓ Does she like',
      'be 動詞不用 do：✗ Do you are happy ✓ Are you happy',
    ],
    examples: [
      {
        thai: 'Do you like coffee?',
        romanization: '/du ju laɪk ˈkɒfi/',
        chinese: '你喜歡咖啡嗎？',
        difficulty: 'easy',
        words: [
          { thai: 'like', rom: '/laɪk/', zh: '喜歡' },
          { thai: 'coffee', rom: '/ˈkɒfi/', zh: '咖啡' },
        ],
      },
      {
        thai: 'Does she work in Taipei?',
        romanization: '/dʌz ʃi wɜːrk ɪn taɪˈpeɪ/',
        chinese: '她在台北工作嗎？',
        difficulty: 'easy',
        words: [
          { thai: 'work', rom: '/wɜːrk/', zh: '工作' },
        ],
      },
      {
        thai: 'Do they speak Chinese?',
        romanization: '/du ðeɪ spiːk tʃaɪˈniːz/',
        chinese: '他們會講中文嗎？',
        difficulty: 'easy',
        words: [
          { thai: 'speak', rom: '/spiːk/', zh: '說' },
          { thai: 'Chinese', rom: '/tʃaɪˈniːz/', zh: '中文' },
        ],
      },
    ],
    quiz: {
      question: '你會開車嗎？',
      blanks: ['Do you drive?'],
      hint: 'Do/Does + S + V (原形)？',
      blankRomanizations: ['/du ju draɪv/'],
    },
  },

  {
    id: 11,
    category: 'D_question',
    level: 'beginner',
    keyword: 'Wh- ... ?',
    keywordRomanization: '/wʌt wer wen huː waɪ haʊ/',
    pattern: 'What/Where/When/Who/Why/How + (do/does/is/are) + S + V ?',
    patternZh: '疑問詞 + 助動詞 + 主詞 + 動詞？',
    nameZh: 'Wh- 問句',
    explanationZh: '用疑問詞問「具體內容」。語序：疑問詞 + 助動詞 + 主詞 + 動詞。',
    tipZh: 'How + adj/adv 是高頻組合：How much / How long / How often。',
    examples: [
      {
        thai: 'Where do you live?',
        romanization: '/wer du ju lɪv/',
        chinese: '你住在哪裡？',
        difficulty: 'easy',
        words: [
          { thai: 'where', rom: '/wer/', zh: '哪裡' },
          { thai: 'live', rom: '/lɪv/', zh: '住' },
        ],
      },
      {
        thai: 'What does she want?',
        romanization: '/wʌt dʌz ʃi wɒnt/',
        chinese: '她想要什麼？',
        difficulty: 'easy',
        words: [
          { thai: 'want', rom: '/wɒnt/', zh: '想要' },
        ],
      },
      {
        thai: 'How often do you exercise?',
        romanization: '/haʊ ˈɒfn du ju ˈeksərsaɪz/',
        chinese: '你多久運動一次？',
        difficulty: 'medium',
        words: [
          { thai: 'how often', rom: '/haʊ ˈɒfn/', zh: '多常' },
          { thai: 'exercise', rom: '/ˈeksərsaɪz/', zh: '運動' },
        ],
      },
    ],
    quiz: {
      question: '你為什麼學英文？',
      blanks: ['Why do you study English?'],
      hint: 'Why + do + 主詞 + 動詞原形？',
      blankRomanizations: ['/waɪ du ju ˈstʌdi ˈɪŋɡlɪʃ/'],
    },
  },

  {
    id: 12,
    category: 'D_question',
    level: 'intermediate',
    keyword: "..., isn't it?",
    keywordRomanization: '/ˈɪznt ɪt/',
    pattern: 'S + V ..., 反向助動詞 + S?',
    patternZh: '肯定句 + 否定附加問句 / 否定句 + 肯定附加問句',
    nameZh: '附加問句（tag question）',
    explanationZh: '用來確認或求對方同意。前肯後否、前否後肯，助動詞要跟主句一致。',
    tipZh: '中文的「對吧、是不是？」就是 tag question。',
    commonMistakes: [
      "be 動詞要對應：It's nice, isn't it?（不是 doesn't it）",
    ],
    examples: [
      {
        thai: "It's a beautiful day, isn't it?",
        romanization: '/ɪts ə ˈbjuːtɪfl deɪ ˈɪznt ɪt/',
        chinese: '今天天氣很好，對吧？',
        difficulty: 'medium',
        words: [
          { thai: 'beautiful', rom: '/ˈbjuːtɪfl/', zh: '美麗的' },
        ],
      },
      {
        thai: "You don't smoke, do you?",
        romanization: '/ju doʊnt smoʊk du ju/',
        chinese: '你不抽菸，對吧？',
        difficulty: 'medium',
        words: [
          { thai: 'smoke', rom: '/smoʊk/', zh: '抽菸' },
        ],
      },
      {
        thai: "She can drive, can't she?",
        romanization: '/ʃi kæn draɪv kænt ʃi/',
        chinese: '她會開車吧？',
        difficulty: 'hard',
        words: [
          { thai: 'drive', rom: '/draɪv/', zh: '開車' },
        ],
      },
    ],
    quiz: {
      question: '你喜歡咖啡，對吧？',
      blanks: ["You like coffee, don't you?"],
      hint: "肯定句後面接 don't + 主詞？",
      blankRomanizations: ['/ju laɪk ˈkɒfi doʊnt ju/'],
    },
  },

  // ============================================================
  // E. 比較（E_comparison）
  // ============================================================
  {
    id: 13,
    category: 'E_comparison',
    level: 'beginner',
    keyword: '-er than',
    keywordRomanization: '/ər ðæn/',
    pattern: 'S + V + adj-er + than + ...',
    patternZh: '主詞 + 動詞 + 比較級 + than + 比較對象',
    nameZh: '比較級',
    explanationZh: '短形容詞 +er（tall→taller），長形容詞用 more（beautiful→more beautiful）。後面接 than。',
    tipZh: '不規則：good→better, bad→worse, far→farther/further。',
    commonMistakes: [
      '不要重複比較：✗ more taller ✓ taller',
      'than 不是 then：✗ taller then ✓ taller than',
    ],
    examples: [
      {
        thai: 'He is taller than his brother.',
        romanization: '/hi ɪz ˈtɔːlər ðæn hɪz ˈbrʌðər/',
        chinese: '他比他弟弟高。',
        difficulty: 'easy',
        words: [
          { thai: 'tall', rom: '/tɔːl/', zh: '高' },
          { thai: 'brother', rom: '/ˈbrʌðər/', zh: '兄弟' },
        ],
      },
      {
        thai: 'This book is more interesting than that one.',
        romanization: '/ðɪs bʊk ɪz mɔːr ˈɪntrəstɪŋ ðæn ðæt wʌn/',
        chinese: '這本書比那本有趣。',
        difficulty: 'medium',
        words: [
          { thai: 'interesting', rom: '/ˈɪntrəstɪŋ/', zh: '有趣的' },
        ],
      },
      {
        thai: 'My job is harder than yours.',
        romanization: '/maɪ dʒɒb ɪz ˈhɑːrdər ðæn jɔːrz/',
        chinese: '我的工作比你的辛苦。',
        difficulty: 'medium',
        words: [
          { thai: 'hard', rom: '/hɑːrd/', zh: '困難、辛苦' },
        ],
      },
    ],
    quiz: {
      question: '今天比昨天熱。',
      blanks: ['Today is hotter than yesterday.'],
      hint: '主詞 + is + adj-er + than + 對象',
      blankRomanizations: ['/təˈdeɪ ɪz ˈhɒtər ðæn ˈjestərdeɪ/'],
    },
  },

  {
    id: 14,
    category: 'E_comparison',
    level: 'intermediate',
    keyword: 'the most',
    keywordRomanization: '/ðə moʊst/',
    pattern: 'S + V + the + adj-est / the most + adj',
    patternZh: '主詞 + 動詞 + the + 最高級',
    nameZh: '最高級',
    explanationZh: '短形容詞 +est（tall→tallest），長形容詞用 the most。前面記得加 the。',
    tipZh: '範圍常用 in / of：the tallest in my class / the best of all。',
    commonMistakes: [
      '別忘了 the：✗ He is tallest ✓ He is the tallest',
    ],
    examples: [
      {
        thai: 'She is the smartest student in the class.',
        romanization: '/ʃi ɪz ðə ˈsmɑːrtɪst ˈstuːdnt ɪn ðə klæs/',
        chinese: '她是班上最聰明的學生。',
        difficulty: 'easy',
        words: [
          { thai: 'smart', rom: '/smɑːrt/', zh: '聰明的' },
          { thai: 'class', rom: '/klæs/', zh: '班級' },
        ],
      },
      {
        thai: "This is the most expensive watch I've ever seen.",
        romanization: '/ðɪs ɪz ðə moʊst ɪkˈspensɪv wɒtʃ aɪv ˈevər siːn/',
        chinese: '這是我看過最貴的手錶。',
        difficulty: 'medium',
        words: [
          { thai: 'expensive', rom: '/ɪkˈspensɪv/', zh: '昂貴的' },
          { thai: 'watch', rom: '/wɒtʃ/', zh: '手錶' },
        ],
      },
      {
        thai: 'August is the hottest month here.',
        romanization: '/ˈɔːɡəst ɪz ðə ˈhɒtɪst mʌnθ hɪər/',
        chinese: '八月是這裡最熱的月份。',
        difficulty: 'medium',
        words: [
          { thai: 'hot', rom: '/hɒt/', zh: '熱的' },
        ],
      },
    ],
    quiz: {
      question: '這是我家最好吃的料理。（用最高級）',
      blanks: ['This is the best dish in my family.'],
      hint: 'good 的最高級是 the best',
      blankRomanizations: ['/ðɪs ɪz ðə best dɪʃ ɪn maɪ ˈfæməli/'],
    },
  },

  {
    id: 15,
    category: 'E_comparison',
    level: 'intermediate',
    keyword: 'as ... as',
    keywordRomanization: '/æz æz/',
    pattern: 'S + V + as + adj/adv + as + ...',
    patternZh: '主詞 + 動詞 + as + 形容詞/副詞 + as + 比較對象',
    nameZh: '同級比較（一樣 / 不一樣）',
    explanationZh: '兩邊程度相同用 as ... as；否定 not as/so ... as 表示「不像 …那麼」。中間是形容詞原形（不加 -er）。',
    commonMistakes: [
      '中間不用比較級：✗ as taller as ✓ as tall as',
    ],
    examples: [
      {
        thai: 'She is as tall as her sister.',
        romanization: '/ʃi ɪz æz tɔːl æz hər ˈsɪstər/',
        chinese: '她跟她姐姐一樣高。',
        difficulty: 'easy',
        words: [
          { thai: 'tall', rom: '/tɔːl/', zh: '高' },
          { thai: 'sister', rom: '/ˈsɪstər/', zh: '姊妹' },
        ],
      },
      {
        thai: "This movie isn't as good as the first one.",
        romanization: '/ðɪs ˈmuːvi ˈɪznt æz ɡʊd æz ðə fɜːrst wʌn/',
        chinese: '這部電影沒有第一集好看。',
        difficulty: 'medium',
        words: [
          { thai: 'movie', rom: '/ˈmuːvi/', zh: '電影' },
        ],
      },
      {
        thai: 'Try to run as fast as you can.',
        romanization: '/traɪ tu rʌn æz fæst æz ju kæn/',
        chinese: '盡你所能跑得越快越好。',
        difficulty: 'medium',
        words: [
          { thai: 'try', rom: '/traɪ/', zh: '嘗試' },
          { thai: 'fast', rom: '/fæst/', zh: '快' },
        ],
      },
    ],
    quiz: {
      question: '他跟我一樣忙。',
      blanks: ['He is as busy as me.'],
      hint: 'S + is + as + adj + as + 對象',
      blankRomanizations: ['/hi ɪz æz ˈbɪzi æz miː/'],
    },
  },

  // ============================================================
  // F. 混淆字（F_confusable）
  // ============================================================
  {
    id: 16,
    category: 'F_confusable',
    level: 'beginner',
    keyword: 'a / an',
    keywordRomanization: '/ə æn/',
    pattern: 'a + 子音「發音」開頭 / an + 母音「發音」開頭',
    patternZh: 'a + 子音開頭 / an + 母音開頭',
    nameZh: 'a 與 an 的選擇',
    explanationZh: '看下一個字的「發音」而不是「字母」：an hour（h 不發音），a university（u 發 /ju/，是子音音）。',
    commonMistakes: [
      '✗ an university ✓ a university（u 發 /ju/）',
      '✗ a hour ✓ an hour（h 不發音）',
    ],
    examples: [
      {
        thai: 'I bought a new phone.',
        romanization: '/aɪ bɔːt ə njuː foʊn/',
        chinese: '我買了一支新手機。',
        difficulty: 'easy',
        words: [
          { thai: 'bought', rom: '/bɔːt/', zh: 'buy 的過去式' },
          { thai: 'phone', rom: '/foʊn/', zh: '手機' },
        ],
      },
      {
        thai: 'She is an engineer.',
        romanization: '/ʃi ɪz ən ˌendʒɪˈnɪər/',
        chinese: '她是工程師。',
        difficulty: 'easy',
        words: [
          { thai: 'engineer', rom: '/ˌendʒɪˈnɪər/', zh: '工程師' },
        ],
      },
      {
        thai: 'It takes an hour to get there.',
        romanization: '/ɪt teɪks ən ˈaʊər tu ɡet ðer/',
        chinese: '到那邊要一個小時。',
        difficulty: 'medium',
        words: [
          { thai: 'hour', rom: '/ˈaʊər/', zh: '小時' },
        ],
      },
    ],
    quiz: {
      question: '我有一個想法。',
      blanks: ['I have an idea.'],
      hint: 'idea 開頭是 /aɪ/，母音音',
      blankRomanizations: ['/aɪ hæv ən aɪˈdɪə/'],
    },
  },

  {
    id: 17,
    category: 'F_confusable',
    level: 'beginner',
    keyword: 'much / many / a lot of',
    keywordRomanization: '/mʌtʃ ˈmeni ə lɒt əv/',
    pattern: 'many + 可數複數 / much + 不可數 / a lot of + 兩者皆可',
    patternZh: 'many + 可數複數 / much + 不可數 / a lot of 兩者皆可',
    nameZh: 'much / many / a lot of',
    explanationZh: 'many 接可數名詞（複數），much 接不可數名詞。a lot of 兩種都可以，肯定句最常用。much 在肯定句很少出現，多用於否定和疑問句。',
    commonMistakes: [
      '✗ much books ✓ many books / a lot of books',
      '✗ many money ✓ much money / a lot of money',
    ],
    examples: [
      {
        thai: 'I have many friends in Taipei.',
        romanization: '/aɪ hæv ˈmeni frendz ɪn taɪˈpeɪ/',
        chinese: '我在台北有很多朋友。',
        difficulty: 'easy',
        words: [
          { thai: 'many', rom: '/ˈmeni/', zh: '許多（可數）' },
          { thai: 'friends', rom: '/frendz/', zh: '朋友（複數）' },
        ],
      },
      {
        thai: "I don't have much time.",
        romanization: '/aɪ doʊnt hæv mʌtʃ taɪm/',
        chinese: '我沒有很多時間。',
        difficulty: 'easy',
        words: [
          { thai: 'much', rom: '/mʌtʃ/', zh: '許多（不可數）' },
          { thai: 'time', rom: '/taɪm/', zh: '時間' },
        ],
      },
      {
        thai: 'She drinks a lot of coffee every day.',
        romanization: '/ʃi drɪŋks ə lɒt əv ˈkɒfi ˈevri deɪ/',
        chinese: '她每天喝很多咖啡。',
        difficulty: 'medium',
        words: [
          { thai: 'a lot of', rom: '/ə lɒt əv/', zh: '許多' },
          { thai: 'every day', rom: '/ˈevri deɪ/', zh: '每天' },
        ],
      },
    ],
    quiz: {
      question: '我們有很多錢。',
      blanks: ['We have a lot of money.'],
      hint: 'money 是不可數；肯定句用 a lot of 最自然',
      blankRomanizations: ['/wi hæv ə lɒt əv ˈmʌni/'],
    },
  },

  {
    id: 18,
    category: 'F_confusable',
    level: 'intermediate',
    keyword: 'since / for',
    keywordRomanization: '/sɪns fɔːr/',
    pattern: 'since + 時間「點」 / for + 時間「長度」',
    patternZh: 'since + 起點時間 / for + 持續時間',
    nameZh: 'since 與 for 的差別',
    explanationZh: 'since 後面接「從什麼時候開始」（時間點：last year, 2020, Monday）；for 接「持續多久」（時間長度：five years, two days）。常配現在完成式。',
    commonMistakes: [
      '✗ since two years ✓ for two years',
      '✗ for last year ✓ since last year',
    ],
    examples: [
      {
        thai: 'I have lived here since 2020.',
        romanization: '/aɪ hæv lɪvd hɪər sɪns ˈtwenti ˈtwenti/',
        chinese: '我從 2020 年就住在這裡。',
        difficulty: 'medium',
        words: [
          { thai: 'since', rom: '/sɪns/', zh: '自從' },
        ],
      },
      {
        thai: 'She has worked here for five years.',
        romanization: '/ʃi hæz wɜːrkt hɪər fɔːr faɪv jɪərz/',
        chinese: '她在這工作五年了。',
        difficulty: 'medium',
        words: [
          { thai: 'for', rom: '/fɔːr/', zh: '持續（多久）' },
        ],
      },
      {
        thai: "We haven't seen each other since last summer.",
        romanization: '/wi ˈhævnt siːn iːtʃ ˈʌðər sɪns læst ˈsʌmər/',
        chinese: '我們從去年夏天就沒見過了。',
        difficulty: 'hard',
        words: [
          { thai: 'each other', rom: '/iːtʃ ˈʌðər/', zh: '彼此' },
          { thai: 'last summer', rom: '/læst ˈsʌmər/', zh: '去年夏天' },
        ],
      },
    ],
    quiz: {
      question: '我學英文兩年了。（用 for）',
      blanks: ['I have studied English for two years.'],
      hint: '完成式 + for + 時間長度',
      blankRomanizations: ['/aɪ hæv ˈstʌdid ˈɪŋɡlɪʃ fɔːr tuː jɪərz/'],
    },
  },

  // ============================================================
  // G. 生活句型（G_daily）
  // ============================================================
  {
    id: 19,
    category: 'G_daily',
    level: 'beginner',
    keyword: 'How about ... ?',
    keywordRomanization: '/haʊ əˈbaʊt/',
    pattern: 'How about + N / V-ing ?',
    patternZh: 'How about + 名詞 / 動名詞？',
    nameZh: '提議「…如何？」',
    explanationZh: 'How about 後面接名詞或動名詞（V-ing）。用來提建議或反問對方意見。',
    tipZh: 'What about…? 用法幾乎一樣，可以替換。',
    commonMistakes: [
      'How about 後面不接原形動詞：✗ How about go ✓ How about going',
    ],
    examples: [
      {
        thai: 'How about pizza for dinner?',
        romanization: '/haʊ əˈbaʊt ˈpiːtsə fɔːr ˈdɪnər/',
        chinese: '晚餐吃披薩怎麼樣？',
        difficulty: 'easy',
        words: [
          { thai: 'pizza', rom: '/ˈpiːtsə/', zh: '披薩' },
          { thai: 'dinner', rom: '/ˈdɪnər/', zh: '晚餐' },
        ],
      },
      {
        thai: 'How about going to the beach this weekend?',
        romanization: '/haʊ əˈbaʊt ˈɡoʊɪŋ tu ðə biːtʃ ðɪs ˈwiːkend/',
        chinese: '這週末去海邊怎麼樣？',
        difficulty: 'medium',
        words: [
          { thai: 'beach', rom: '/biːtʃ/', zh: '海邊' },
        ],
      },
      {
        thai: "I'm tired. How about you?",
        romanization: '/aɪm ˈtaɪərd haʊ əˈbaʊt ju/',
        chinese: '我好累，你呢？',
        difficulty: 'easy',
        words: [
          { thai: 'tired', rom: '/ˈtaɪərd/', zh: '累的' },
        ],
      },
    ],
    quiz: {
      question: '一起去看電影怎麼樣？',
      blanks: ['How about watching a movie together?'],
      hint: 'How about + V-ing',
      blankRomanizations: ['/haʊ əˈbaʊt ˈwɒtʃɪŋ ə ˈmuːvi təˈɡeðər/'],
    },
  },

  {
    id: 20,
    category: 'G_daily',
    level: 'beginner',
    keyword: "Let's ...",
    keywordRomanization: '/lets/',
    pattern: "Let's + V (原形)",
    patternZh: "Let's + 動詞原形",
    nameZh: '提議「我們來…吧」',
    explanationZh: "Let's 是 let us 的縮寫，用來邀請大家一起做某件事。否定為 Let's not + V。",
    examples: [
      {
        thai: "Let's go out for dinner.",
        romanization: '/lets ɡoʊ aʊt fɔːr ˈdɪnər/',
        chinese: '我們出去吃晚餐吧。',
        difficulty: 'easy',
        words: [
          { thai: 'go out', rom: '/ɡoʊ aʊt/', zh: '外出' },
        ],
      },
      {
        thai: "Let's take a break.",
        romanization: '/lets teɪk ə breɪk/',
        chinese: '我們休息一下吧。',
        difficulty: 'easy',
        words: [
          { thai: 'take a break', rom: '/teɪk ə breɪk/', zh: '休息一下' },
        ],
      },
      {
        thai: "Let's not argue about it.",
        romanization: '/lets nɒt ˈɑːrɡjuː əˈbaʊt ɪt/',
        chinese: '我們不要再為這件事爭了。',
        difficulty: 'medium',
        words: [
          { thai: 'argue', rom: '/ˈɑːrɡjuː/', zh: '爭論' },
        ],
      },
    ],
    quiz: {
      question: '我們一起學英文吧。',
      blanks: ["Let's study English together."],
      hint: "Let's + V (原形)",
      blankRomanizations: ['/lets ˈstʌdi ˈɪŋɡlɪʃ təˈɡeðər/'],
    },
  },

  {
    id: 21,
    category: 'G_daily',
    level: 'beginner',
    keyword: "I'd like ...",
    keywordRomanization: '/aɪd laɪk/',
    pattern: "I'd like + N / I'd like to + V",
    patternZh: '我想要 + 名詞 / 我想要 + 做某事',
    nameZh: '禮貌地表達想要',
    explanationZh: "I'd like = I would like，比 I want 更禮貌、客氣，餐廳點餐和服務情境最常用。",
    tipZh: "點餐：I'd like a coffee, please. 直接 I want… 在英美聽起來會有點不禮貌。",
    commonMistakes: [
      "I'd like to 後面是動詞原形：✗ I'd like to going ✓ I'd like to go",
    ],
    examples: [
      {
        thai: "I'd like a cup of tea, please.",
        romanization: '/aɪd laɪk ə kʌp əv tiː pliːz/',
        chinese: '我想要一杯茶，謝謝。',
        difficulty: 'easy',
        words: [
          { thai: 'a cup of', rom: '/ə kʌp əv/', zh: '一杯…' },
          { thai: 'tea', rom: '/tiː/', zh: '茶' },
        ],
      },
      {
        thai: "I'd like to make a reservation.",
        romanization: '/aɪd laɪk tu meɪk ə ˌrezərˈveɪʃn/',
        chinese: '我想訂位。',
        difficulty: 'medium',
        words: [
          { thai: 'reservation', rom: '/ˌrezərˈveɪʃn/', zh: '訂位' },
        ],
      },
      {
        thai: "I'd like to know more about this job.",
        romanization: '/aɪd laɪk tu noʊ mɔːr əˈbaʊt ðɪs dʒɒb/',
        chinese: '我想多了解這份工作。',
        difficulty: 'medium',
        words: [
          { thai: 'know', rom: '/noʊ/', zh: '知道' },
          { thai: 'job', rom: '/dʒɒb/', zh: '工作' },
        ],
      },
    ],
    quiz: {
      question: '我想喝一杯咖啡。',
      blanks: ["I'd like a cup of coffee."],
      hint: "I'd like + 名詞片語",
      blankRomanizations: ['/aɪd laɪk ə kʌp əv ˈkɒfi/'],
    },
  },
]
