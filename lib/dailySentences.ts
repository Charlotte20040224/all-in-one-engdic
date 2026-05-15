// Note: field `thai` historically named from the original Thai-vocab app;
// it now stores the English sentence. `pinyin` stores simplified IPA.
// DB schema field names are preserved to avoid migration.
export interface DailySentence {
  thai: string      // English sentence
  pinyin: string    // Pronunciation / IPA
  zh: string        // Chinese translation
  context: string   // Theme key (must match THEMES in app/app/page.tsx)
}

export const DAILY_SENTENCES: DailySentence[] = [
  // 👋 打招呼 & 自我介紹
  { thai: 'Hi, nice to meet you.',            pinyin: '/haɪ naɪs tu ˈmiːt ju/',          zh: '嗨，很高興認識你。',     context: '👋 打招呼 & 自我介紹' },
  { thai: 'My name is ___.',                  pinyin: '/maɪ neɪm ɪz/',                   zh: '我叫 ___。',              context: '👋 打招呼 & 自我介紹' },
  { thai: "I'm from Taiwan.",                 pinyin: '/aɪm frʌm taɪˈwɑːn/',             zh: '我來自台灣。',           context: '👋 打招呼 & 自我介紹' },
  { thai: 'How are you doing?',               pinyin: '/haʊ ɑːr ju ˈduːɪŋ/',             zh: '你最近怎麼樣？',         context: '👋 打招呼 & 自我介紹' },
  { thai: 'What do you do for a living?',     pinyin: '/wʌt du ju du fɔːr ə ˈlɪvɪŋ/',    zh: '你是做什麼工作的？',     context: '👋 打招呼 & 自我介紹' },

  // 🍜 餐廳 & 點餐
  { thai: 'Could I see the menu, please?',    pinyin: '/kʊd aɪ siː ðə ˈmenjuː pliːz/',   zh: '可以給我看一下菜單嗎？', context: '🍜 餐廳 & 點餐' },
  { thai: "I'll have the steak, medium.",     pinyin: '/aɪl hæv ðə steɪk ˈmiːdiəm/',     zh: '我要點牛排，五分熟。',   context: '🍜 餐廳 & 點餐' },
  { thai: 'Could I have the bill, please?',   pinyin: '/kʊd aɪ hæv ðə bɪl pliːz/',       zh: '可以結帳嗎？',           context: '🍜 餐廳 & 點餐' },
  { thai: "I'm allergic to nuts.",            pinyin: '/aɪm əˈlɜːrdʒɪk tu nʌts/',        zh: '我對堅果過敏。',         context: '🍜 餐廳 & 點餐' },
  { thai: 'Is this spicy?',                   pinyin: '/ɪz ðɪs ˈspaɪsi/',                zh: '這個會辣嗎？',           context: '🍜 餐廳 & 點餐' },

  // 🚕 交通 & 移動
  { thai: 'How do I get to the station?',     pinyin: '/haʊ du aɪ ɡet tu ðə ˈsteɪʃn/',   zh: '請問怎麼去車站？',       context: '🚕 交通 & 移動' },
  { thai: 'Take me to this address, please.', pinyin: '/teɪk miː tu ðɪs əˈdres pliːz/',  zh: '請載我到這個地址。',     context: '🚕 交通 & 移動' },
  { thai: 'How much is the fare?',            pinyin: '/haʊ mʌtʃ ɪz ðə feər/',           zh: '車資多少錢？',           context: '🚕 交通 & 移動' },
  { thai: 'Which bus goes downtown?',         pinyin: '/wɪtʃ bʌs ɡoʊz ˌdaʊnˈtaʊn/',      zh: '哪一班公車到市區？',     context: '🚕 交通 & 移動' },
  { thai: 'I missed my train.',               pinyin: '/aɪ mɪst maɪ treɪn/',             zh: '我錯過火車了。',         context: '🚕 交通 & 移動' },

  // 🛍️ 購物 & 殺價
  { thai: "I'm just looking, thanks.",        pinyin: '/aɪm dʒʌst ˈlʊkɪŋ θæŋks/',        zh: '我只是看看，謝謝。',     context: '🛍️ 購物 & 殺價' },
  { thai: 'How much is this?',                pinyin: '/haʊ mʌtʃ ɪz ðɪs/',               zh: '這個多少錢？',           context: '🛍️ 購物 & 殺價' },
  { thai: 'Can you give me a discount?',      pinyin: '/kæn ju ɡɪv miː ə ˈdɪskaʊnt/',    zh: '可以算便宜一點嗎？',     context: '🛍️ 購物 & 殺價' },
  { thai: 'Do you take credit cards?',        pinyin: '/du ju teɪk ˈkredɪt kɑːrdz/',     zh: '可以刷卡嗎？',           context: '🛍️ 購物 & 殺價' },
  { thai: 'Can I try this on?',               pinyin: '/kæn aɪ traɪ ðɪs ɒn/',            zh: '我可以試穿這件嗎？',     context: '🛍️ 購物 & 殺價' },

  // 🏨 住宿 & 飯店
  { thai: 'I have a reservation under ___.',  pinyin: '/aɪ hæv ə ˌrezərˈveɪʃn ˈʌndər/',  zh: '我用 ___ 的名字訂了房。',context: '🏨 住宿 & 飯店' },
  { thai: 'What time is check-out?',          pinyin: '/wʌt taɪm ɪz ˈtʃek aʊt/',         zh: '退房時間是幾點？',       context: '🏨 住宿 & 飯店' },
  { thai: 'Is breakfast included?',           pinyin: '/ɪz ˈbrekfəst ɪnˈkluːdɪd/',       zh: '有附早餐嗎？',           context: '🏨 住宿 & 飯店' },
  { thai: 'The Wi-Fi is not working.',        pinyin: '/ðə ˈwaɪˌfaɪ ɪz nɒt ˈwɜːrkɪŋ/',   zh: 'Wi-Fi 不能用。',          context: '🏨 住宿 & 飯店' },

  // 🏥 緊急狀況 & 求助
  { thai: 'Can you help me, please?',         pinyin: '/kæn ju help miː pliːz/',         zh: '可以請你幫我嗎？',       context: '🏥 緊急狀況 & 求助' },
  { thai: "I don't feel well.",               pinyin: '/aɪ doʊnt fiːl wel/',             zh: '我覺得不舒服。',         context: '🏥 緊急狀況 & 求助' },
  { thai: 'Call an ambulance, please!',       pinyin: '/kɔːl ən ˈæmbjələns pliːz/',      zh: '請叫救護車！',           context: '🏥 緊急狀況 & 求助' },
  { thai: 'I lost my passport.',              pinyin: '/aɪ lɒst maɪ ˈpæspɔːrt/',         zh: '我的護照不見了。',       context: '🏥 緊急狀況 & 求助' },
  { thai: 'Where is the nearest pharmacy?',   pinyin: '/wer ɪz ðə ˈnɪərɪst ˈfɑːrməsi/',  zh: '最近的藥局在哪裡？',     context: '🏥 緊急狀況 & 求助' },

  // 💬 日常閒聊
  { thai: 'How was your weekend?',            pinyin: '/haʊ wɒz jɔːr ˈwiːkend/',         zh: '週末過得如何？',         context: '💬 日常閒聊' },
  { thai: "What's your favorite movie?",      pinyin: '/wʌts jɔːr ˈfeɪvərɪt ˈmuːvi/',    zh: '你最喜歡的電影是什麼？', context: '💬 日常閒聊' },
  { thai: "It's been a long day.",            pinyin: '/ɪts bɪn ə lɔːŋ deɪ/',            zh: '今天好漫長。',           context: '💬 日常閒聊' },
  { thai: 'Tell me more about it.',           pinyin: '/tel miː mɔːr əˈbaʊt ɪt/',        zh: '再多跟我說一點。',       context: '💬 日常閒聊' },

  // 🎓 學業 & 工作
  { thai: "I'm working on a project.",        pinyin: '/aɪm ˈwɜːrkɪŋ ɒn ə ˈprɒdʒekt/',   zh: '我正在做一個專案。',     context: '🎓 學業 & 工作' },
  { thai: 'Could you explain that again?',    pinyin: '/kʊd ju ɪkˈspleɪn ðæt əˈɡen/',    zh: '可以再解釋一次嗎？',     context: '🎓 學業 & 工作' },
  { thai: 'When is the deadline?',            pinyin: '/wen ɪz ðə ˈdedlaɪn/',            zh: '截止日期是什麼時候？',   context: '🎓 學業 & 工作' },
  { thai: "Let's schedule a meeting.",        pinyin: '/lets ˈskedʒuːl ə ˈmiːtɪŋ/',      zh: '我們安排一個會議吧。',   context: '🎓 學業 & 工作' },
  { thai: "I'm majoring in English.",         pinyin: '/aɪm ˈmeɪdʒərɪŋ ɪn ˈɪŋɡlɪʃ/',     zh: '我主修英文。',           context: '🎓 學業 & 工作' },

  // 💆 休閒娛樂
  { thai: "Let's go for a walk.",             pinyin: '/lets ɡoʊ fɔːr ə wɔːk/',          zh: '我們去散步吧。',         context: '💆 休閒娛樂' },
  { thai: 'I love watching Netflix.',         pinyin: '/aɪ lʌv ˈwɒtʃɪŋ ˈnetflɪks/',      zh: '我很愛看 Netflix。',      context: '💆 休閒娛樂' },
  { thai: 'Do you want to grab a coffee?',    pinyin: '/du ju wɒnt tu ɡræb ə ˈkɒfi/',    zh: '要去喝杯咖啡嗎？',       context: '💆 休閒娛樂' },
  { thai: 'I picked up a new hobby.',         pinyin: '/aɪ pɪkt ʌp ə njuː ˈhɒbi/',       zh: '我培養了一個新興趣。',   context: '💆 休閒娛樂' },

  // 🔢 數字 & 時間
  { thai: "It's a quarter past three.",       pinyin: '/ɪts ə ˈkwɔːrtər pæst θriː/',     zh: '現在三點十五分。',       context: '🔢 數字 & 時間' },
  { thai: "I'll be there in ten minutes.",    pinyin: '/aɪl biː ðer ɪn ten ˈmɪnɪts/',    zh: '我十分鐘後到。',         context: '🔢 數字 & 時間' },
  { thai: 'It costs about fifty dollars.',    pinyin: '/ɪt kɒsts əˈbaʊt ˈfɪfti ˈdɒlərz/',zh: '大約五十元。',           context: '🔢 數字 & 時間' },
  { thai: 'What day is it today?',            pinyin: '/wʌt deɪ ɪz ɪt təˈdeɪ/',          zh: '今天是星期幾？',         context: '🔢 數字 & 時間' },
]
