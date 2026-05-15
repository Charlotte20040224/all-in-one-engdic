export type ToneClass = 'mid' | 'high' | 'low'

export interface Consonant {
  letter: string
  sound: string
  mnemonic: string
  mnemonicTh: string
  toneClass: ToneClass
}

export interface Vowel {
  // Display form using × placeholder, e.g. ×า
  display: string
  // Form fed to TTS (uses อ as carrier), e.g. อา
  ttsText: string
  sound: string
  length: 'short' | 'long' | 'special'
}

export interface Tone {
  name: string
  thaiName: string
  description: string
  example: string
  exampleMeaning: string
  exampleSound: string
}

// 9 中音字
const MID_CONSONANTS: Consonant[] = [
  { letter: 'ก', sound: 'g',  mnemonic: '雞',     mnemonicTh: 'ไก่',     toneClass: 'mid' },
  { letter: 'จ', sound: 'j',  mnemonic: '盤子',   mnemonicTh: 'จาน',     toneClass: 'mid' },
  { letter: 'ด', sound: 'd',  mnemonic: '小孩',   mnemonicTh: 'เด็ก',    toneClass: 'mid' },
  { letter: 'ต', sound: 't',  mnemonic: '烏龜',   mnemonicTh: 'เต่า',    toneClass: 'mid' },
  { letter: 'ฎ', sound: 'd',  mnemonic: '頭飾',   mnemonicTh: 'ชฎา',     toneClass: 'mid' },
  { letter: 'ฏ', sound: 't',  mnemonic: '標槍',   mnemonicTh: 'ปฏัก',    toneClass: 'mid' },
  { letter: 'บ', sound: 'b',  mnemonic: '葉子',   mnemonicTh: 'ใบไม้',   toneClass: 'mid' },
  { letter: 'ป', sound: 'p',  mnemonic: '魚',     mnemonicTh: 'ปลา',     toneClass: 'mid' },
  { letter: 'อ', sound: 'อ',  mnemonic: '盆',     mnemonicTh: 'อ่าง',    toneClass: 'mid' },
]

// 11 高音字
const HIGH_CONSONANTS: Consonant[] = [
  { letter: 'ข', sound: 'kh', mnemonic: '蛋',     mnemonicTh: 'ไข่',     toneClass: 'high' },
  { letter: 'ฃ', sound: 'kh', mnemonic: '瓶子',   mnemonicTh: 'ขวด',     toneClass: 'high' },
  { letter: 'ฉ', sound: 'ch', mnemonic: '鈸',     mnemonicTh: 'ฉิ่ง',    toneClass: 'high' },
  { letter: 'ฐ', sound: 'th', mnemonic: '底座',   mnemonicTh: 'ฐาน',     toneClass: 'high' },
  { letter: 'ถ', sound: 'th', mnemonic: '袋子',   mnemonicTh: 'ถุง',     toneClass: 'high' },
  { letter: 'ผ', sound: 'ph', mnemonic: '蜜蜂',   mnemonicTh: 'ผึ้ง',    toneClass: 'high' },
  { letter: 'ฝ', sound: 'f',  mnemonic: '蓋',     mnemonicTh: 'ฝา',      toneClass: 'high' },
  { letter: 'ศ', sound: 's',  mnemonic: '亭子',   mnemonicTh: 'ศาลา',    toneClass: 'high' },
  { letter: 'ษ', sound: 's',  mnemonic: '隱士',   mnemonicTh: 'ฤๅษี',    toneClass: 'high' },
  { letter: 'ส', sound: 's',  mnemonic: '老虎',   mnemonicTh: 'เสือ',    toneClass: 'high' },
  { letter: 'ห', sound: 'h',  mnemonic: '箱子',   mnemonicTh: 'หีบ',     toneClass: 'high' },
]

