import { Trophy } from 'lucide-react'
import { evaluateAchievements } from '../../services/achievementService.js'

/**
 * AchievementsStrip
 * ----------------------------------------------------------------
 * Horizontal strip of achievement badges for the Dashboard.
 * Evaluates achievements from simulation history and displays
 * each as an icon+label, with unlocked ones highlighted.
 *
 * Props:
 * - history: Array of simulation records from useSimulationHistory
 * ----------------------------------------------------------------
 */
export default function AchievementsStrip({ history = [] }) {
  const achievements = evaluateAchievements(history)
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Pencapaian</h3>
        </div>
        <span className="pill">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.key}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 transition-colors ${
              achievement.unlocked
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-slate-100 bg-slate-50 opacity-50'
            }`}
            title={achievement.description}
          >
            <span className="text-lg">{achievement.icon}</span>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  achievement.unlocked ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {achievement.label}
              </p>
              <p className="truncate text-xs text-slate-400">
                {achievement.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
