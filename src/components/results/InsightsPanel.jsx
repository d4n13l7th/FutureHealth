import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

/**
 * InsightsPanel
 * ----------------------------------------------------------------
 * Presentational qualitative breakdown for the Insights tab of
 * ResultsPage, surfacing simulationEngine.generateInsights()
 * (`strengths`, `weaknesses`) and
 * simulationEngine.identifyHealthFactors()
 * (`strongestFactor`, `weakestFactor`).
 *
 * Layout:
 * - Strongest/weakest factor pills at the top (emerald/amber).
 * - "Kekuatan" list with check icons.
 * - "Hal yang Perlu Diperhatikan" list with alert icons.
 *
 * Fully defensive: missing/empty props render fallback messaging
 * rather than crashing or showing "undefined". No outer margin —
 * spacing is the parent's responsibility.
 *
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function InsightsPanel({ insights, strongestFactor, weakestFactor }) {
  const strengths = Array.isArray(insights?.strengths) ? insights.strengths : []
  const weaknesses = Array.isArray(insights?.weaknesses) ? insights.weaknesses : []

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Wawasan Kesehatan</h3>

      {/* Strongest / weakest factor highlight */}
      <div className="mt-4 flex flex-wrap gap-2">
        {strongestFactor && (
          <span className="pill bg-emerald-50 text-emerald-700">
            <TrendingUp size={14} />
            Faktor Terkuat: {strongestFactor}
          </span>
        )}
        {weakestFactor && (
          <span className="pill bg-amber-50 text-amber-700">
            <TrendingDown size={14} />
            Faktor Terlemah: {weakestFactor}
          </span>
        )}
      </div>

      {/* Strengths */}
      <div className="mt-5">
        <h4 className="text-sm font-semibold text-slate-700">Kekuatan</h4>
        {strengths.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-2">
            {strengths.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            Belum ada kekuatan signifikan yang terdeteksi.
          </p>
        )}
      </div>

      {/* Weaknesses */}
      <div className="mt-5">
        <h4 className="text-sm font-semibold text-slate-700">Hal yang Perlu Diperhatikan</h4>
        {weaknesses.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-2">
            {weaknesses.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            Tidak ada hal signifikan yang perlu diperhatikan saat ini.
          </p>
        )}
      </div>
    </div>
  )
}