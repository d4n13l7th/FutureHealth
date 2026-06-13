import { Target } from 'lucide-react'

/**
 * RecommendationsList
 * ----------------------------------------------------------------
 * Presentational "next steps" card for the Insights tab of
 * ResultsPage, surfacing
 * simulationEngine.generateRecommendations() — a prioritized list
 * of actionable lifestyle changes.
 *
 * Each recommendation is rendered as a checklist-style item with a
 * `Target` icon marker (rather than a standard bullet), reinforcing
 * FutureHealth's motivational, goal-oriented tone.
 *
 * Defensive: if `recommendations` is missing, null, or empty, a
 * fallback message is shown instead of an empty list.
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function RecommendationsList({ recommendations }) {
  const items = Array.isArray(recommendations) ? recommendations : []

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Rekomendasi Tindakan</h3>

      {items.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Target size={14} />
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          Belum ada rekomendasi tindakan yang dapat ditampilkan saat ini.
        </p>
      )}
    </div>
  )
}