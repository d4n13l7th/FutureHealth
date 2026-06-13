import { Scale, Dumbbell, Moon, HeartPulse, Activity, Sparkles } from 'lucide-react'

/**
 * Stat field configuration: maps a `futureSelf` key to its display
 * label, icon, and an optional formatter for the raw value.
 * Defined outside the component so it isn't recreated on every
 * render.
 */
const STAT_FIELDS = [
  {
    key: 'projectedWeight',
    label: 'Berat Badan',
    icon: Scale,
    format: (value) => (value != null ? `${value} kg` : null),
  },
  {
    key: 'fitness',
    label: 'Kebugaran',
    icon: Dumbbell,
  },
  {
    key: 'sleepQuality',
    label: 'Kualitas Tidur',
    icon: Moon,
  },
  {
    key: 'stressTrend',
    label: 'Tingkat Stres',
    icon: Activity,
  },
  {
    key: 'bmiCategory',
    label: 'Kategori BMI',
    icon: HeartPulse,
  },
  {
    key: 'overallWellbeing',
    label: 'Kesejahteraan',
    icon: Sparkles,
  },
]

const FALLBACK_VALUE = '-'

/**
 * FutureSelfCard
 * ----------------------------------------------------------------
 * Presentational summary card showing the user's projected future
 * self ("Diri Anda 12 Bulan Mendatang") — the `futureSelf` object
 * returned by simulationEngine.runSimulation().
 *
 * Renders a responsive grid (2 cols on mobile, 3 cols on sm+) of
 * labeled stats. Each field is read defensively via optional
 * chaining; missing values fall back to "-" so a partial or
 * malformed `futureSelf` never renders "undefined" or crashes.
 *
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function FutureSelfCard({ futureSelf }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Diri Anda 12 Bulan Mendatang</h3>

      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {STAT_FIELDS.map(({ key, label, icon: Icon, format }) => {
          const rawValue = futureSelf?.[key]
          const displayValue =
            rawValue != null && rawValue !== ''
              ? format
                ? format(rawValue) ?? FALLBACK_VALUE
                : rawValue
              : FALLBACK_VALUE

          return (
            <div key={key} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Icon size={16} />
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">{label}</dt>
                <dd className="font-medium text-slate-900">{displayValue}</dd>
              </div>
            </div>
          )
        })}
      </dl>
    </div>
  )
}