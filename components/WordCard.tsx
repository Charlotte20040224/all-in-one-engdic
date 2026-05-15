'use client'

import { useEffect, useState } from 'react'
import { WordEntry, WordRef, Variant, VocabItem, getPinyinDisplay } from '@/lib/types'
import { srsLabel, srsColor } from '@/lib/srs'
import { SpeakButton } from './SpeakButton'
import { FavoriteButton } from './FavoriteButton'
import { isFavoritedWord } from '@/lib/favorites'

interface Props {
  word: WordEntry
  onDelete?: (id: string) => void
  compact?: boolean
}

// Parse note text: English（IPA / annotation） patterns get styled separately
function renderNote(note: string): React.ReactNode {
  const parts = note.split(/([A-Za-z][A-Za-z'’\- ]*（[^）]+）)/)
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^([A-Za-z][A-Za-z'’\- ]*)（([^）]+)）$/)
        if (m) {
          return (
            <span key={i}>
              <span data-thai className="font-medium text-gray-800 dark:text-gray-200">{m[1]}</span>
              <span className="text-orange-500 dark:text-orange-400 text-xs">（{m[2]}）</span>
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function WordRefRow({ item }: { item: WordRef }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <SpeakButton text={item.thai} className="mt-0.5 shrink-0" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0 flex-1">
        <span data-thai className="font-medium text-gray-800 dark:text-gray-200 break-words">{item.thai}</span>
        <span data-pinyin className="text-gray-500 dark:text-gray-400 break-words">{item.pinyin}</span>
        <span className="text-gray-600 dark:text-gray-300 break-words">
          <span className="hidden sm:inline">— </span>{item.zh}
        </span>
      </div>
    </div>
  )
}

function CollapsibleSection({
  storageKey,
  title,
  children,
}: {
  storageKey: string
  title: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const v = localStorage.getItem(`collapse:${storageKey}`)
    if (v === '0') setOpen(false)
  }, [storageKey])

  const toggle = () => {
    setOpen(prev => {
      const next = !prev
      localStorage.setItem(`collapse:${storageKey}`, next ? '1' : '0')
      return next
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 hover:text-gray-700 dark:hover:text-gray-200 transition"
      >
        <span>{title}</span>
        <span className="text-[10px] ml-2">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

const frequencyBadge: Record<string, string> = {
  '最常用': 'bg-green-100 text-green-700 dark:bg-green-500/25 dark:text-green-100',
  '常用':   'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-100',
  '較少用': 'bg-gray-100 text-gray-600 dark:bg-gray-500/30 dark:text-gray-100',
}

function ExampleRow({ ex }: { ex: any }) {
  const [vocabOpen, setVocabOpen] = useState(false)
  const vocab = (ex.vocabulary as VocabItem[] | undefined) ?? []

  return (
    <div className="border-l-2 border-purple-300 dark:border-purple-700 pl-3">
      <div className="flex items-center gap-2">
        <SpeakButton text={ex.thai} />
        <span data-thai className="text-gray-800 dark:text-gray-200">{ex.thai}</span>
      </div>
      <div data-pinyin className="text-sm text-purple-600 dark:text-purple-400">{ex.pinyin}</div>
      <div className="text-sm text-gray-600 dark:text-gray-300">{ex.zh}</div>
      {vocab.length > 0 && (
        <div className="mt-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded">
          <button
            type="button"
            onClick={() => setVocabOpen(o => !o)}
            aria-expanded={vocabOpen}
            className="w-full flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition"
          >
            <span>📝 單字</span>
            <span className="text-[10px]">{vocabOpen ? '▲' : '▼'}</span>
          </button>
          {vocabOpen && (
            <div className="mt-1 divide-y divide-amber-200 dark:divide-amber-800">
              {vocab.map((v, vi) => (
                <div key={vi} className="py-1 first:pt-0 last:pb-0 flex items-baseline gap-3 text-xs">
                  <span data-thai className="font-medium text-gray-800 dark:text-gray-200">{v.thai}</span>
                  <span data-pinyin className="text-orange-500 dark:text-orange-400">{v.pinyin}</span>
                  <span className="text-amber-700 dark:text-amber-300">{v.meaning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {ex.grammar && (
        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
          📐 <span className="font-semibold">句型</span>　{ex.grammar}
        </div>
      )}
    </div>
  )
}

export function WordCard({ word, onDelete, compact }: Props) {
  const examples = (word.examples as any[]) ?? []
  const collocations = (word.collocations as any[]) ?? []
  const synonyms = (word.synonyms as any[]) ?? []
  const antonyms = (word.antonyms as any[]) ?? []
  const related  = ((word as any).related as any[]) ?? []
  const variants = ((word.variants as any[]) ?? []).filter((v: any) => v?.thai)

  const [note, setNote] = useState(word.note ?? '')
  const [editingNote, setEditingNote] = useState(false)
  const [draft, setDraft] = useState(word.note ?? '')
  const [savingNote, setSavingNote] = useState(false)
  const [noteSavedToast, setNoteSavedToast] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const showDetails = !compact && expanded

  useEffect(() => {
    setNote(word.note ?? '')
    setDraft(word.note ?? '')
  }, [word.note])

  const startEditNote = () => {
    setDraft(note)
    setEditingNote(true)
  }

  const cancelEditNote = () => {
    setDraft(note)
    setEditingNote(false)
  }

  const saveNote = async () => {
    setSavingNote(true)
    try {
      const trimmed = draft.trim()
      const res = await fetch(`/api/words/${word.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: trimmed || null }),
      })
      if (!res.ok) throw new Error()
      setNote(trimmed)
      setEditingNote(false)
      setNoteSavedToast(true)
      setTimeout(() => setNoteSavedToast(false), 2000)
    } catch {
      // leave the user in edit mode so they can retry
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-4">
      {/* Header — click to toggle expand/collapse */}
      <div
        role={compact ? undefined : 'button'}
        tabIndex={compact ? undefined : 0}
        onClick={() => !compact && setExpanded(v => !v)}
        onKeyDown={e => {
          if (compact) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded(v => !v)
          }
        }}
        aria-expanded={compact ? undefined : showDetails}
        className={`flex items-start justify-between gap-2 ${compact ? '' : 'cursor-pointer select-none'}`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span data-thai className="text-2xl font-bold text-gray-900 dark:text-white">{word.thai}</span>
            <SpeakButton text={word.thai} size="md" />
            <FavoriteButton
              kind="word"
              size="md"
              entry={{
                thai: word.thai,
                romanization: word.pinyin ?? undefined,
                chinese: word.meaning ?? undefined,
              }}
            />
          </div>
          <div data-pinyin className="text-sm text-purple-600 dark:text-purple-400 flex flex-wrap items-center gap-x-4 gap-y-1">
            {getPinyinDisplay(word).map((p, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {p.label && <span>{p.label}</span>}
                <span>{p.ipa}</span>
              </span>
            ))}
          </div>
          {word.meaning && (
            <p className="text-gray-700 dark:text-gray-300 font-medium mt-1">{word.meaning}</p>
          )}
          {word.pos && (
            <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
              {word.pos}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isFavoritedWord(word.thai) && (
            <span title="已收藏" className="text-base">❤️</span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${srsColor(word.srsLevel)}`}>
            {srsLabel(word.srsLevel)}
          </span>
          {!compact && (
            <span
              aria-hidden
              className={`text-xs text-gray-400 dark:text-gray-500 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          )}
        </div>
      </div>

      {!compact && (
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${showDetails ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 pt-1">
          {/* Examples */}
          {examples.length > 0 && (
            <CollapsibleSection storageKey="examples" title="例句">
              <div className="space-y-3">
                {examples.map((ex, i) => (
                  <ExampleRow key={i} ex={ex} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Collocations */}
          {collocations.filter(c => c.thai).length > 0 && (
            <CollapsibleSection storageKey="collocations" title="搭配詞">
              <div className="space-y-2">
                {collocations.filter(c => c.thai).map((c, i) => <WordRefRow key={i} item={c} />)}
              </div>
            </CollapsibleSection>
          )}

          {/* Synonyms */}
          {synonyms.filter(s => s.thai).length > 0 && (
            <CollapsibleSection storageKey="synonyms" title="近義詞">
              <div className="space-y-2">
                {synonyms.filter(s => s.thai).map((s, i) => <WordRefRow key={i} item={s} />)}
              </div>
            </CollapsibleSection>
          )}

          {/* Antonyms */}
          {antonyms.filter(a => a.thai).length > 0 && (
            <CollapsibleSection storageKey="antonyms" title="反義詞">
              <div className="space-y-2">
                {antonyms.filter(a => a.thai).map((a, i) => <WordRefRow key={i} item={a} />)}
              </div>
            </CollapsibleSection>
          )}

          {/* Related (same-family) */}
          {related.filter(r => r?.thai).length > 0 && (
            <CollapsibleSection storageKey="related" title="同家族詞">
              <div className="space-y-2">
                {related.filter(r => r?.thai).map((r, i) => <WordRefRow key={i} item={r} />)}
              </div>
            </CollapsibleSection>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <CollapsibleSection storageKey="variants" title="📚 多種表達方式">
              <div className="space-y-2">
                {variants.map((v: Variant, i: number) => (
                  <div key={i} className="flex flex-col gap-0.5 border-l-2 border-indigo-300 dark:border-indigo-700 pl-3">
                    <div className="flex items-center gap-2">
                      <SpeakButton text={v.thai} />
                      <span data-thai className="text-lg font-bold text-gray-900 dark:text-white">{v.thai}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${frequencyBadge[v.frequency] ?? frequencyBadge['較少用']}`}>{v.frequency}</span>
                    </div>
                    <div data-pinyin className="text-sm text-orange-500 dark:text-orange-400">{v.pinyin}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{v.meaning}</div>
                    {v.context && <div className="text-xs text-gray-400 dark:text-gray-500">{v.context}</div>}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* External links */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`https://youglish.com/pronounce/${encodeURIComponent(word.thai)}/english`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              🎬 在 YouGlish 聽真實發音
            </a>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent('English vocabulary ' + word.thai + ' meaning')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              ▶ YouTube 教學
            </a>
          </div>

          {/* Note (user editable) */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <CollapsibleSection storageKey="note" title="📝 補充說明">
            {editingNote ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3 space-y-2">
                <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">📝 備註</div>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  rows={3}
                  placeholder="例如：這個詞也是一道泰式料理"
                  className="w-full text-sm bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded px-2 py-1.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveNote}
                    disabled={savingNote}
                    className="text-xs px-3 py-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white rounded font-medium transition"
                  >
                    {savingNote ? '儲存中…' : '儲存'}
                  </button>
                  <button
                    onClick={cancelEditNote}
                    disabled={savingNote}
                    className="text-xs px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : note ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm text-gray-700 dark:text-gray-200 flex-1">
                    💡 {renderNote(note)}
                  </div>
                  <button
                    onClick={startEditNote}
                    className="shrink-0 text-xs text-yellow-700 dark:text-yellow-300 hover:underline"
                  >
                    ✏️ 編輯
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startEditNote}
                className="text-xs text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 transition"
              >
                📝 新增備註
              </button>
            )}
            </CollapsibleSection>
          </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(word.id)}
          className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 transition"
        >
          刪除
        </button>
      )}

      {noteSavedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium pointer-events-none">
          ✅ 已儲存
        </div>
      )}
    </div>
  )
}
