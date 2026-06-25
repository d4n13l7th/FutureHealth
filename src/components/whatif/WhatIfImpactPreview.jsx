import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import ProgressChart from '../results/ProgressChart.jsx'

/**
 * WhatIfImpactPreview
 * ----------------------------------------------------------------
 * Delta display showing the impact of What-If overrides:
 * - Score difference (ΔhealthScore)
 * - Time to goal difference (ΔtimeToGoal)
 * - Mini ProgressChart overlay comparing base vs what-if timelines
 *
 * Props:
 * - currentResult:  the base simulation result
 * - whatIfResult:   the recalculated what-if result
 * ----------------------------------------------------------------
 */
export default function WhatIfImpactPreview({ currentResult, whatIfResult }) {
  if (!currentResult || !whatIfResult) return null

  const currentScore = currentResult.healthScore
  const whatIfScore = whatIfResult.healthScore
  const scoreDelta = whatIfScore - currentScore

  const deltaTheme =
    scoreDelta > 0
      ? { icon: TrendingUp, className: 'text-emerald-500', bg: 'bg-emerald-50' }
      : scoreDelta < 0
      ? { icon: TrendingDown, className: 'text-red-500', bg: 'bg-red-50' }
      : { icon: Minus, className: 'text-slate-400', bg: 'bg-slate-50' }
  const DeltaIcon = deltaTheme.icon

  return (
    <div className="flex flex-col gap-4">
      {/* Score comparison */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-center">
          <p className="text-xs font-medium text-slate-400">Skor Saat Ini</p>
          <p className="text-2xl font-bold text-slate-700">{currentScore}</p>
        </div>

        <ArrowRight size={20} className="text-slate-300" />

        <div className="text-center">
          <p className="text-xs font-medium text-slate-400">Skor Proyeksi</p>
          <p className={`flex items-center justify-center gap-1 text-2xl font-bold ${deltaTheme.className}`}>
            {whatIfScore}
            <DeltaIcon size={18} />
          </p>
        </div>

        <span className={`pill ${deltaTheme.className} ${deltaTheme.bg}`}>
          {scoreDelta > 0 ? '+' : ''}
          {scoreDelta} poin
        </span>
      </div>

      {/* Time to goal comparison */}
      {currentResult.timeToGoal && whatIfResult.timeToGoal && (
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-slate-400">Waktu (saat ini): </span>
            <span className="font-medium text-slate-700">{currentResult.timeToGoal}</span>
          </div>
          <div>
            <span className="text-slate-400">Waktu (what-if): </span>
            <span className={`font-medium ${deltaTheme.className}`}>{whatIfResult.timeToGoal}</span>
          </div>
        </div>
      )}

      {/* Mini chart overlay */}
      {whatIfResult.timeline && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <ProgressChart
            timeline={currentResult.timeline}
            whatIfTimeline={whatIfResult.timeline}
          />
        </div>
      )}
    </div>
  )
}
