import { Sparkles, UserRound, Scale, HeartPulse, Smile, Target } from 'lucide-react'

const STAT_FIELDS = [
  { key: 'age', label: 'Usia saat ini', icon: UserRound, format: (v) => v ?? FALLBACK_VALUE },
  { key: 'weight', label: 'Berat badan', icon: Scale, format: (v) => (v ? `${v} kg` : FALLBACK_VALUE) },
  { key: 'healthAge', label: 'Usia kesehatan', icon: HeartPulse, format: (v) => v ?? FALLBACK_VALUE },
  { key: 'lifestyle', label: 'Gaya hidup', icon: Smile, format: (v) => v ?? FALLBACK_VALUE },
  { key: 'goal', label: 'Target utama', icon: Target, format: (v) => v ?? FALLBACK_VALUE },
]

const FALLBACK_VALUE = 'Belum tersedia'

/**
 * Displays the user's projected future self summary derived from the
 * simulation output. The card remains presentational and relies on
 * `futureSelf` data populated by the simulation engine.
 */
export default function FutureSelfCard({ futureSelf, score }) {
  const values = futureSelf ?? {}

  const derivedScore = Number(score)
  const tone = Number.isFinite(derivedScore)
    ? derivedScore >= 80
      ? 'high'
      : derivedScore >= 60
        ? 'med'
        : 'low'
    : 'high'

  const palette = {
    high: {
      ring: '#FAF8F4',
      arc: '#17543C',
      dot: '#2E7D5B',
      fill: '#DFEFE5',
      stroke: '#2E7D5B',
    },
    med: {
      ring: '#FAF8F4',
      arc: '#B45309',
      dot: '#F59E0B',
      fill: '#FEF3C7',
      stroke: '#F59E0B',
    },
    low: {
      ring: '#FAF8F4',
      arc: '#B91C1C',
      dot: '#EF4444',
      fill: '#FEE2E2',
      stroke: '#EF4444',
    },
  }[tone]

  return (
    <div className="card">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-emerald-600" />
        <h3 className="text-lg font-semibold text-slate-900">Diri Anda di Masa Depan</h3>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        Proyeksi kesehatan berbasis pola hidup Anda saat ini, berikut langkah yang bisa mendekatkan Anda ke versi terbaik.
      </p>

      <div className="mt-6 flex justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill={palette.ring} />
          <path
            d="M 16 80 A 64 64 0 1 1 144 80"
            fill="none"
            stroke={palette.arc}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="8 6"
          />
          <circle cx="144" cy="80" r="6" fill={palette.dot} />
          <path
            d="M 64 108 C 56 100, 52 90, 52 80 C 52 62, 64 48, 80 48 C 96 48, 108 62, 108 80 C 108 90, 104 100, 96 108"
            fill={palette.fill}
            stroke={palette.stroke}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 48 120 L 40 136 L 56 132 Z"
            fill={palette.arc}
            opacity="0.25"
          />
          <path
            d="M 60 52 L 56 40 L 70 44 Z"
            fill={palette.arc}
            opacity="0.25"
          />
          <circle cx="80" cy="72" r="14" fill={palette.stroke} opacity="0.12" />
          <circle cx="80" cy="70" r="10" fill={palette.stroke} />
          <rect x="72" y="80" width="16" height="12" rx="6" fill={palette.stroke} />
        </svg>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {STAT_FIELDS.map((field) => {
          const value = values[field.key]
          const formatted = field.format(value)
          const Icon = field.icon

          return (
            <div key={field.key} className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                  <Icon size={16} className="text-emerald-600" />
                </div>
                <dt className="text-xs font-medium text-slate-500">{field.label}</dt>
              </div>
              <dd className="mt-2 text-sm font-semibold text-slate-900">{formatted}</dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
