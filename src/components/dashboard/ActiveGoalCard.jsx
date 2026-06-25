import { Target } from 'lucide-react'

/**
 * ActiveGoalCard
 * ----------------------------------------------------------------
 * Dashboard card displaying the user's most recent simulation
 * target/goal.
 *
 * Props:
 * - latest: the most recent simulation record from history
 * ----------------------------------------------------------------
 */
export default function ActiveGoalCard({ latest }) {
  const target = latest?.inputs?.target ?? latest?.target
  const commitmentLevel = latest?.inputs?.commitmentLevel
  const timeToGoal = latest?.results?.timeToGoal

  if (!target) {
    return (
      <div className="card flex flex-col items-center gap-3 py-8 text-center">
        <Target size={28} className="text-slate-300" />
        <p className="text-sm text-slate-400">Belum ada target aktif.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-2">
        <Target size={18} className="text-emerald-500" />
        <h3 className="font-semibold text-slate-900">Target Aktif</h3>
      </div>

      <p className="text-lg font-bold text-slate-900">{target}</p>

      <div className="mt-3 flex flex-wrap gap-3">
        {commitmentLevel != null && (
          <span className="pill">
            Komitmen: {commitmentLevel}/10
          </span>
        )}
        {timeToGoal && (
          <span className="pill">
            Estimasi: {timeToGoal}
          </span>
        )}
      </div>
    </div>
  )
}
