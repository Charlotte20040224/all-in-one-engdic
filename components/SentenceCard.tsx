'use client'

import { SentenceEntry, VocabItem } from '@/lib/types'
import { sentenceLevel, sentenceLevelLabel, sentenceLevelColor } from '@/lib/sentenceSrs'
import { SpeakButton } from './SpeakButton'
import { FavoriteButton } from './FavoriteButton'
import { ClickableThai } from './ClickableThai'
import { isFavorited } from '@/lib/favorites'

interface Props {
  sentence: SentenceEntry
  onDelete?: (id: string) => void
  compact?: boolean
}

export function SentenceCard({ sentence, onDelete, compact }: Props) {
  const vocabulary = (sentence.vocabulary as any[]) ?? []
  const level = sentenceLevel(sentence.repetitions, sentence.interval)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <SpeakButton text={sentence.thai} size="md" />
            <FavoriteButton
              kind="sentence"
              size="md"
              entry={{
                thai: sentence.thai,
                romanization: sentence.pinyin,
                chinese: sentence.zh,
                source: '句子庫',
              }}
            />
            <span data-thai className="text-xl font-bold text-gray-900 dark:text-white break-words">
              {sentence.thai}
            </span>
          </div>
          <div data-pinyin className="text-sm text-purple-600 dark:text-purple-400 mt-1">{sentence.pinyin}</div>
          <div className="text-gray-700 dark:text-gray-300 mt-1">{sentence.zh}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isFavorited(sentence.thai) && (
            <span title="已收藏" className="text-base">❤️</span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${sentenceLevelColor(level)}`}>
            {sentenceLevelLabel(level)}
          </span>
        </div>
      </div>

      {!compact && (
        <>
          {/* Grammar */}
          {sentence.grammar && (
            <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
              <div className="text-xs font-semibold mb-1">📐 句型解析</div>
              <div className="whitespace-pre-wrap">{sentence.grammar}</div>
            </div>
          )}

          {/* Vocabulary */}
          {vocabulary.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">句中單字</h4>
              <div className="bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded divide-y divide-amber-200 dark:divide-amber-800">
                {vocabulary.map((v: VocabItem, i: number) => (
                  <div key={i} className="py-1 first:pt-0 last:pb-0 flex items-start gap-1.5">
                    <SpeakButton text={v.thai} size="sm" className="mt-0.5 shrink-0" />
                    <div>
                      <ClickableThai text={v.thai} className="text-sm font-medium text-gray-800 dark:text-gray-200" />
                      <div data-pinyin className="text-xs text-orange-500 dark:text-orange-400">{v.pinyin}</div>
                      <div className="text-xs text-amber-700 dark:text-amber-300">{v.meaning}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External links */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`https://youglish.com/pronounce/${encodeURIComponent(sentence.thai)}/thai`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              🎬 在 YouGlish 聽真實發音
            </a>
            {sentence.grammarPattern && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent('สอน ' + sentence.grammarPattern + ' ภาษาไทย')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                ▶ YouTube 句型教學
              </a>
            )}
          </div>
        </>
      )}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(sentence.id)}
          className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 transition"
        >
          刪除
        </button>
      )}
    </div>
  )
}
