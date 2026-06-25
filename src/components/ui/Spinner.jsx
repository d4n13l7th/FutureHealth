import { Loader2 } from 'lucide-react'

/**
 * Spinner
 * ----------------------------------------------------------------
 * Loading spinner component for consistent loading states across
 * FutureHealth. Replaces the inline <Loader2 className="animate-spin">
 * pattern used in multiple components.
 *
 * Props:
 * - size:      number — icon size in px (default 24)
 * - className: string — additional CSS classes
 * - label:     string — optional text shown below the spinner
 * ----------------------------------------------------------------
 */
export default function Spinner({ size = 24, className = '', label }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 size={size} className="animate-spin text-emerald-500" />
      {label && (
        <p className="text-sm font-medium text-slate-500">{label}</p>
      )}
    </div>
  )
}
