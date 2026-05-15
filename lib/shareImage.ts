// Canvas-based 1080×1920 IG Story image generator.
//
// Two layouts: grammar pattern share, single-word share. Both use the same
// header (top bar + 📖 strap), padding, footer (@hue_0224 · domain).
//
// Fonts: system sans-serif for English/Latin, Noto Serif TC for Chinese —
// the Chinese font is pulled from the Google Fonts import in app/globals.css.
// We trigger explicit loads via document.fonts.load() before drawing so the
// canvas doesn't fall back.

const W = 1080
const H = 1920
const PAD = 80
const CONTENT_W = W - PAD * 2
const FOOTER_TEXT = '@hue_0224 · all-in-one-engdic.vercel.app'

const TH = 'system-ui, -apple-system, "Segoe UI", "Noto Serif TC", sans-serif'
const ZH = '"Noto Serif TC", system-ui, serif'

async function ensureFonts(): Promise<void> {
  if (typeof document === 'undefined' || !(document as any).fonts) return
  const loads = [
    `700 140px ${TH}`,
    `600 60px ${TH}`,
    `400 40px ${TH}`,
    `700 80px ${ZH}`,
    `400 38px ${ZH}`,
    `500 32px ${ZH}`,
  ]
  try {
    await Promise.all(loads.map(f => (document as any).fonts.load(f)))
  } catch {
    /* fall through and use whatever's available */
  }
}

interface DrawCtx {
  ctx: CanvasRenderingContext2D
  cursor: number  // current y position
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of [...text]) {
    if (ch === '\n') {
      lines.push(line)
      line = ''
      continue
    }
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawLines(d: DrawCtx, lines: string[], lineHeight: number, x = PAD) {
  for (const line of lines) {
    d.ctx.fillText(line, x, d.cursor)
    d.cursor += lineHeight
  }
}

function drawHeader(d: DrawCtx, label: string) {
  // 6px top bar
  d.ctx.fillStyle = '#000'
  d.ctx.fillRect(0, 0, W, 6)
  // strap
  d.ctx.fillStyle = '#6b7280'
  d.ctx.font = `500 36px ${ZH}`
  d.ctx.textBaseline = 'alphabetic'
  d.cursor = 130
  d.ctx.fillText(`📖  ${label}`, PAD, d.cursor)
  d.cursor += 30
  // separator
  d.ctx.fillStyle = '#e5e7eb'
  d.ctx.fillRect(PAD, d.cursor, CONTENT_W, 2)
  d.cursor += 60
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#9ca3af'
  ctx.font = `400 28px ${ZH}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(FOOTER_TEXT, PAD, H - 70)
  // bottom subtle bar
  ctx.fillStyle = '#000'
  ctx.fillRect(0, H - 6, W, 6)
}

function makeCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  ctx.textBaseline = 'alphabetic'
  return { canvas, ctx }
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

// ──────────────────────────────────────────────────────────────────────────────
// Pattern share
// ──────────────────────────────────────────────────────────────────────────────

export interface PatternShareInput {
  keyword: string
  keywordIpa: string
  patternZh: string
  pattern: string
  explanationZh: string
  examples: { english: string; ipa: string; chinese: string }[]
  id: number
  nameZh: string
}

export async function sharePatternImage(p: PatternShareInput): Promise<void> {
  await ensureFonts()
  const { canvas, ctx } = makeCanvas()
  const d: DrawCtx = { ctx, cursor: 0 }

  drawHeader(d, '每日英文句型')

  // Pattern name (small)
  ctx.fillStyle = '#374151'
  ctx.font = `500 36px ${ZH}`
  ctx.fillText(`#${p.id} · ${p.nameZh}`, PAD, d.cursor)
  d.cursor += 80

  // Keyword Thai
  ctx.fillStyle = '#111827'
  ctx.font = `700 140px ${TH}`
  const keywordLines = wrapLines(ctx, p.keyword, CONTENT_W)
  drawLines(d, keywordLines, 160)
  d.cursor += 10

  // Keyword ipa
  ctx.fillStyle = '#7c3aed'
  ctx.font = `600 56px ${TH}`
  ctx.fillText(p.keywordIpa, PAD, d.cursor)
  d.cursor += 90

  // Pattern formula card
  ctx.fillStyle = '#eff6ff'
  ctx.fillRect(PAD, d.cursor, CONTENT_W, 200)
  ctx.fillStyle = '#1d4ed8'
  ctx.font = `500 30px ${ZH}`
  ctx.fillText('📐 句型結構', PAD + 30, d.cursor + 50)
  ctx.fillStyle = '#111827'
  ctx.font = `600 48px ${TH}`
  ctx.fillText(p.pattern, PAD + 30, d.cursor + 110)
  ctx.fillStyle = '#4b5563'
  ctx.font = `400 30px ${ZH}`
  ctx.fillText(p.patternZh, PAD + 30, d.cursor + 165)
  d.cursor += 240

  // Explanation
  ctx.fillStyle = '#1f2937'
  ctx.font = `400 38px ${ZH}`
  const explLines = wrapLines(ctx, p.explanationZh, CONTENT_W).slice(0, 3)
  drawLines(d, explLines, 56)
  d.cursor += 30

  // Examples
  ctx.fillStyle = '#6b7280'
  ctx.font = `500 30px ${ZH}`
  ctx.fillText('例句', PAD, d.cursor)
  d.cursor += 50

  const examples = p.examples.slice(0, 3)
  for (const ex of examples) {
    // english
    ctx.fillStyle = '#111827'
    ctx.font = `500 44px ${TH}`
    const thaiLines = wrapLines(ctx, ex.english, CONTENT_W).slice(0, 2)
    drawLines(d, thaiLines, 56)
    // ipa
    ctx.fillStyle = '#7c3aed'
    ctx.font = `400 30px ${TH}`
    ctx.fillText(ex.ipa, PAD, d.cursor)
    d.cursor += 42
    // chinese
    ctx.fillStyle = '#374151'
    ctx.font = `400 32px ${ZH}`
    ctx.fillText(ex.chinese, PAD, d.cursor)
    d.cursor += 60
  }

  drawFooter(ctx)

  const safe = p.keyword.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 20) || 'pattern'
  downloadCanvas(canvas, `daily-pattern-${p.id}-${safe}.png`)
}

