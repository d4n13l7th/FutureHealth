import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Maps a raw `trend` value (as returned by
 * simulationEngine.generateHealthTrend()) to its Indonesian label,
 * icon, and color theme. Unrecognized or missing values fall back
 * to the "Stable" configuration.
 */
const TREND_CONFIG = {
  Improving: {
    label: 'Meningkat',
    icon: TrendingUp,
    className: 'bg-emerald-50 text-emerald-500',
  },
  Declining: {
    label: 'Menurun',
    icon: TrendingDown,
    className: 'bg-red-50 text-red-500',
  },
  Stable: {
    label: 'Stabil',
    icon: Minus,
    className: 'bg-slate-50 text-slate-500',
  },
}

/**
 * HealthTrendBadge
 * ----------------------------------------------------------------
 * Compact stat badge for the header row of ResultsPage, surfacing
 * simulationEngine.generateHealthTrend()'s output — translating the
 * raw `trend` value ('Improving' | 'Declining' | 'Stable') into an
 * Indonesian label with a color-coded icon. Matches the structural
 * pattern of HealthAgeBadge and BMICard.
 *
 * Unrecognized or missing `trend` values fall back to the "Stable"
 * ("Stabil") configuration.
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function HealthTrendBadge({ trend }) {
  const config = TREND_CONFIG[trend] ?? TREND_CONFIG.Stable
  const Icon = config.icon

  return (
    <div className="card flex items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.className}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400">Tren Kesehatan</p>
        <p className="text-lg font-semibold text-slate-900">{config.label}</p>
      </div>
    </div>
  )
}