// Note: field `english` historically named from the original Thai-vocab app;
// it now stores the English sentence. `ipa` stores simplified IPA.
// DB schema field names are preserved to avoid migration.
export interface DailySentence {
  english: string      // English sentence
  ipa: string    // Pronunciation / IPA
  zh: string        // Chinese translation
  context: string   // Theme key (must match THEMES in app/app/page.tsx)
}

export const DAILY_SENTENCES: DailySentence[] = [
  // 👋 打招呼 & 自我介紹
  { english: 'Hi, nice to meet you.',            ipa: '/haɪ naɪs tu ˈmiːt ju/',          zh: '嗨，很高興認識你。',     context: '👋 打招呼 & 自我介紹' },
  { english: 'My name is ___.',                  ipa: '/maɪ neɪm ɪz/',                   zh: '我叫 ___。',              context: '👋 打招呼 & 自我介紹' },
  { english: "I'm from Taiwan.",                 ipa: '/aɪm frʌm taɪˈwɑːn/',             zh: '我來自台灣。',           context: '👋 打招呼 & 自我介紹' },
  { english: 'How are you doing?',               ipa: '/haʊ ɑːr ju ˈduːɪŋ/',             zh: '你最近怎麼樣？',         context: '👋 打招呼 & 自我介紹' },
  { english: 'What do you do for a living?',     ipa: '/wʌt du ju du fɔːr ə ˈlɪvɪŋ/',    zh: '你是做什麼工作的？',     context: '👋 打招呼 & 自我介紹' },

  // 🍜 餐廳 & 點餐
  { english: 'Could I see the menu, please?',    ipa: '/kʊd aɪ siː ðə ˈmenjuː pliːz/',   zh: '可以給我看一下菜單嗎？', context: '🍜 餐廳 & 點餐' },
  { english: "I'll have the steak, medium.",     ipa: '/aɪl hæv ðə steɪk ˈmiːdiəm/',     zh: '我要點牛排，五分熟。',   context: '🍜 餐廳 & 點餐' },
  { english: 'Could I have the bill, please?',   ipa: '/kʊd aɪ hæv ðə bɪl pliːz/',       zh: '可以結帳嗎？',           context: '🍜 餐廳 & 點餐' },
  { english: "I'm allergic to nuts.",            ipa: '/aɪm əˈlɜːrdʒɪk tu nʌts/',        zh: '我對堅果過敏。',         context: '🍜 餐廳 & 點餐' },
  { english: 'Is this spicy?',                   ipa: '/ɪz ðɪs ˈspaɪsi/',                zh: '這個會辣嗎？',           context: '🍜 餐廳 & 點餐' },

  // 🚕 交通 & 移動
  { english: 'How do I get to the station?',     ipa: '/haʊ du aɪ ɡet tu ðə ˈsteɪʃn/',   zh: '請問怎麼去車站？',       context: '🚕 交通 & 移動' },
  { english: 'Take me to this address, please.', ipa: '/teɪk miː tu ðɪs əˈdres pliːz/',  zh: '請載我到這個地址。',     context: '🚕 交通 & 移動' },
  { english: 'How much is the fare?',            ipa: '/haʊ mʌtʃ ɪz ðə feər/',           zh: '車資多少錢？',           context: '🚕 交通 & 移動' },
  { english: 'Which bus goes downtown?',         ipa: '/wɪtʃ bʌs ɡoʊz ˌdaʊnˈtaʊn/',      zh: '哪一班公車到市區？',     context: '🚕 交通 & 移動' },
  { english: 'I missed my train.',               ipa: '/aɪ mɪst maɪ treɪn/',             zh: '我錯過火車了。',         context: '🚕 交通 & 移動' },

  // 🛍️ 購物 & 殺價
  { english: "I'm just looking, thanks.",        ipa: '/aɪm dʒʌst ˈlʊkɪŋ θæŋks/',        zh: '我只是看看，謝謝。',     context: '🛍️ 購物 & 殺價' },
  { english: 'How much is this?',                ipa: '/haʊ mʌtʃ ɪz ðɪs/',               zh: '這個多少錢？',           context: '🛍️ 購物 & 殺價' },
  { english: 'Can you give me a discount?',      ipa: '/kæn ju ɡɪv miː ə ˈdɪskaʊnt/',    zh: '可以算便宜一點嗎？',     context: '🛍️ 購物 & 殺價' },
  { english: 'Do you take credit cards?',        ipa: '/du ju teɪk ˈkredɪt kɑːrdz/',     zh: '可以刷卡嗎？',           context: '🛍️ 購物 & 殺價' },
  { english: 'Can I try this on?',               ipa: '/kæn aɪ traɪ ðɪs ɒn/',            zh: '我可以試穿這件嗎？',     context: '🛍️ 購物 & 殺價' },

  // 🏨 住宿 & 飯店
  { english: 'I have a reservation under ___.',  ipa: '/aɪ hæv ə ˌrezərˈveɪʃn ˈʌndər/',  zh: '我用 ___ 的名字訂了房。',context: '🏨 住宿 & 飯店' },
  { english: 'What time is check-out?',          ipa: '/wʌt taɪm ɪz ˈtʃek aʊt/',         zh: '退房時間是幾點？',       context: '🏨 住宿 & 飯店' },
  { english: 'Is breakfast included?',           ipa: '/ɪz ˈbrekfəst ɪnˈkluːdɪd/',       zh: '有附早餐嗎？',           context: '🏨 住宿 & 飯店' },
  { english: 'The Wi-Fi is not working.',        ipa: '/ðə ˈwaɪˌfaɪ ɪz nɒt ˈwɜːrkɪŋ/',   zh: 'Wi-Fi 不能用。',          context: '🏨 住宿 & 飯店' },

  // 🏥 緊急狀況 & 求助
  { english: 'Can you help me, please?',         ipa: '/kæn ju help miː pliːz/',         zh: '可以請你幫我嗎？',       context: '🏥 緊急狀況 & 求助' },
  { english: "I don't feel well.",               ipa: '/aɪ doʊnt fiːl wel/',             zh: '我覺得不舒服。',         context: '🏥 緊急狀況 & 求助' },
  { english: 'Call an ambulance, please!',       ipa: '/kɔːl ən ˈæmbjələns pliːz/',      zh: '請叫救護車！',           context: '🏥 緊急狀況 & 求助' },
  { english: 'I lost my passport.',              ipa: '/aɪ lɒst maɪ ˈpæspɔːrt/',         zh: '我的護照不見了。',       context: '🏥 緊急狀況 & 求助' },
  { english: 'Where is the nearest pharmacy?',   ipa: '/wer ɪz ðə ˈnɪərɪst ˈfɑːrməsi/',  zh: '最近的藥局在哪裡？',     context: '🏥 緊急狀況 & 求助' },

  // 💬 日常閒聊
  { english: 'How was your weekend?',            ipa: '/haʊ wɒz jɔːr ˈwiːkend/',         zh: '週末過得如何？',         context: '💬 日常閒聊' },
  { english: "What's your favorite movie?",      ipa: '/wʌts jɔːr ˈfeɪvərɪt ˈmuːvi/',    zh: '你最喜歡的電影是什麼？', context: '💬 日常閒聊' },
  { english: "It's been a long day.",            ipa: '/ɪts bɪn ə lɔːŋ deɪ/',            zh: '今天好漫長。',           context: '💬 日常閒聊' },
  { english: 'Tell me more about it.',           ipa: '/tel miː mɔːr əˈbaʊt ɪt/',        zh: '再多跟我說一點。',       context: '💬 日常閒聊' },

  // 🎓 學業 & 工作
  { english: "I'm working on a project.",        ipa: '/aɪm ˈwɜːrkɪŋ ɒn ə ˈprɒdʒekt/',   zh: '我正在做一個專案。',     context: '🎓 學業 & 工作' },
  { english: 'Could you explain that again?',    ipa: '/kʊd ju ɪkˈspleɪn ðæt əˈɡen/',    zh: '可以再解釋一次嗎？',     context: '🎓 學業 & 工作' },
  { english: 'When is the deadline?',            ipa: '/wen ɪz ðə ˈdedlaɪn/',            zh: '截止日期是什麼時候？',   context: '🎓 學業 & 工作' },
  { english: "Let's schedule a meeting.",        ipa: '/lets ˈskedʒuːl ə ˈmiːtɪŋ/',      zh: '我們安排一個會議吧。',   context: '🎓 學業 & 工作' },
  { english: "I'm majoring in English.",         ipa: '/aɪm ˈmeɪdʒərɪŋ ɪn ˈɪŋɡlɪʃ/',     zh: '我主修英文。',           context: '🎓 學業 & 工作' },

  // 💆 休閒娛樂
  { english: "Let's go for a walk.",             ipa: '/lets ɡoʊ fɔːr ə wɔːk/',          zh: '我們去散步吧。',         context: '💆 休閒娛樂' },
  { english: 'I love watching Netflix.',         ipa: '/aɪ lʌv ˈwɒtʃɪŋ ˈnetflɪks/',      zh: '我很愛看 Netflix。',      context: '💆 休閒娛樂' },
  { english: 'Do you want to grab a coffee?',    ipa: '/du ju wɒnt tu ɡræb ə ˈkɒfi/',    zh: '要去喝杯咖啡嗎？',       context: '💆 休閒娛樂' },
  { english: 'I picked up a new hobby.',         ipa: '/aɪ pɪkt ʌp ə njuː ˈhɒbi/',       zh: '我培養了一個新興趣。',   context: '💆 休閒娛樂' },

  // 🔢 數字 & 時間
  { english: "It's a quarter past three.",       ipa: '/ɪts ə ˈkwɔːrtər pæst θriː/',     zh: '現在三點十五分。',       context: '🔢 數字 & 時間' },
  { english: "I'll be there in ten minutes.",    ipa: '/aɪl biː ðer ɪn ten ˈmɪnɪts/',    zh: '我十分鐘後到。',         context: '🔢 數字 & 時間' },
  { english: 'It costs about fifty dollars.',    ipa: '/ɪt kɒsts əˈbaʊt ˈfɪfti ˈdɒlərz/',zh: '大約五十元。',           context: '🔢 數字 & 時間' },
  { english: 'What day is it today?',            ipa: '/wʌt deɪ ɪz ɪt təˈdeɪ/',          zh: '今天是星期幾？',         context: '🔢 數字 & 時間' },
]