// ──────────────────────────────────────────────────────────────────────────────
// Word share
// ──────────────────────────────────────────────────────────────────────────────

export interface WordShareInput {
  english: string
  ipa: string
  pos?: string
  meaning: string
  example?: { english: string; ipa: string; zh: string }
}

export async function shareWordImage(w: WordShareInput): Promise<void> {
  await ensureFonts()
  const { canvas, ctx } = makeCanvas()
  const d: DrawCtx = { ctx, cursor: 0 }

  drawHeader(d, '每日英文單字')

  d.cursor += 100

  // Thai (huge)
  ctx.fillStyle = '#111827'
  ctx.font = `700 180px ${TH}`
  const thaiLines = wrapLines(ctx, w.english, CONTENT_W).slice(0, 2)
  drawLines(d, thaiLines, 200)
  d.cursor += 20

  // IPA
  ctx.fillStyle = '#7c3aed'
  ctx.font = `600 64px ${TH}`
  ctx.fillText(w.ipa, PAD, d.cursor)
  d.cursor += 100

  // POS chip
  if (w.pos) {
    ctx.font = `500 30px ${ZH}`
    const posPad = 24
    const tw = ctx.measureText(w.pos).width
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(PAD, d.cursor - 38, tw + posPad * 2, 56)
    ctx.fillStyle = '#374151'
    ctx.fillText(w.pos, PAD + posPad, d.cursor)
    d.cursor += 80
  }

  // Meaning
  ctx.fillStyle = '#1f2937'
  ctx.font = `500 56px ${ZH}`
  const meaningLines = wrapLines(ctx, w.meaning, CONTENT_W).slice(0, 3)
  drawLines(d, meaningLines, 76)
  d.cursor += 60

  // One example
  if (w.example) {
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(PAD, d.cursor, CONTENT_W, 2)
    d.cursor += 60
    ctx.fillStyle = '#6b7280'
    ctx.font = `500 30px ${ZH}`
    ctx.fillText('例句', PAD, d.cursor)
    d.cursor += 60

    ctx.fillStyle = '#111827'
    ctx.font = `500 50px ${TH}`
    const exThai = wrapLines(ctx, w.example.english, CONTENT_W).slice(0, 3)
    drawLines(d, exThai, 64)

    ctx.fillStyle = '#7c3aed'
    ctx.font = `400 32px ${TH}`
    ctx.fillText(w.example.ipa, PAD, d.cursor)
    d.cursor += 50

    ctx.fillStyle = '#374151'
    ctx.font = `400 36px ${ZH}`
    const exZh = wrapLines(ctx, w.example.zh, CONTENT_W).slice(0, 2)
    drawLines(d, exZh, 50)
  }

  drawFooter(ctx)

  const safe = w.english.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 20) || 'word'
  downloadCanvas(canvas, `daily-word-${safe}.png`)
}
