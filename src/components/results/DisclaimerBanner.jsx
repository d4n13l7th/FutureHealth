import { Info } from 'lucide-react'

/**
 * DisclaimerBanner
 * ----------------------------------------------------------------
 * Reusable, lightweight informational banner — used to surface
 * simulationEngine.js's educational disclaimer (`result.disclaimer`)
 * prominently at the top of results-related pages.
 *
 * Visually distinct from `.card` via a light sky-blue treatment
 * (bg-sky-50 / border-sky-100 / text-sky-700), signaling
 * "important context" rather than standard content.
 *
 * Architecture Note: This component manages its inner styling 
 * (padding, colors, flex layout) but accepts a `className` prop 
 * so the parent can dictate outer margins (e.g., `mb-6`), keeping 
 * this primitive perfectly reusable in any layout context.
 * ----------------------------------------------------------------
 */
export default function DisclaimerBanner({ text, className = '' }) {
  // Defensive check: don't render an empty blue box if text is missing
  if (!text) return null

  return (
    <div className={`flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700 ${className}`}>
      <Info size={18} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  )
}