// 24 低音字
const LOW_CONSONANTS: Consonant[] = [
  { letter: 'ค', sound: 'kh', mnemonic: '水牛',   mnemonicTh: 'ควาย',    toneClass: 'low' },
  { letter: 'ฅ', sound: 'kh', mnemonic: '人',     mnemonicTh: 'คน',      toneClass: 'low' },
  { letter: 'ฆ', sound: 'kh', mnemonic: '鐘',     mnemonicTh: 'ระฆัง',   toneClass: 'low' },
  { letter: 'ง', sound: 'ng', mnemonic: '蛇',     mnemonicTh: 'งู',      toneClass: 'low' },
  { letter: 'ช', sound: 'ch', mnemonic: '象',     mnemonicTh: 'ช้าง',    toneClass: 'low' },
  { letter: 'ซ', sound: 's',  mnemonic: '鏈條',   mnemonicTh: 'โซ่',     toneClass: 'low' },
  { letter: 'ฌ', sound: 'ch', mnemonic: '樹',     mnemonicTh: 'เฌอ',     toneClass: 'low' },
  { letter: 'ญ', sound: 'y',  mnemonic: '女人',   mnemonicTh: 'หญิง',    toneClass: 'low' },
  { letter: 'ฑ', sound: 'th', mnemonic: '曼陀',   mnemonicTh: 'มณโฑ',    toneClass: 'low' },
  { letter: 'ฒ', sound: 'th', mnemonic: '老人',   mnemonicTh: 'ผู้เฒ่า', toneClass: 'low' },
  { letter: 'ณ', sound: 'n',  mnemonic: '沙彌',   mnemonicTh: 'เณร',     toneClass: 'low' },
  { letter: 'ท', sound: 'th', mnemonic: '士兵',   mnemonicTh: 'ทหาร',    toneClass: 'low' },
  { letter: 'ธ', sound: 'th', mnemonic: '旗',     mnemonicTh: 'ธง',      toneClass: 'low' },
  { letter: 'น', sound: 'n',  mnemonic: '老鼠',   mnemonicTh: 'หนู',     toneClass: 'low' },
  { letter: 'พ', sound: 'ph', mnemonic: '托盤',   mnemonicTh: 'พาน',     toneClass: 'low' },
  { letter: 'ฟ', sound: 'f',  mnemonic: '牙齒',   mnemonicTh: 'ฟัน',     toneClass: 'low' },
  { letter: 'ภ', sound: 'ph', mnemonic: '帆船',   mnemonicTh: 'สำเภา',   toneClass: 'low' },
  { letter: 'ม', sound: 'm',  mnemonic: '馬',     mnemonicTh: 'ม้า',     toneClass: 'low' },
  { letter: 'ย', sound: 'y',  mnemonic: '巨人',   mnemonicTh: 'ยักษ์',   toneClass: 'low' },
  { letter: 'ร', sound: 'r',  mnemonic: '船',     mnemonicTh: 'เรือ',    toneClass: 'low' },
  { letter: 'ล', sound: 'l',  mnemonic: '猴子',   mnemonicTh: 'ลิง',     toneClass: 'low' },
  { letter: 'ว', sound: 'w',  mnemonic: '戒指',   mnemonicTh: 'แหวน',    toneClass: 'low' },
  { letter: 'ฬ', sound: 'l',  mnemonic: '風箏',   mnemonicTh: 'จุฬา',    toneClass: 'low' },
  { letter: 'ฮ', sound: 'h',  mnemonic: '貓頭鷹', mnemonicTh: 'นกฮูก',   toneClass: 'low' },
]

export const CONSONANTS = {
  mid: MID_CONSONANTS,
  high: HIGH_CONSONANTS,
  low: LOW_CONSONANTS,
  all: [...MID_CONSONANTS, ...HIGH_CONSONANTS, ...LOW_CONSONANTS],
}

