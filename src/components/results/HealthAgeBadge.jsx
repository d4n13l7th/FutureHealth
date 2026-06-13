import { Cake } from 'lucide-react'

const FALLBACK_VALUE = '-'

/**
 * Formats a number for display, falling back to "-" if the value
 * is missing, not a number, or NaN.
 */
function formatAge(value) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : FALLBACK_VALUE
}

/**
 * HealthAgeBadge
 * ----------------------------------------------------------------
 * Compact stat badge for the header row of ResultsPage, surfacing
 * simulationEngine.calculateHealthAge()'s output — an educational
 * "biological health age" simulation, shown alongside the user's
 * actual age for context.
 *
 * Displays `healthAge` prominently with `actualAge` as secondary
 * context (e.g. "19 / usia 21").
 *
 * Defensive: missing/invalid numbers fall back to "-".
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function HealthAgeBadge({ actualAge, healthAge }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
        <Cake size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400">Usia Kesehatan</p>
        <p className="text-lg font-semibold text-slate-900">
          {formatAge(healthAge)}{' '}
          <span className="text-sm font-normal text-slate-400">
            / usia {formatAge(actualAge)}
          </span>
        </p>
      </div>
    </div>
  )
}