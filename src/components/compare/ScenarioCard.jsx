import { SlidersHorizontal } from 'lucide-react'

/**
 * Quick-change presets for Scenario B. Each represents a single
 * lifestyle field override, applied via onChange merging it into
 * alternativeInputs. Values are hardcoded to match
 * simulationEngine.js's known option set (sleepHours,
 * exerciseFrequency, screenTime, dietQuality, commitmentLevel).
 */
const QUICK_CHANGES = [
  { key: 'sleepHours', label: 'Tidur 7-8 jam/hari', value: '7-8 jam' },
  { key: 'exerciseFrequency', label: 'Olahraga 5x/minggu', value: '5 kali atau lebih per minggu' },
  { key: 'screenTime', label: 'Screen time < 2 jam', value: 'Kurang dari 2 jam' },
  { key: 'dietQuality', label: 'Pola makan sehat', value: 'Sehat' },
  { key: 'commitmentLevel', label: 'Komitmen maksimal (10/10)', value: 10 },
]

/**
 * ScenarioCard
 * ----------------------------------------------------------------
 * Control panel for adjusting "Scenario B" on CompareFuturesPage.
 *
 * Renders a set of hardcoded "Quick Change" buttons. Clicking a
 * button merges that field's override into `alternativeInputs` via
 * `onChange({ ...alternativeInputs, [key]: value })`, which the
 * parent then re-runs through simulationEngine.compareScenarios().
 *
 * Active buttons (where alternativeInputs[key] === value) are
 * styled with an emerald highlight; inactive buttons use a neutral
 * border with a hover effect.
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function ScenarioCard({ alternativeInputs, onChange }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-emerald-500" />
        <h3 className="font-semibold text-slate-900">Atur Skenario B</h3>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Pilih perubahan gaya hidup untuk skenario alternatif, lalu bandingkan
        hasilnya dengan skenario Anda saat ini.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_CHANGES.map((change) => {
          const isActive = alternativeInputs?.[change.key] === change.value

          return (
            <button
              key={change.key}
              type="button"
              onClick={() => onChange({ ...alternativeInputs, [change.key]: change.value })}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {change.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}