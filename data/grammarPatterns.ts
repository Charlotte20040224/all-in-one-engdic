// ============================================================
// 英文句型庫 — 21 個常用句型（每類 3 個，可逐步擴充）
// 分類：A 助動詞 B 時態 C 連接詞 D 疑問 E 比較 F 混淆字 G 生活句型
// ============================================================
//
// 注意：欄位 `english` / `ipa` / `ipa` 沿用泰文版的命名，目前儲存
// 「英文文字」與「IPA 音標」，等之後決定是否做欄位重命名再一併調整。
// quiz.blanksMale / blankIpasMale 是泰文敬語性別差異欄位，英文版
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
  keywordIpa: string  // IPA 音標
  pattern: string              // 英文公式
  patternZh: string            // 中文公式
  nameZh: string               // 句型中文名稱
  explanationZh: string        // 中文解說
  tipZh?: string               // 補充小提示
  commonMistakes?: string[]    // 常見錯誤
  examples: {
    english: string                                // 英文例句
    ipa: string                        // IPA
    chinese: string                             // 中文翻譯
    difficulty?: 'easy' | 'medium' | 'hard'
    words?: { english: string; ipa: string; zh: string }[]
  }[]
  quiz: {
    question: string
    blanks: string[]
    blanksMale?: string[]
    hint: string
    blankIpas?: string[]
    blankIpasMale?: string[]
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
    keywordIpa: '/mʌst/',
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
        english: 'I must finish this report tonight.',
        ipa: '/aɪ mʌst ˈfɪnɪʃ ðɪs rɪˈpɔːrt təˈnaɪt/',
        chinese: '我今晚一定要把這份報告做完。',
        difficulty: 'easy',
        words: [
          { english: 'must', ipa: '/mʌst/', zh: '必須' },
          { english: 'finish', ipa: '/ˈfɪnɪʃ/', zh: '完成' },
          { english: 'tonight', ipa: '/təˈnaɪt/', zh: '今晚' },
        ],
      },
      {
        english: 'You must wear a seatbelt.',
        ipa: '/ju mʌst wer ə ˈsiːtbelt/',
        chinese: '你一定要繫安全帶。',
        difficulty: 'easy',
        words: [
          { english: 'wear', ipa: '/wer/', zh: '穿戴' },
          { english: 'seatbelt', ipa: '/ˈsiːtbelt/', zh: '安全帶' },
        ],
      },
      {
        english: 'She must be tired after that long flight.',
        ipa: '/ʃi mʌst bi ˈtaɪərd ˈæftər ðæt lɔːŋ flaɪt/',
        chinese: '她搭那麼久的飛機，一定很累。',
        difficulty: 'medium',
        words: [
          { english: 'tired', ipa: '/ˈtaɪərd/', zh: '疲累的' },
          { english: 'flight', ipa: '/flaɪt/', zh: '航班' },
        ],
      },
    ],
    quiz: {
      question: '我必須早起。（用 must）',
      blanks: ['I must get up early.'],
      hint: '主詞 + must + 動詞原形',
      blankIpas: ['/aɪ mʌst ɡet ʌp ˈɜːrli/'],
    },
  },

  {
    id: 2,
    category: 'A_modal',
    level: 'beginner',
    keyword: 'can',
    keywordIpa: '/kæn/',
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
        english: 'I can speak a little English.',
        ipa: '/aɪ kæn spiːk ə ˈlɪtl ˈɪŋɡlɪʃ/',
        chinese: '我會講一點英文。',
        difficulty: 'easy',
        words: [
          { english: 'speak', ipa: '/spiːk/', zh: '說' },
          { english: 'a little', ipa: '/ə ˈlɪtl/', zh: '一點點' },
        ],
      },
      {
        english: 'Can you help me carry this?',
        ipa: '/kæn ju help miː ˈkæri ðɪs/',
        chinese: '可以幫我搬這個嗎？',
        difficulty: 'easy',
        words: [
          { english: 'help', ipa: '/help/', zh: '幫助' },
          { english: 'carry', ipa: '/ˈkæri/', zh: '搬、提' },
        ],
      },
      {
        english: 'She can play the piano very well.',
        ipa: '/ʃi kæn pleɪ ðə piˈænoʊ ˈveri wel/',
        chinese: '她鋼琴彈得很好。',
        difficulty: 'medium',
        words: [
          { english: 'piano', ipa: '/piˈænoʊ/', zh: '鋼琴' },
        ],
      },
    ],
    quiz: {
      question: '你會游泳嗎？（用 can）',
      blanks: ['Can you swim?'],
      hint: 'Can + 主詞 + 動詞原形？',
      blankIpas: ['/kæn ju swɪm/'],
    },
  },

  {
    id: 3,
    category: 'A_modal',
    level: 'beginner',
    keyword: 'should',
    keywordIpa: '/ʃʊd/',
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
        english: 'You should drink more water.',
        ipa: '/ju ʃʊd drɪŋk mɔːr ˈwɔːtər/',
        chinese: '你應該多喝水。',
        difficulty: 'easy',
        words: [
          { english: 'drink', ipa: '/drɪŋk/', zh: '喝' },
          { english: 'water', ipa: '/ˈwɔːtər/', zh: '水' },
        ],
      },
      {
        english: 'We should leave now.',
        ipa: '/wi ʃʊd liːv naʊ/',
        chinese: '我們現在該走了。',
        difficulty: 'easy',
        words: [
          { english: 'leave', ipa: '/liːv/', zh: '離開' },
        ],
      },
      {
        english: "You shouldn't worry too much about it.",
        ipa: '/ju ʃʊdnt ˈwɜːri tuː mʌtʃ əˈbaʊt ɪt/',
        chinese: '你不應該太過擔心這件事。',
        difficulty: 'medium',
        words: [
          { english: "shouldn't", ipa: '/ʃʊdnt/', zh: '不該' },
          { english: 'worry', ipa: '/ˈwɜːri/', zh: '擔心' },
        ],
      },
    ],
    quiz: {
      question: '你應該早點睡。（用 should）',
      blanks: ['You should go to bed earlier.'],
      hint: '主詞 + should + 動詞原形',
      blankIpas: ['/ju ʃʊd ɡoʊ tu bed ˈɜːrliər/'],
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
    keywordIpa: '/biː ˈverb ɪŋ/',
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
        english: 'I am studying English right now.',
        ipa: '/aɪ æm ˈstʌdiɪŋ ˈɪŋɡlɪʃ raɪt naʊ/',
        chinese: '我現在正在學英文。',
        difficulty: 'easy',
        words: [
          { english: 'study', ipa: '/ˈstʌdi/', zh: '學習、研讀' },
          { english: 'right now', ipa: '/raɪt naʊ/', zh: '現在' },
        ],
      },
      {
        english: 'She is cooking dinner.',
        ipa: '/ʃi ɪz ˈkʊkɪŋ ˈdɪnər/',
        chinese: '她在煮晚餐。',
        difficulty: 'easy',
        words: [
          { english: 'cook', ipa: '/kʊk/', zh: '煮' },
          { english: 'dinner', ipa: '/ˈdɪnər/', zh: '晚餐' },
        ],
      },
      {
        english: 'They are not listening to me.',
        ipa: '/ðeɪ ɑːr nɒt ˈlɪsnɪŋ tu miː/',
        chinese: '他們沒在聽我說話。',
        difficulty: 'medium',
        words: [
          { english: 'listen', ipa: '/ˈlɪsn/', zh: '聽' },
        ],
      },
    ],
    quiz: {
      question: '我正在寫一封 email。（用現在進行式）',
      blanks: ['I am writing an email.'],
      hint: '主詞 + am/is/are + V-ing',
      blankIpas: ['/aɪ æm ˈraɪtɪŋ ən ˈiːmeɪl/'],
    },
  },

  {
    id: 5,
    category: 'B_tense',
    level: 'intermediate',
    keyword: 'have V-ed',
    keywordIpa: '/hæv ˈverb d/',
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
        english: 'I have lived here for five years.',
        ipa: '/aɪ hæv lɪvd hɪər fɔːr faɪv jɪərz/',
        chinese: '我在這住了五年了。',
        difficulty: 'medium',
        words: [
          { english: 'live', ipa: '/lɪv/', zh: '住、活' },
          { english: 'for', ipa: '/fɔːr/', zh: '持續（時間長度）' },
        ],
      },
      {
        english: 'She has just left the office.',
        ipa: '/ʃi hæz dʒʌst left ði ˈɒfɪs/',
        chinese: '她剛剛離開辦公室。',
        difficulty: 'medium',
        words: [
          { english: 'just', ipa: '/dʒʌst/', zh: '剛剛' },
          { english: 'left', ipa: '/left/', zh: 'leave 的過去分詞' },
        ],
      },
      {
        english: 'Have you ever tried Indian food?',
        ipa: '/hæv ju ˈevər traɪd ˈɪndiən fuːd/',
        chinese: '你吃過印度菜嗎？',
        difficulty: 'medium',
        words: [
          { english: 'ever', ipa: '/ˈevər/', zh: '曾經' },
          { english: 'tried', ipa: '/traɪd/', zh: 'try 的過去分詞' },
        ],
      },
    ],
    quiz: {
      question: '我從來沒去過巴黎。（用現在完成式）',
      blanks: ['I have never been to Paris.'],
      hint: '主詞 + have/has + never + been to + 地點',
      blankIpas: ['/aɪ hæv ˈnevər bɪn tu ˈpærɪs/'],
    },
  },

  {
    id: 6,
    category: 'B_tense',
    level: 'beginner',
    keyword: 'be going to',
    keywordIpa: '/biː ˈɡoʊɪŋ tu/',
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
        english: 'I am going to visit my grandma this weekend.',
        ipa: '/aɪ æm ˈɡoʊɪŋ tu ˈvɪzɪt maɪ ˈɡrænmɑː ðɪs ˈwiːkend/',
        chinese: '我這週末要去看奶奶。',
        difficulty: 'easy',
        words: [
          { english: 'visit', ipa: '/ˈvɪzɪt/', zh: '拜訪' },
          { english: 'weekend', ipa: '/ˈwiːkend/', zh: '週末' },
        ],
      },
      {
        english: "It's going to rain soon.",
        ipa: '/ɪts ˈɡoʊɪŋ tu reɪn suːn/',
        chinese: '快下雨了。',
        difficulty: 'easy',
        words: [
          { english: 'rain', ipa: '/reɪn/', zh: '下雨' },
          { english: 'soon', ipa: '/suːn/', zh: '很快' },
        ],
      },
      {
        english: 'They are going to get married next year.',
        ipa: '/ðeɪ ɑːr ˈɡoʊɪŋ tu ɡet ˈmærid nekst jɪər/',
        chinese: '他們明年要結婚了。',
        difficulty: 'medium',
        words: [
          { english: 'get married', ipa: '/ɡet ˈmærid/', zh: '結婚' },
        ],
      },
    ],
    quiz: {
      question: '我明天要打給她。（用 be going to）',
      blanks: ['I am going to call her tomorrow.'],
      hint: '主詞 + am/is/are + going to + 動詞原形',
      blankIpas: ['/aɪ æm ˈɡoʊɪŋ tu kɔːl hər təˈmɒroʊ/'],
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
    keywordIpa: '/bɪˈkɒz/',
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
        english: "I'm tired because I didn't sleep well.",
        ipa: '/aɪm ˈtaɪərd bɪˈkɒz aɪ ˈdɪdnt sliːp wel/',
        chinese: '我很累，因為昨晚沒睡好。',
        difficulty: 'easy',
        words: [
          { english: 'tired', ipa: '/ˈtaɪərd/', zh: '累的' },
          { english: 'sleep', ipa: '/sliːp/', zh: '睡覺' },
        ],
      },
      {
        english: 'She stayed home because she was sick.',
        ipa: '/ʃi steɪd hoʊm bɪˈkɒz ʃi wɒz sɪk/',
        chinese: '她待在家，因為生病了。',
        difficulty: 'easy',
        words: [
          { english: 'stay', ipa: '/steɪ/', zh: '停留' },
          { english: 'sick', ipa: '/sɪk/', zh: '生病的' },
        ],
      },
      {
        english: 'We canceled the trip because of the typhoon.',
        ipa: '/wi ˈkænsld ðə trɪp bɪˈkɒz əv ðə taɪˈfuːn/',
        chinese: '我們因為颱風取消了行程。',
        difficulty: 'medium',
        words: [
          { english: 'cancel', ipa: '/ˈkænsl/', zh: '取消' },
          { english: 'typhoon', ipa: '/taɪˈfuːn/', zh: '颱風' },
        ],
      },
    ],
    quiz: {
      question: '我喜歡她，因為她很善良。（用 because）',
      blanks: ['I like her because she is kind.'],
      hint: 'S + V, because + S + V',
      blankIpas: ['/aɪ laɪk hər bɪˈkɒz ʃi ɪz kaɪnd/'],
    },
  },

  {
    id: 8,
    category: 'C_connector',
    level: 'intermediate',
    keyword: 'if',
    keywordIpa: '/ɪf/',
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
        english: 'If it rains, we will stay home.',
        ipa: '/ɪf ɪt reɪnz wi wɪl steɪ hoʊm/',
        chinese: '如果下雨，我們就待在家。',
        difficulty: 'easy',
        words: [
          { english: 'rain', ipa: '/reɪn/', zh: '下雨' },
          { english: 'stay', ipa: '/steɪ/', zh: '停留' },
        ],
      },
      {
        english: "If you study hard, you'll pass the exam.",
        ipa: '/ɪf ju ˈstʌdi hɑːrd jul pæs ði ɪɡˈzæm/',
        chinese: '如果你認真讀書，你就會通過考試。',
        difficulty: 'medium',
        words: [
          { english: 'study hard', ipa: '/ˈstʌdi hɑːrd/', zh: '認真讀書' },
          { english: 'pass', ipa: '/pæs/', zh: '通過' },
        ],
      },
      {
        english: "If she calls, I'll let you know.",
        ipa: '/ɪf ʃi kɔːlz aɪl let ju noʊ/',
        chinese: '如果她打來，我會告訴你。',
        difficulty: 'medium',
        words: [
          { english: 'call', ipa: '/kɔːl/', zh: '打電話' },
          { english: 'let you know', ipa: '/let ju noʊ/', zh: '告訴你' },
        ],
      },
    ],
    quiz: {
      question: '如果你想去，我就跟你一起去。（用第一條件句）',
      blanks: ['If you want to go, I will go with you.'],
      hint: 'If + S + V (現在式), S + will + V',
      blankIpas: ['/ɪf ju wɒnt tu ɡoʊ aɪ wɪl ɡoʊ wɪð ju/'],
    },
  },

  {
    id: 9,
    category: 'C_connector',
    level: 'intermediate',
    keyword: 'although',
    keywordIpa: '/ɔːlˈðoʊ/',
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
        english: 'Although it was raining, we went out.',
        ipa: '/ɔːlˈðoʊ ɪt wɒz ˈreɪnɪŋ wi went aʊt/',
        chinese: '雖然下著雨，我們還是出門了。',
        difficulty: 'medium',
        words: [
          { english: 'although', ipa: '/ɔːlˈðoʊ/', zh: '雖然' },
          { english: 'go out', ipa: '/ɡoʊ aʊt/', zh: '出門' },
        ],
      },
      {
        english: "Although he's tired, he keeps working.",
        ipa: '/ɔːlˈðoʊ hiz ˈtaɪərd hi kiːps ˈwɜːrkɪŋ/',
        chinese: '雖然他很累，還是繼續工作。',
        difficulty: 'medium',
        words: [
          { english: 'keep', ipa: '/kiːp/', zh: '保持、繼續' },
          { english: 'working', ipa: '/ˈwɜːrkɪŋ/', zh: '工作（V-ing）' },
        ],
      },
      {
        english: "Although the food was expensive, it wasn't very good.",
        ipa: '/ɔːlˈðoʊ ðə fuːd wɒz ɪkˈspensɪv ɪt ˈwɒznt ˈveri ɡʊd/',
        chinese: '雖然這頓飯很貴，但其實不太好吃。',
        difficulty: 'hard',
        words: [
          { english: 'expensive', ipa: '/ɪkˈspensɪv/', zh: '昂貴的' },
        ],
      },
    ],
    quiz: {
      question: '雖然她很忙，她還是來幫我。（用 although）',
      blanks: ['Although she was busy, she came to help me.'],
      hint: 'Although + S + V, S + V',
      blankIpas: ['/ɔːlˈðoʊ ʃi wɒz ˈbɪzi ʃi keɪm tu help miː/'],
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
    keywordIpa: '/du dʌz/',
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
        english: 'Do you like coffee?',
        ipa: '/du ju laɪk ˈkɒfi/',
        chinese: '你喜歡咖啡嗎？',
        difficulty: 'easy',
        words: [
          { english: 'like', ipa: '/laɪk/', zh: '喜歡' },
          { english: 'coffee', ipa: '/ˈkɒfi/', zh: '咖啡' },
        ],
      },
      {
        english: 'Does she work in Taipei?',
        ipa: '/dʌz ʃi wɜːrk ɪn taɪˈpeɪ/',
        chinese: '她在台北工作嗎？',
        difficulty: 'easy',
        words: [
          { english: 'work', ipa: '/wɜːrk/', zh: '工作' },
        ],
      },
      {
        english: 'Do they speak Chinese?',
        ipa: '/du ðeɪ spiːk tʃaɪˈniːz/',
        chinese: '他們會講中文嗎？',
        difficulty: 'easy',
        words: [
          { english: 'speak', ipa: '/spiːk/', zh: '說' },
          { english: 'Chinese', ipa: '/tʃaɪˈniːz/', zh: '中文' },
        ],
      },
    ],
    quiz: {
      question: '你會開車嗎？',
      blanks: ['Do you drive?'],
      hint: 'Do/Does + S + V (原形)？',
      blankIpas: ['/du ju draɪv/'],
    },
  },

  {
    id: 11,
    category: 'D_question',
    level: 'beginner',
    keyword: 'Wh- ... ?',
    keywordIpa: '/wʌt wer wen huː waɪ haʊ/',
    pattern: 'What/Where/When/Who/Why/How + (do/does/is/are) + S + V ?',
    patternZh: '疑問詞 + 助動詞 + 主詞 + 動詞？',
    nameZh: 'Wh- 問句',
    explanationZh: '用疑問詞問「具體內容」。語序：疑問詞 + 助動詞 + 主詞 + 動詞。',
    tipZh: 'How + adj/adv 是高頻組合：How much / How long / How often。',
    examples: [
      {
        english: 'Where do you live?',
        ipa: '/wer du ju lɪv/',
        chinese: '你住在哪裡？',
        difficulty: 'easy',
        words: [
          { english: 'where', ipa: '/wer/', zh: '哪裡' },
          { english: 'live', ipa: '/lɪv/', zh: '住' },
        ],
      },
      {
        english: 'What does she want?',
        ipa: '/wʌt dʌz ʃi wɒnt/',
        chinese: '她想要什麼？',
        difficulty: 'easy',
        words: [
          { english: 'want', ipa: '/wɒnt/', zh: '想要' },
        ],
      },
      {
        english: 'How often do you exercise?',
        ipa: '/haʊ ˈɒfn du ju ˈeksərsaɪz/',
        chinese: '你多久運動一次？',
        difficulty: 'medium',
        words: [
          { english: 'how often', ipa: '/haʊ ˈɒfn/', zh: '多常' },
          { english: 'exercise', ipa: '/ˈeksərsaɪz/', zh: '運動' },
        ],
      },
    ],
    quiz: {
      question: '你為什麼學英文？',
      blanks: ['Why do you study English?'],
      hint: 'Why + do + 主詞 + 動詞原形？',
      blankIpas: ['/waɪ du ju ˈstʌdi ˈɪŋɡlɪʃ/'],
    },
  },

  {
    id: 12,
    category: 'D_question',
    level: 'intermediate',
    keyword: "..., isn't it?",
    keywordIpa: '/ˈɪznt ɪt/',
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
        english: "It's a beautiful day, isn't it?",
        ipa: '/ɪts ə ˈbjuːtɪfl deɪ ˈɪznt ɪt/',
        chinese: '今天天氣很好，對吧？',
        difficulty: 'medium',
        words: [
          { english: 'beautiful', ipa: '/ˈbjuːtɪfl/', zh: '美麗的' },
        ],
      },
      {
        english: "You don't smoke, do you?",
        ipa: '/ju doʊnt smoʊk du ju/',
        chinese: '你不抽菸，對吧？',
        difficulty: 'medium',
        words: [
          { english: 'smoke', ipa: '/smoʊk/', zh: '抽菸' },
        ],
      },
      {
        english: "She can drive, can't she?",
        ipa: '/ʃi kæn draɪv kænt ʃi/',
        chinese: '她會開車吧？',
        difficulty: 'hard',
        words: [
          { english: 'drive', ipa: '/draɪv/', zh: '開車' },
        ],
      },
    ],
    quiz: {
      question: '你喜歡咖啡，對吧？',
      blanks: ["You like coffee, don't you?"],
      hint: "肯定句後面接 don't + 主詞？",
      blankIpas: ['/ju laɪk ˈkɒfi doʊnt ju/'],
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
    keywordIpa: '/ər ðæn/',
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
        english: 'He is taller than his brother.',
        ipa: '/hi ɪz ˈtɔːlər ðæn hɪz ˈbrʌðər/',
        chinese: '他比他弟弟高。',
        difficulty: 'easy',
        words: [
          { english: 'tall', ipa: '/tɔːl/', zh: '高' },
          { english: 'brother', ipa: '/ˈbrʌðər/', zh: '兄弟' },
        ],
      },
      {
        english: 'This book is more interesting than that one.',
        ipa: '/ðɪs bʊk ɪz mɔːr ˈɪntrəstɪŋ ðæn ðæt wʌn/',
        chinese: '這本書比那本有趣。',
        difficulty: 'medium',
        words: [
          { english: 'interesting', ipa: '/ˈɪntrəstɪŋ/', zh: '有趣的' },
        ],
      },
      {
        english: 'My job is harder than yours.',
        ipa: '/maɪ dʒɒb ɪz ˈhɑːrdər ðæn jɔːrz/',
        chinese: '我的工作比你的辛苦。',
        difficulty: 'medium',
        words: [
          { english: 'hard', ipa: '/hɑːrd/', zh: '困難、辛苦' },
        ],
      },
    ],
    quiz: {
      question: '今天比昨天熱。',
      blanks: ['Today is hotter than yesterday.'],
      hint: '主詞 + is + adj-er + than + 對象',
      blankIpas: ['/təˈdeɪ ɪz ˈhɒtər ðæn ˈjestərdeɪ/'],
    },
  },

  {
    id: 14,
    category: 'E_comparison',
    level: 'intermediate',
    keyword: 'the most',
    keywordIpa: '/ðə moʊst/',
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
        english: 'She is the smartest student in the class.',
        ipa: '/ʃi ɪz ðə ˈsmɑːrtɪst ˈstuːdnt ɪn ðə klæs/',
        chinese: '她是班上最聰明的學生。',
        difficulty: 'easy',
        words: [
          { english: 'smart', ipa: '/smɑːrt/', zh: '聰明的' },
          { english: 'class', ipa: '/klæs/', zh: '班級' },
        ],
      },
      {
        english: "This is the most expensive watch I've ever seen.",
        ipa: '/ðɪs ɪz ðə moʊst ɪkˈspensɪv wɒtʃ aɪv ˈevər siːn/',
        chinese: '這是我看過最貴的手錶。',
        difficulty: 'medium',
        words: [
          { english: 'expensive', ipa: '/ɪkˈspensɪv/', zh: '昂貴的' },
          { english: 'watch', ipa: '/wɒtʃ/', zh: '手錶' },
        ],
      },
      {
        english: 'August is the hottest month here.',
        ipa: '/ˈɔːɡəst ɪz ðə ˈhɒtɪst mʌnθ hɪər/',
        chinese: '八月是這裡最熱的月份。',
        difficulty: 'medium',
        words: [
          { english: 'hot', ipa: '/hɒt/', zh: '熱的' },
        ],
      },
    ],
    quiz: {
      question: '這是我家最好吃的料理。（用最高級）',
      blanks: ['This is the best dish in my family.'],
      hint: 'good 的最高級是 the best',
      blankIpas: ['/ðɪs ɪz ðə best dɪʃ ɪn maɪ ˈfæməli/'],
    },
  },

  {
    id: 15,
    category: 'E_comparison',
    level: 'intermediate',
    keyword: 'as ... as',
    keywordIpa: '/æz æz/',
    pattern: 'S + V + as + adj/adv + as + ...',
    patternZh: '主詞 + 動詞 + as + 形容詞/副詞 + as + 比較對象',
    nameZh: '同級比較（一樣 / 不一樣）',
    explanationZh: '兩邊程度相同用 as ... as；否定 not as/so ... as 表示「不像 …那麼」。中間是形容詞原形（不加 -er）。',
    commonMistakes: [
      '中間不用比較級：✗ as taller as ✓ as tall as',
    ],
    examples: [
      {
        english: 'She is as tall as her sister.',
        ipa: '/ʃi ɪz æz tɔːl æz hər ˈsɪstər/',
        chinese: '她跟她姐姐一樣高。',
        difficulty: 'easy',
        words: [
          { english: 'tall', ipa: '/tɔːl/', zh: '高' },
          { english: 'sister', ipa: '/ˈsɪstər/', zh: '姊妹' },
        ],
      },
      {
        english: "This movie isn't as good as the first one.",
        ipa: '/ðɪs ˈmuːvi ˈɪznt æz ɡʊd æz ðə fɜːrst wʌn/',
        chinese: '這部電影沒有第一集好看。',
        difficulty: 'medium',
        words: [
          { english: 'movie', ipa: '/ˈmuːvi/', zh: '電影' },
        ],
      },
      {
        english: 'Try to run as fast as you can.',
        ipa: '/traɪ tu rʌn æz fæst æz ju kæn/',
        chinese: '盡你所能跑得越快越好。',
        difficulty: 'medium',
        words: [
          { english: 'try', ipa: '/traɪ/', zh: '嘗試' },
          { english: 'fast', ipa: '/fæst/', zh: '快' },
        ],
      },
    ],
    quiz: {
      question: '他跟我一樣忙。',
      blanks: ['He is as busy as me.'],
      hint: 'S + is + as + adj + as + 對象',
      blankIpas: ['/hi ɪz æz ˈbɪzi æz miː/'],
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
    keywordIpa: '/ə æn/',
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
        english: 'I bought a new phone.',
        ipa: '/aɪ bɔːt ə njuː foʊn/',
        chinese: '我買了一支新手機。',
        difficulty: 'easy',
        words: [
          { english: 'bought', ipa: '/bɔːt/', zh: 'buy 的過去式' },
          { english: 'phone', ipa: '/foʊn/', zh: '手機' },
        ],
      },
      {
        english: 'She is an engineer.',
        ipa: '/ʃi ɪz ən ˌendʒɪˈnɪər/',
        chinese: '她是工程師。',
        difficulty: 'easy',
        words: [
          { english: 'engineer', ipa: '/ˌendʒɪˈnɪər/', zh: '工程師' },
        ],
      },
      {
        english: 'It takes an hour to get there.',
        ipa: '/ɪt teɪks ən ˈaʊər tu ɡet ðer/',
        chinese: '到那邊要一個小時。',
        difficulty: 'medium',
        words: [
          { english: 'hour', ipa: '/ˈaʊər/', zh: '小時' },
        ],
      },
    ],
    quiz: {
      question: '我有一個想法。',
      blanks: ['I have an idea.'],
      hint: 'idea 開頭是 /aɪ/，母音音',
      blankIpas: ['/aɪ hæv ən aɪˈdɪə/'],
    },
  },

  {
    id: 17,
    category: 'F_confusable',
    level: 'beginner',
    keyword: 'much / many / a lot of',
    keywordIpa: '/mʌtʃ ˈmeni ə lɒt əv/',
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
        english: 'I have many friends in Taipei.',
        ipa: '/aɪ hæv ˈmeni frendz ɪn taɪˈpeɪ/',
        chinese: '我在台北有很多朋友。',
        difficulty: 'easy',
        words: [
          { english: 'many', ipa: '/ˈmeni/', zh: '許多（可數）' },
          { english: 'friends', ipa: '/frendz/', zh: '朋友（複數）' },
        ],
      },
      {
        english: "I don't have much time.",
        ipa: '/aɪ doʊnt hæv mʌtʃ taɪm/',
        chinese: '我沒有很多時間。',
        difficulty: 'easy',
        words: [
          { english: 'much', ipa: '/mʌtʃ/', zh: '許多（不可數）' },
          { english: 'time', ipa: '/taɪm/', zh: '時間' },
        ],
      },
      {
        english: 'She drinks a lot of coffee every day.',
        ipa: '/ʃi drɪŋks ə lɒt əv ˈkɒfi ˈevri deɪ/',
        chinese: '她每天喝很多咖啡。',
        difficulty: 'medium',
        words: [
          { english: 'a lot of', ipa: '/ə lɒt əv/', zh: '許多' },
          { english: 'every day', ipa: '/ˈevri deɪ/', zh: '每天' },
        ],
      },
    ],
    quiz: {
      question: '我們有很多錢。',
      blanks: ['We have a lot of money.'],
      hint: 'money 是不可數；肯定句用 a lot of 最自然',
      blankIpas: ['/wi hæv ə lɒt əv ˈmʌni/'],
    },
  },

  {
    id: 18,
    category: 'F_confusable',
    level: 'intermediate',
    keyword: 'since / for',
    keywordIpa: '/sɪns fɔːr/',
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
        english: 'I have lived here since 2020.',
        ipa: '/aɪ hæv lɪvd hɪər sɪns ˈtwenti ˈtwenti/',
        chinese: '我從 2020 年就住在這裡。',
        difficulty: 'medium',
        words: [
          { english: 'since', ipa: '/sɪns/', zh: '自從' },
        ],
      },
      {
        english: 'She has worked here for five years.',
        ipa: '/ʃi hæz wɜːrkt hɪər fɔːr faɪv jɪərz/',
        chinese: '她在這工作五年了。',
        difficulty: 'medium',
        words: [
          { english: 'for', ipa: '/fɔːr/', zh: '持續（多久）' },
        ],
      },
      {
        english: "We haven't seen each other since last summer.",
        ipa: '/wi ˈhævnt siːn iːtʃ ˈʌðər sɪns læst ˈsʌmər/',
        chinese: '我們從去年夏天就沒見過了。',
        difficulty: 'hard',
        words: [
          { english: 'each other', ipa: '/iːtʃ ˈʌðər/', zh: '彼此' },
          { english: 'last summer', ipa: '/læst ˈsʌmər/', zh: '去年夏天' },
        ],
      },
    ],
    quiz: {
      question: '我學英文兩年了。（用 for）',
      blanks: ['I have studied English for two years.'],
      hint: '完成式 + for + 時間長度',
      blankIpas: ['/aɪ hæv ˈstʌdid ˈɪŋɡlɪʃ fɔːr tuː jɪərz/'],
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
    keywordIpa: '/haʊ əˈbaʊt/',
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
        english: 'How about pizza for dinner?',
        ipa: '/haʊ əˈbaʊt ˈpiːtsə fɔːr ˈdɪnər/',
        chinese: '晚餐吃披薩怎麼樣？',
        difficulty: 'easy',
        words: [
          { english: 'pizza', ipa: '/ˈpiːtsə/', zh: '披薩' },
          { english: 'dinner', ipa: '/ˈdɪnər/', zh: '晚餐' },
        ],
      },
      {
        english: 'How about going to the beach this weekend?',
        ipa: '/haʊ əˈbaʊt ˈɡoʊɪŋ tu ðə biːtʃ ðɪs ˈwiːkend/',
        chinese: '這週末去海邊怎麼樣？',
        difficulty: 'medium',
        words: [
          { english: 'beach', ipa: '/biːtʃ/', zh: '海邊' },
        ],
      },
      {
        english: "I'm tired. How about you?",
        ipa: '/aɪm ˈtaɪərd haʊ əˈbaʊt ju/',
        chinese: '我好累，你呢？',
        difficulty: 'easy',
        words: [
          { english: 'tired', ipa: '/ˈtaɪərd/', zh: '累的' },
        ],
      },
    ],
    quiz: {
      question: '一起去看電影怎麼樣？',
      blanks: ['How about watching a movie together?'],
      hint: 'How about + V-ing',
      blankIpas: ['/haʊ əˈbaʊt ˈwɒtʃɪŋ ə ˈmuːvi təˈɡeðər/'],
    },
  },

  {
    id: 20,
    category: 'G_daily',
    level: 'beginner',
    keyword: "Let's ...",
    keywordIpa: '/lets/',
    pattern: "Let's + V (原形)",
    patternZh: "Let's + 動詞原形",
    nameZh: '提議「我們來…吧」',
    explanationZh: "Let's 是 let us 的縮寫，用來邀請大家一起做某件事。否定為 Let's not + V。",
    examples: [
      {
        english: "Let's go out for dinner.",
        ipa: '/lets ɡoʊ aʊt fɔːr ˈdɪnər/',
        chinese: '我們出去吃晚餐吧。',
        difficulty: 'easy',
        words: [
          { english: 'go out', ipa: '/ɡoʊ aʊt/', zh: '外出' },
        ],
      },
      {
        english: "Let's take a break.",
        ipa: '/lets teɪk ə breɪk/',
        chinese: '我們休息一下吧。',
        difficulty: 'easy',
        words: [
          { english: 'take a break', ipa: '/teɪk ə breɪk/', zh: '休息一下' },
        ],
      },
      {
        english: "Let's not argue about it.",
        ipa: '/lets nɒt ˈɑːrɡjuː əˈbaʊt ɪt/',
        chinese: '我們不要再為這件事爭了。',
        difficulty: 'medium',
        words: [
          { english: 'argue', ipa: '/ˈɑːrɡjuː/', zh: '爭論' },
        ],
      },
    ],
    quiz: {
      question: '我們一起學英文吧。',
      blanks: ["Let's study English together."],
      hint: "Let's + V (原形)",
      blankIpas: ['/lets ˈstʌdi ˈɪŋɡlɪʃ təˈɡeðər/'],
    },
  },

  {
    id: 21,
    category: 'G_daily',
    level: 'beginner',
    keyword: "I'd like ...",
    keywordIpa: '/aɪd laɪk/',
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
        english: "I'd like a cup of tea, please.",
        ipa: '/aɪd laɪk ə kʌp əv tiː pliːz/',
        chinese: '我想要一杯茶，謝謝。',
        difficulty: 'easy',
        words: [
          { english: 'a cup of', ipa: '/ə kʌp əv/', zh: '一杯…' },
          { english: 'tea', ipa: '/tiː/', zh: '茶' },
        ],
      },
      {
        english: "I'd like to make a reservation.",
        ipa: '/aɪd laɪk tu meɪk ə ˌrezərˈveɪʃn/',
        chinese: '我想訂位。',
        difficulty: 'medium',
        words: [
          { english: 'reservation', ipa: '/ˌrezərˈveɪʃn/', zh: '訂位' },
        ],
      },
      {
        english: "I'd like to know more about this job.",
        ipa: '/aɪd laɪk tu noʊ mɔːr əˈbaʊt ðɪs dʒɒb/',
        chinese: '我想多了解這份工作。',
        difficulty: 'medium',
        words: [
          { english: 'know', ipa: '/noʊ/', zh: '知道' },
          { english: 'job', ipa: '/dʒɒb/', zh: '工作' },
        ],
      },
    ],
    quiz: {
      question: '我想喝一杯咖啡。',
      blanks: ["I'd like a cup of coffee."],
      hint: "I'd like + 名詞片語",
      blankIpas: ['/aɪd laɪk ə kʌp əv ˈkɒfi/'],
    },
  },
]
