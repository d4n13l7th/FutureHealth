import { HeartPulse } from 'lucide-react'
import HealthScoreCircle from '../results/HealthScoreCircle.jsx'
import HealthAgeBadge from '../results/HealthAgeBadge.jsx'

/**
 * HealthScoreSummaryCard
 * ----------------------------------------------------------------
 * Dashboard card displaying the user's latest health score using
 * the HealthScoreCircle + HealthAgeBadge components from results/.
 *
 * Props:
 * - latest: the most recent simulation record from history
 * ----------------------------------------------------------------
 */
export default function HealthScoreSummaryCard({ latest }) {
  const healthScore = latest?.results?.healthScore ?? latest?.health_score
  const category = latest?.results?.category ?? '-'
  const healthAge = latest?.results?.healthAge
  const actualAge = latest?.inputs?.age

  if (healthScore == null) {
    return (
      <div className="card flex flex-col items-center gap-3 py-8 text-center">
        <HeartPulse size={28} className="text-slate-300" />
        <p className="text-sm text-slate-400">Belum ada skor kesehatan.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-2">
        <HeartPulse size={18} className="text-emerald-500" />
        <h3 className="font-semibold text-slate-900">Skor Kesehatan</h3>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <HealthScoreCircle score={healthScore} category={category} size="sm" />
        {healthAge != null && (
          <HealthAgeBadge actualAge={actualAge} healthAge={healthAge} />
        )}
      </div>
    </div>
  )
}
