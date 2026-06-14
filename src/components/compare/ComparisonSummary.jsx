import { FileText, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'

const FALLBACK_SUMMARY = 'Belum ada data perbandingan yang dapat ditampilkan.'
const FALLBACK_TIME_DIFFERENCE = '-'

/**
 * Maps `betterScenario` to a score-difference pill theme (icon +
 * color) and the appropriate label text.
 */
function getScoreDeltaConfig(betterScenario, scoreDifference) {
  if (betterScenario === 'Scenario B') {
    return {
      icon: TrendingUp,
      className: 'text-emerald-500',
      label: `Selisih ${scoreDifference} poin`,
    }
  }

  if (betterScenario === 'Scenario A') {
    return {
      icon: TrendingDown,
      className: 'text-red-500',
      label: `Selisih ${scoreDifference} poin`,
    }
  }

  return {
    icon: Minus,
    className: 'text-slate-400',
    label: 'Skor Setara',
  }
}

/**
 * ComparisonSummary
 * ----------------------------------------------------------------
 * Summary and insights card for CompareFuturesPage, surfacing
 * simulationEngine.compareScenarios()'s narrative output: `summary`,
 * `scoreDifference`, `betterScenario`, and `timeDifference`.
 *
 * Renders the summary paragraph plus two stat pills:
 * - Score difference, color-coded by which scenario is better
 *   ("Scenario B" -> emerald/TrendingUp, "Scenario A" -> red/
 *   TrendingDown, otherwise -> slate/Minus with "Skor Setara").
 * - Time difference, with an ArrowRight icon.
 *
 * Defensive: a missing/null `data` renders safe fallbacks
 * (scoreDifference 0, equal-scenario styling, fallback summary and
 * time-difference text) rather than crashing.
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no hooks, no context, no API calls.
 * ----------------------------------------------------------------
 */
export default function ComparisonSummary({ data }) {
  const scoreDifference = data?.scoreDifference ?? 0
  const betterScenario = data?.betterScenario ?? 'Setara'
  const timeDifference = data?.timeDifference ?? FALLBACK_TIME_DIFFERENCE
  const summary = data?.summary ?? FALLBACK_SUMMARY

  const deltaConfig = getScoreDeltaConfig(betterScenario, scoreDifference)
  const DeltaIcon = deltaConfig.icon

  return (
    <div className="card">
      <div className="flex items-center gap-2">
        <FileText size={18} className="text-emerald-500" />
        <h3 className="font-semibold text-slate-900">Ringkasan Perbandingan</h3>
      </div>

      <p className="mt-3 leading-relaxed text-slate-600">{summary}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`pill bg-white ${deltaConfig.className}`}>
          <DeltaIcon size={14} />
          {deltaConfig.label}
        </span>
        <span className="pill bg-white text-slate-500">
          <ArrowRight size={14} />
          {timeDifference}
        </span>
      </div>
    </div>
  )
}