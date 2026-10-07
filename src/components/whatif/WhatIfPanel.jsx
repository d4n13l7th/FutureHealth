import { ArrowRight, RefreshCcw, CheckCircle, SlidersHorizontal, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useSimulationContext } from '../../context/SimulationContext.jsx'
import { useWhatIf } from '../../hooks/useWhatIf.js'
import WhatIfControls from './WhatIfControls.jsx'

// ----------------------------------------------------------------
// WhatIfPanel
// ----------------------------------------------------------------

/**
 * WhatIfPanel
 * ----------------------------------------------------------------
 * Interactive What-If dashboard for the What-If tab of ResultsPage.
 *
 * - Reads currentInputs/currentResult/whatIfResult from
 *   SimulationContext.
 * - Reads overrides/calculateWhatIf/resetWhatIf/applyWhatIfToCurrent
 *   from useWhatIf.
 * - Renders WhatIfControls (selects + sliders per lifestyle field)
 *   that call calculateWhatIf with one override at a time.
 * - When whatIfResult exists, shows a before/after health score
 *   comparison, color-coded by impact direction.
 * - "Reset" and "Terapkan Perubahan" actions are only shown once a
 *   What-If scenario is active.
 *
 * Defensive: if currentResult is null (no active simulation), shows
 * a fallback message instead of rendering the dashboard.
 *
 * No outer margin — spacing is the parent's responsibility.
 * ----------------------------------------------------------------
 */
export default function WhatIfPanel() {
  const { currentInputs, currentResult, whatIfResult } = useSimulationContext()
  const { overrides, calculateWhatIf, resetWhatIf, applyWhatIfToCurrent } = useWhatIf()

  if (!currentResult) {
    return (
      <div className="card flex flex-col items-center gap-2 py-12 text-center">
        <SlidersHorizontal size={28} className="text-slate-300" />
        <p className="text-sm text-slate-400">
          Jalankan simulasi terlebih dahulu untuk menggunakan What-If Simulator.
        </p>
      </div>
    )
  }

  const hasWhatIf = whatIfResult != null
  const currentScore = currentResult.healthScore
  const whatIfScore = whatIfResult?.healthScore
  const scoreDelta = hasWhatIf ? whatIfScore - currentScore : 0

  const deltaTheme =
    scoreDelta > 0
      ? { icon: TrendingUp, className: 'text-emerald-500' }
      : scoreDelta < 0
      ? { icon: TrendingDown, className: 'text-red-500' }
      : { icon: Minus, className: 'text-slate-400' }
  const DeltaIcon = deltaTheme.icon

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-emerald-500" />
        <h3 className="font-semibold text-slate-900">Simulator What-If</h3>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Ubah beberapa kebiasaan gaya hidup di bawah ini dan lihat secara instan
        bagaimana hal tersebut dapat memengaruhi proyeksi skor kesehatan Anda.
      </p>

      {/* Controls */}
      <div className="mt-5">
        <WhatIfControls
          baseInputs={currentInputs}
          overrides={overrides}
          onChange={(field, value) => calculateWhatIf({ [field]: value })}
        />
      </div>

      {/* Comparison */}
      {hasWhatIf ? (
        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
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

            <span className={`pill ${deltaTheme.className} bg-white`}>
              {scoreDelta > 0 ? '+' : ''}
              {scoreDelta} poin
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetWhatIf}
              className="btn-secondary px-4 py-2 text-sm"
            >
              <RefreshCcw size={16} />
              Reset
            </button>
            <button
              type="button"
              onClick={applyWhatIfToCurrent}
              className="btn-primary px-4 py-2 text-sm"
            >
              <CheckCircle size={16} />
              Terapkan Perubahan
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-slate-400">
          Pilih salah satu perubahan di atas untuk melihat dampaknya terhadap skor kesehatan Anda.
        </p>
      )}
    </div>
  )
}