import { Sparkles } from 'lucide-react'

const FALLBACK_TITLE = 'FutureHealth Analysis'
const FALLBACK_MESSAGE =
  'Laporan analisis belum tersedia. Jalankan simulasi untuk melihat ringkasan personal Anda.'

/**
 * NarrativeReport
 * ----------------------------------------------------------------
 * Presentational text report for the Narrative tab of ResultsPage,
 * rendering simulationEngine.generateNarrative()'s output — a
 * deterministic, rule-based "FutureHealth Analysis" that reads like
 * a personalized health assistant's summary.
 *
 * - `narrative.title` is rendered as the heading.
 * - Each item in `narrative.paragraphs` is rendered as its own
 *   <p> with relaxed line height and slate reading typography.
 *
 * Defensive: a missing `narrative`, missing `title`, or
 * empty/missing `paragraphs` renders a fallback heading and message
 * instead of crashing or showing "undefined".
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function NarrativeReport({ narrative }) {
  const title = narrative?.title ?? FALLBACK_TITLE
  const paragraphs = Array.isArray(narrative?.paragraphs) ? narrative.paragraphs : []

  return (
    <div className="card">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-emerald-500" />
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>

      {paragraphs.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-4 leading-relaxed text-slate-500">{FALLBACK_MESSAGE}</p>
      )}
    </div>
  )
}