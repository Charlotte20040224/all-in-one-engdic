export const STRING_MAX = 200
export const JSON_MAX = 50000

export function tooLongString(v: unknown, max = STRING_MAX): boolean {
  return typeof v === 'string' && v.length > max
}

export function tooLongJson(v: unknown, max = JSON_MAX): boolean {
  if (v == null) return false
  try {
    return JSON.stringify(v).length > max
  } catch {
    return true
  }
}

export function findTooLongString(
  fields: Record<string, unknown>,
  max = STRING_MAX
): string | null {
  for (const [k, v] of Object.entries(fields)) {
    if (tooLongString(v, max)) return k
  }
  return null
}

export function findTooLongJson(
  fields: Record<string, unknown>,
  max = JSON_MAX
): string | null {
  for (const [k, v] of Object.entries(fields)) {
    if (tooLongJson(v, max)) return k
  }
  return null
}
