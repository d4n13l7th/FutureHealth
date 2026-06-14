import { Link } from 'react-router-dom'
import { Calendar, History } from 'lucide-react'

const FALLBACK_VALUE = '-'

/**
 * Formats an ISO date string into Indonesian long-form date
 * (e.g. "14 Juni 2026"). Falls back to "-" if missing or invalid.
 */
function formatDate(createdAt) {
  if (!createdAt) return FALLBACK_VALUE

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return FALLBACK_VALUE

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Builds the subtitle string by combining the formatted date,
 * health score, and category — omitting score/category segments
 * gracefully if they're missing.
 */
function buildSubtitle(latest) {
  const formattedDate = formatDate(latest?.created_at)
  const score = latest?.results?.healthScore
  const category = latest?.results?.category

  if (typeof score !== 'number' || Number.isNaN(score)) {
    return formattedDate
  }

  const categorySuffix = category ? ` (${category})` : ''
  return `${formattedDate} \u00B7 Skor ${score}/100${categorySuffix}`
}

/**
 * LastSimulationCard
 * ----------------------------------------------------------------
 * Final component in the populated DashboardPage state. Summarizes
 * the most recent simulation (date, score, category) and links to
 * the full simulation history.
 *
 * Reads from a simulation history record (`latest`), the shape
 * persisted by services/supabase.js's saveSimulation:
 *   { created_at, results: { healthScore, category, ... }, ... }
 *
 * Defensive: `latest`, `latest.created_at`, and `latest.results`
 * may be missing — the subtitle gracefully degrades to whatever
 * information is available, falling back to "-" for the date.
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function LastSimulationCard({ latest }) {
  const subtitle = buildSubtitle(latest)

  return (
    <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <Calendar size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Simulasi Terakhir</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <Link to="/history" className="btn-secondary px-4 py-2 text-sm">
        <History size={16} />
        Lihat Riwayat
      </Link>
    </div>
  )
}