// 32 母音
export const VOWELS: Vowel[] = [
  { display: '-ะ',     ttsText: 'อะ',    sound: 'a',   length: 'short' },
  { display: '-า',     ttsText: 'อา',    sound: 'aa',  length: 'long'  },
  { display: '-ิ',     ttsText: 'อิ',    sound: 'i',   length: 'short' },
  { display: '-ี',     ttsText: 'อี',    sound: 'ii',  length: 'long'  },
  { display: '-ึ',     ttsText: 'อึ',    sound: 'ue',  length: 'short' },
  { display: '-ื',     ttsText: 'อือ',   sound: 'uue', length: 'long'  },
  { display: '-ุ',     ttsText: 'อุ',    sound: 'u',   length: 'short' },
  { display: '-ู',     ttsText: 'อู',    sound: 'uu',  length: 'long'  },
  { display: 'เ-ะ',    ttsText: 'เอะ',   sound: 'e',   length: 'short' },
  { display: 'เ-',     ttsText: 'เอ',    sound: 'ee',  length: 'long'  },
  { display: 'แ-ะ',    ttsText: 'แอะ',   sound: 'ae',  length: 'short' },
  { display: 'แ-',     ttsText: 'แอ',    sound: 'aae', length: 'long'  },
  { display: 'โ-ะ',    ttsText: 'โอะ',   sound: 'o',   length: 'short' },
  { display: 'โ-',     ttsText: 'โอ',    sound: 'oo',  length: 'long'  },
  { display: 'เ-าะ',   ttsText: 'เอาะ',  sound: 'oh',  length: 'short' },
  { display: '-อ',     ttsText: 'ออ',    sound: 'or',  length: 'long'  },
  { display: 'เ-อะ',   ttsText: 'เออะ',  sound: 'oe',  length: 'short' },
  { display: 'เ-อ',    ttsText: 'เออ',   sound: 'oer', length: 'long'  },
  { display: 'เ-ียะ',  ttsText: 'เอียะ', sound: 'ia',  length: 'short' },
  { display: 'เ-ีย',   ttsText: 'เอีย',  sound: 'iia', length: 'long'  },
  { display: 'เ-ือะ',  ttsText: 'เอือะ', sound: 'uea', length: 'short' },
  { display: 'เ-ือ',   ttsText: 'เอือ',  sound: 'uuea',length: 'long'  },
  { display: '-ัวะ',   ttsText: 'อัวะ',  sound: 'ua',  length: 'short' },
  { display: '-ัว',    ttsText: 'อัว',   sound: 'uua', length: 'long'  },
  { display: '-ำ',     ttsText: 'อำ',    sound: 'am',  length: 'special' },
  { display: 'ใ-',     ttsText: 'ใอ',    sound: 'ai',  length: 'special' },
  { display: 'ไ-',     ttsText: 'ไอ',    sound: 'ai',  length: 'special' },
  { display: 'เ-า',    ttsText: 'เอา',   sound: 'ao',  length: 'special' },
  { display: 'ฤ',      ttsText: 'ฤ',     sound: 'rue', length: 'special' },
  { display: 'ฤๅ',     ttsText: 'ฤๅ',    sound: 'ruue',length: 'special' },
  { display: 'ฦ',      ttsText: 'ฦ',     sound: 'lue', length: 'special' },
  { display: 'ฦๅ',     ttsText: 'ฦๅ',    sound: 'luue',length: 'special' },
]

// 5 聲調
export const TONES: Tone[] = [
  {
    name: '中聲',
    thaiName: 'สามัญ',
    description: '平平的聲調，沒有升降，類似中文一聲但更平穩。',
    example: 'กา',
    exampleMeaning: '烏鴉',
    exampleSound: 'gaa',
  },
  {
    name: '低聲',
    thaiName: 'เอก',
    description: '較低且短促的聲調，類似中文輕聲尾音壓低。聲調符號 ◌่。',
    example: 'ไก่',
    exampleMeaning: '雞',
    exampleSound: 'gài',
  },
  {
    name: '降聲',
    thaiName: 'โท',
    description: '由高往下降的聲調，類似中文四聲。聲調符號 ◌้。',
    example: 'ไข้',
    exampleMeaning: '發燒',
    exampleSound: 'khâi',
  },
  {
    name: '高聲',
    thaiName: 'ตรี',
    description: '高且略上揚的聲調，類似緊張地喊叫。聲調符號 ◌๊。',
    example: 'ม้า',
    exampleMeaning: '馬',
    exampleSound: 'máa',
  },
  {
    name: '升聲',
    thaiName: 'จัตวา',
    description: '由低往上升的聲調，類似中文二聲。聲調符號 ◌๋。',
    example: 'ขา',
    exampleMeaning: '腿',
    exampleSound: 'khǎa',
  },
]

export const TONE_CLASS_LABEL: Record<ToneClass, string> = {
  mid: '中音',
  high: '高音',
  low: '低音',
}

export const TONE_CLASS_COLOR: Record<ToneClass, string> = {
  mid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}
