// FILE: src/components/results/BMICard.jsx

import { Scale } from 'lucide-react'

const FALLBACK_NUMBER = '-'
const FALLBACK_CATEGORY = 'Tidak diketahui'

/**
 * Formats the BMI value for display, falling back to "-" if the
 * value is missing, not a number, or NaN.
 */
function formatBMI(value) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : FALLBACK_NUMBER
}

/**
 * BMICard
 * ----------------------------------------------------------------
 * Compact stat badge for the header row of ResultsPage, surfacing
 * simulationEngine.calculateBMI()'s output — the user's BMI value
 * and category. Matches the structural pattern of HealthAgeBadge.
 *
 * Displays `bmi` prominently with `bmiCategory` as secondary
 * context in parentheses (e.g. "24.5 (Normal)").
 *
 * Defensive: missing/invalid `bmi` falls back to "-"; missing/empty
 * `bmiCategory` falls back to "Tidak diketahui".
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function BMICard({ bmi, bmiCategory }) {
  const category = bmiCategory || FALLBACK_CATEGORY

  return (
    <div className="card flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500">
        <Scale size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400">BMI</p>
        <p className="text-lg font-semibold text-slate-900">
          {formatBMI(bmi)}{' '}
          <span className="text-sm font-normal text-slate-400">({category})</span>
        </p>
      </div>
    </div>
  )
}