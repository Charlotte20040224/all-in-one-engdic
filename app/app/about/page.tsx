/* eslint-disable @next/next/no-img-element */

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sm:p-8 space-y-6">
        <div className="flex justify-center">
          <img
            src="/charlotte.jpg"
            alt="Charlotte"
            className="w-[120px] h-[120px] rounded-full object-cover"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          關於開發者
        </h1>

        <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            嗨，大家好！我是 Charlotte，也可以叫我 Chacha。
            <br />
            來自台灣，目前就讀於國立臺灣師範大學英語學系，同時也是一名語言學習內容創作者。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">
            【為什麼想開發 All-in-One EngDic？】
          </h2>

          <p>
            學英文的人都遇過這個情境：查一個單字要開三、四個分頁——
            拼音、詞性、中文意思、英文解釋、例句、搭配詞，每個都散在不同網站。
          </p>

          <p>
            我想做的，是一個「一站式」的英文學習工具。
            輸入中文或英文，立刻看到：發音（IPA）、詞性、中文意思、英文解釋、例句、常見搭配詞，
            搭配 SRS 間隔複習系統幫你把單字真正記下來。
          </p>

          <p>
            希望它不只是查單字的工具，而是可以陪你一起學英文、一起變強的小幫手。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">
            【我的社群連結】
          </h2>

          <ul className="space-y-1 not-prose">
            <li>
              <a
                href="https://www.instagram.com/hue_0224"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 min-h-[44px] px-3 py-2 -mx-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition"
              >
                <span className="text-xl shrink-0">📸</span>
                <span className="flex-1">Instagram：@hue_0224</span>
              </a>
            </li>
            <li>
              <a
                href="https://youtube.com/@charlottehsuyololife"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 min-h-[44px] px-3 py-2 -mx-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition"
              >
                <span className="text-xl shrink-0">🎬</span>
                <span className="flex-1">YouTube：Charlotte Hsu</span>
              </a>
            </li>
            <li>
              <div className="flex items-center gap-3 min-h-[44px] px-3 py-2 -mx-3 text-gray-700 dark:text-gray-300">
                <span className="text-xl shrink-0">🎙️</span>
                <span className="flex-1">Podcast：《Cross Talk 雙向》</span>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-3 min-h-[44px] px-3 py-2 -mx-3 text-gray-700 dark:text-gray-300">
                <span className="text-xl shrink-0">🎙️</span>
                <span className="flex-1">Podcast：《升學不NG》</span>
              </div>
            </li>
            <li>
              <a
                href="https://charlottes-corner2.webnode.page"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 min-h-[44px] px-3 py-2 -mx-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition"
              >
                <span className="text-xl shrink-0">🌐</span>
                <span className="flex-1">個人網站：charlottes-corner2.webnode.page</span>
              </a>
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">
            【聯絡方式】
          </h2>

          <p>
            如果你有任何建議、合作邀約，或是想分享使用這個 App 的心得，歡迎聯絡我。
          </p>

          <ul className="space-y-2">
            <li>
              📧 Email：
              <a
                href="mailto:lulu20040224@gmail.com"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                lulu20040224@gmail.com
              </a>
            </li>
            <li>📩 Instagram DM：@hue_0224</li>
          </ul>

          <p className="pt-2">
            謝謝你使用 All-in-One EngDic，希望它能陪你一起把英文學好。📖
          </p>
        </div>
      </div>
    </div>
  )
}
