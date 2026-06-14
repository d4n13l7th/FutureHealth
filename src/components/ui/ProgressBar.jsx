const TRACK_CLASSES = 'w-full bg-slate-100 rounded-full h-2.5 overflow-hidden'

const FILL_CLASSES = 'bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out'

/**
 * Joins class fragments, skipping falsy values, and collapses
 * extra whitespace.
 */
function cx(...classes) {
    return classes.filter(Boolean).join(' ')
}

/**
 * ProgressBar
 * ----------------------------------------------------------------
 * Foundational, reusable linear progress bar primitive for
 * FutureHealth. Renders a track with a filled portion proportional
 * to `progress` (0-100).
 *
 * Crucial for the upcoming multi-step SimulationForm wizard
 * (components/simulation/StepProgressBar.jsx will wrap this to show
 * "Step X of Y" progress), and reusable anywhere else a simple
 * percentage indicator is needed (e.g. achievement progress).
 *
 * Props:
 * - progress: number (0-100). Clamped to this range before being
 *   applied as the fill's width.
 * - className: merged with the outer container's classes.
 *
 * Purely presentational.
 *
 * Usage:
 *   <ProgressBar progress={50} />
 *   <ProgressBar progress={currentStep / totalSteps * 100} className="mb-4" />
 * ----------------------------------------------------------------
 */
export default function ProgressBar({ progress = 0, className = '' }) {
    const clampedProgress = Math.min(Math.max(progress, 0), 100)

    return (
        <div className={cx(TRACK_CLASSES, className)}>
            <div className={FILL_CLASSES} style={{ width: `${clampedProgress}%` }} />
        </div>
    )
}