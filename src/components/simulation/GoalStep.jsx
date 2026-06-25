import { SIMULATION_OPTIONS } from '../../services/simulationEngine.js'

/**
 * GoalStep
 * ----------------------------------------------------------------
 * Sub-form component for the simulation wizard's "Target" step.
 * Renders a list of health target options from SIMULATION_OPTIONS.
 *
 * Props:
 * - value:    string — the currently selected target
 * - onChange: (target: string) => void
 * ----------------------------------------------------------------
 */
export default function GoalStep({ value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="label-text">Pilih Target Kesehatan Anda</label>
      <div className="grid gap-3 sm:grid-cols-2">
        {SIMULATION_OPTIONS.targets.map((target) => {
          const isSelected = value === target

          return (
            <button
              key={target}
              type="button"
              onClick={() => onChange(target)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                isSelected
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50'
              }`}
            >
              {target}
            </button>
          )
        })}
      </div>
    </div>
  )
}
