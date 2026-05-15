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
            我是來自台灣的英文學習者，目前就讀於國立臺灣師範大學英語學系，同時也是一名語言學習內容創作者。
          </p>

          <p>
            我很喜歡語言、文化交流，也喜歡把自己的學習過程整理成容易理解的內容，分享給同樣正在學習語言的人。除了英文之外，近年來我最投入的語言就是英文。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">
            【我為什麼開始學英文？】
          </h2>

          <p>我開始對英文產生興趣，其實和很多人生經驗有關。</p>

          <p>
            高中畢業後，我曾經到澳洲打工度假。在那段時間裡，我認識了很多來自不同國家的朋友，其中一位很重要的朋友是泰國人。透過她，我第一次更近距離地接觸到泰國文化，也慢慢發現泰國人說話的方式、生活態度和幽默感都很吸引我。
          </p>

          <p>
            後來，我又因為泰劇、泰國旅行，以及在清邁認識的一群很溫暖的泰國朋友，更加喜歡上英文和泰國文化。對我來說，學英文不只是學一個語言，而是打開了一扇門，讓我可以更靠近泰國人的生活、故事和情感。
          </p>

          <p>
            我一直覺得，會一點英文之後，去泰國旅行的體驗真的會完全不一樣。你不只是「觀光客」，而是能夠和當地人多聊幾句、多笑幾次，也更容易感受到人與人之間的溫度。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">
            【為什麼想開發這個英文字典 App？】
          </h2>

          <p>
            在自學英文的過程中，我發現中文母語者在學英文時，常常會遇到幾個困難：
          </p>

          <p>
            第一，很多英文字典對初學者來說不夠直覺。
            <br />
            第二，英文的拼音、中文意思、英文解釋和例句常常分散在不同網站。
            <br />
            第三，很多時候我們不是只想知道「這個字是什麼意思」，而是想知道它在真實生活中到底怎麼用。
          </p>

          <p>
            所以我開始想：如果有一個工具，可以讓使用者輸入中文、英文或英文，就能查到英文字、拼音、詞性、中文意思、英文解釋、例句、搭配詞，甚至相關用法，那對學英文的人來說應該會很方便。
          </p>

          <p>這就是我開發這個英文字典 App 的原因。</p>

          <p>
            我希望它不只是一個查單字的工具，而是一個可以陪伴大家學英文的小幫手。無論你是剛開始學英文、準備去泰國旅行、想看懂泰劇，或是希望和泰國朋友聊天，我都希望這個工具能讓你的學習過程變得更簡單、更有方向，也更有成就感。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">
            【我的社群連結】
          </h2>

          <p>
            如果你也對英文學習、泰國旅行、語言交換或跨文化生活有興趣，歡迎來我的社群找我！
          </p>

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

          <p>
            我會在社群上分享英文學習資源、泰國旅行經驗、語言學習方法，以及我自己從零開始學英文的過程。
          </p>

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
            謝謝你使用這個英文字典 App。
            <br />
            希望它能陪你一起慢慢靠近英文，也靠近更有趣的泰國世界。🙏
          </p>
        </div>
      </div>
    </div>
  )
}
