import { HeartPulse, Scale, Cake, Target } from 'lucide-react'

const FALLBACK_VALUE = '-'

/**
 * Formats a number for display, falling back to "-" if the value
 * is missing, not a number, or NaN.
 */
function formatNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : FALLBACK_VALUE
}

/**
 * QuickStatsRow
 * ----------------------------------------------------------------
 * Responsive row of mini stat cards for the populated
 * DashboardPage, summarizing the most recent simulation's key
 * metrics: Skor Kesehatan, BMI, Usia Kesehatan, and Target Aktif.
 *
 * Reads from a simulation history record (`latest`), which has the
 * shape persisted by services/supabase.js's saveSimulation:
 *   { results: { healthScore, bmi, bmiCategory, healthAge, ... },
 *     target, inputs: { target, ... }, created_at, ... }
 *
 * Defensive: `latest` and `latest.results` may be missing entirely
 * (e.g. malformed record) — every field falls back to "-".
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function QuickStatsRow({ latest }) {
  const results = latest?.results
  const target = latest?.target ?? latest?.inputs?.target

  const healthScore = formatNumber(results?.healthScore)
  const healthScoreDisplay = healthScore !== FALLBACK_VALUE ? `${healthScore}/100` : FALLBACK_VALUE

  const bmi = formatNumber(results?.bmi)
  const bmiCategory = results?.bmiCategory
  const bmiDisplay =
    bmi !== FALLBACK_VALUE ? `${bmi}${bmiCategory ? ` (${bmiCategory})` : ''}` : FALLBACK_VALUE

  const healthAge = formatNumber(results?.healthAge)

  const targetDisplay = target || FALLBACK_VALUE

  const stats = [
    {
      key: 'healthScore',
      label: 'Skor Kesehatan',
      value: healthScoreDisplay,
      icon: HeartPulse,
      className: 'bg-emerald-50 text-emerald-500',
      truncate: false,
    },
    {
      key: 'bmi',
      label: 'BMI',
      value: bmiDisplay,
      icon: Scale,
      className: 'bg-sky-50 text-sky-500',
      truncate: false,
    },
    {
      key: 'healthAge',
      label: 'Usia Kesehatan',
      value: healthAge,
      icon: Cake,
      className: 'bg-amber-50 text-amber-500',
      truncate: false,
    },
    {
      key: 'target',
      label: 'Target Aktif',
      value: targetDisplay,
      icon: Target,
      className: 'bg-slate-50 text-slate-500',
      truncate: true,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <div key={stat.key} className="card flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.className}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">{stat.label}</p>
              <p className={`text-lg font-semibold text-slate-900 ${stat.truncate ? 'truncate' : ''}`}>
                {stat.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}