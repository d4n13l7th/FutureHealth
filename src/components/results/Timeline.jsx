import { Flag } from 'lucide-react'

/**
 * Color-codes a milestone's progress bar based on its score,
 * matching the visual language of HealthScoreCircle:
 *   - score >= 80 -> emerald
 *   - score >= 60 -> amber
 *   - score <  60 -> red
 */
function getScoreBarColor(score) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-400'
  return 'bg-red-400'
}

/**
 * Timeline
 * ----------------------------------------------------------------
 * Presentational milestone tracker for the Overview tab of
 * ResultsPage. Visualizes the `timeline` array returned by
 * simulationEngine.projectTimeline() / runSimulation()
 * (e.g. Hari Ini -> Bulan 1 -> Bulan 3 -> Bulan 6 -> Bulan 12).
 *
 * Each milestone is rendered as a row with:
 * - a connector node (visually linked by a vertical line)
 * - its label (e.g. "Bulan 3")
 * - a mini progress bar representing `score` out of 100
 * - the numeric score
 *
 * Gracefully falls back to a message if `timeline` is missing,
 * empty, or not an array.
 *
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function Timeline({ timeline }) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 py-10 text-center">
        <Flag size={24} className="text-slate-300" />
        <p className="text-sm text-slate-400">
          Data perjalanan kesehatan belum tersedia.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Perjalanan Kesehatan</h3>

      <ol className="mt-5 flex flex-col">
        {timeline.map((point, index) => {
          const isLast = index === timeline.length - 1
          const score = Math.min(100, Math.max(0, point?.score ?? 0))

          return (
            <li key={point?.month ?? index} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Connector node + line */}
              <div className="relative flex flex-col items-center">
                <span className="z-10 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
                {!isLast && (
                  <span className="absolute top-3 h-full w-px bg-slate-200" aria-hidden="true" />
                )}
              </div>

              {/* Milestone content */}
              <div className="flex-1 pt-[-2px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-700">
                    {point?.label ?? `Bulan ${point?.month ?? '-'}`}
                  </span>
                  <span className="text-sm font-medium text-slate-500">{score}/100</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full transition-all ${getScoreBarColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}