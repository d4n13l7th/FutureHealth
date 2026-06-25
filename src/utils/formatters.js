/**
 * formatters.js
 * ----------------------------------------------------------------
 * Shared formatting utilities for FutureHealth. Centralizes date,
 * number, and score formatting so pages don't duplicate logic.
 * ----------------------------------------------------------------
 */

/**
 * Formats an ISO date string into Indonesian long-form date
 * (e.g. "14 Juni 2026"). Falls back to `fallback` if missing/invalid.
 *
 * @param {string|null|undefined} isoString
 * @param {string} [fallback='-']
 * @returns {string}
 */
export function formatDate(isoString, fallback = '-') {
  if (!isoString) return fallback

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formats a health score with its "/100" suffix.
 *
 * @param {number|null|undefined} score
 * @param {string} [fallback='-']
 * @returns {string}
 */
export function formatScore(score, fallback = '-') {
  if (score == null) return fallback
  return `${Math.round(score)}/100`
}

/**
 * Formats a numeric delta with a leading sign.
 *   +5 → "+5"
 *   -3 → "-3"
 *    0 → "0"
 *
 * @param {number} delta
 * @returns {string}
 */
export function formatDelta(delta) {
  if (delta > 0) return `+${delta}`
  return String(delta)
}

/**
 * Formats a relative time string in Indonesian.
 * e.g. "2 hari lalu", "1 jam lalu", "Baru saja"
 *
 * @param {string|null|undefined} isoString
 * @returns {string}
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '-'

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '-'

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMinutes < 1) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 30) return `${diffDays} hari lalu`

  return formatDate(isoString)
}

/**
 * Truncates text to a max length with ellipsis.
 *
 * @param {string} text
 * @param {number} [maxLength=100]
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text ?? ''
  return text.slice(0, maxLength).trimEnd() + '…'
}
