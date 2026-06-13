import { AlertOctagon, AlertTriangle, ShieldCheck, ShieldQuestion } from 'lucide-react'

/**
 * Risk-level styling configuration: maps each level string to a
 * badge color theme and a semantic icon. Defined outside the
 * component so it isn't recreated on every render.
 */
const RISK_LEVEL_CONFIG = {
  Tinggi: {
    icon: AlertOctagon,
    className: 'bg-red-50 text-red-700',
  },
  Sedang: {
    icon: AlertTriangle,
    className: 'bg-amber-50 text-amber-700',
  },
  Rendah: {
    icon: ShieldCheck,
    className: 'bg-emerald-50 text-emerald-700',
  },
}

const FALLBACK_CONFIG = {
  icon: ShieldQuestion,
  className: 'bg-slate-100 text-slate-600',
}

/**
 * RiskRadar
 * ----------------------------------------------------------------
 * Presentational risk-detection card for the Insights tab of
 * ResultsPage, surfacing simulationEngine.detectRisks() — a
 * per-factor risk level across Tidur, Stres, Screen Time,
 * Olahraga, and Pola Makan.
 *
 * Each risk is rendered as a color-coded `pill` badge with a
 * matching semantic icon:
 *   - "Tinggi" -> red, AlertOctagon
 *   - "Sedang" -> amber, AlertTriangle
 *   - "Rendah" -> emerald, ShieldCheck
 *   - unrecognized level -> slate, ShieldQuestion (fallback)
 *
 * Defensive: missing/empty `risks`, or items missing `factor`/
 * `level`, are handled gracefully — fallback message or fallback
 * styling, never "undefined".
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function RiskRadar({ risks }) {
  const items = Array.isArray(risks) ? risks : []

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Tingkat Risiko</h3>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((risk, index) => {
            const factor = risk?.factor ?? 'Tidak diketahui'
            const level = risk?.level
            const config = RISK_LEVEL_CONFIG[level] ?? FALLBACK_CONFIG
            const Icon = config.icon

            return (
              <span
                key={`${factor}-${index}`}
                className={`pill ${config.className}`}
              >
                <Icon size={14} />
                {factor}: {level ?? 'Tidak diketahui'}
              </span>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          Belum ada data risiko yang dapat ditampilkan saat ini.
        </p>
      )}
    </div>
  )
}