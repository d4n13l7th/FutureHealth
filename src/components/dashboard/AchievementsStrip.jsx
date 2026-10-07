import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import {
  evaluateAchievements,
  getAchievementDefinitions,
} from '../../services/achievementService.js'
import { getAchievements } from '../../services/backend.js'

/**
 * AchievementsStrip
 * ----------------------------------------------------------------
 * Horizontal strip of achievement badges for the Dashboard.
 * Evaluates achievements from simulation history and merges in
 * the keys the server has persisted (so unlocks survive even
 * when history is incomplete). Unlocked ones are highlighted.
 *
 * Props:
 * - history: Array of simulation records from useSimulationHistory
 * ----------------------------------------------------------------
 */
export default function AchievementsStrip({ history = [] }) {
  const definitions = getAchievementDefinitions()
  const evaluations = evaluateAchievements(history)
  const unlockedByKey = new Set(
    evaluations.filter((a) => a.unlocked).map((a) => a.key)
  )
  // Catch state separately so the metrics update immediately from
  // history while the server merge is still in flight.
  const [syncedKeys, setSyncedKeys] = useState([])

  useEffect(() => {
    let cancelled = false
    getAchievements().then(({ data, error }) => {
      if (cancelled) return
      if (!error && Array.isArray(data)) {
        setSyncedKeys(data)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const unlockedCount = evaluations.filter(
    (a) => a.unlocked || syncedKeys.includes(a.key)
  ).length

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Pencapaian</h3>
        </div>
        <span className="pill">
          {unlockedCount}/{definitions.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {definitions.map((achievement) => {
          const unlocked =
            unlockedByKey.has(achievement.key) || syncedKeys.includes(achievement.key)
          return (
            <div
              key={achievement.key}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 transition-colors ${
                unlocked
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-100 bg-slate-50 opacity-50'
              }`}
              title={achievement.description}
            >
              <span className="text-lg">{achievement.icon}</span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    unlocked ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {achievement.label}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {achievement.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
