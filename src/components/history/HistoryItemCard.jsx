import { Link } from 'react-router-dom'
import { Calendar, Target, HeartPulse, ArrowRight } from 'lucide-react'

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
 * HistoryItemCard
 * ----------------------------------------------------------------
 * Individual record card for the /history list. Summarizes one
 * past simulation (date, target, health score) and links to its
 * full detail view at /history/:id (ResultsPage in read-only mode).
 *
 * Reads from a simulation history record (`simulation`), the shape
 * persisted by services/supabase.js's saveSimulation:
 *   { id, created_at, target, inputs: { target, ... },
 *     results: { healthScore, ... } }
 *
 * Defensive: missing `id`, `created_at`, `target`, or `results`
 * all fall back gracefully ("-" for display values, "#" for the
 * detail link if `id` is absent).
 *
 * No outer margin — spacing between cards is the parent's
 * (HistoryPage's) responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function HistoryItemCard({ simulation }) {
  const formattedDate = formatDate(simulation?.created_at)
  const target = simulation?.target ?? simulation?.inputs?.target ?? FALLBACK_VALUE

  const healthScore = simulation?.results?.healthScore
  const healthScoreDisplay =
    typeof healthScore === 'number' && !Number.isNaN(healthScore)
      ? `${healthScore}/100`
      : FALLBACK_VALUE

  const detailHref = simulation?.id ? `/history/${simulation.id}` : '#'

  return (
    <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: date + target */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <Calendar size={20} />
        </div>
        <div>
          <p className="font-medium text-slate-900">{formattedDate}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Target size={14} />
            {target}
          </p>
        </div>
      </div>

      {/* Middle: health score */}
      <div className="flex items-center gap-2 sm:px-4">
        <HeartPulse size={18} className="text-emerald-500" />
        <span className="text-base font-semibold text-slate-900">{healthScoreDisplay}</span>
      </div>

      {/* Right: actions */}
      <Link to={detailHref} className="btn-secondary px-4 py-2 text-sm">
        Lihat Detail
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}