const BASE_CLASSES =
    'w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ' +
    'accent-emerald-500 transition-all disabled:cursor-not-allowed disabled:opacity-60'

/**
 * Joins class fragments, skipping falsy values, and collapses
 * extra whitespace.
 */
function cx(...classes) {
    return classes.filter(Boolean).join(' ')
}

/**
 * Slider
 * ----------------------------------------------------------------
 * Foundational, reusable range-input primitive for FutureHealth.
 * Formalizes ad-hoc `<input type="range">` usages (e.g. stressLevel,
 * commitmentLevel in SimulationForm.jsx) into a component with
 * consistent emerald-themed styling via Tailwind's `accent-*`
 * utility.
 *
 * Props:
 * - value, onChange, min, max, step, disabled: standard
 *   <input type="range"> props, passed through directly
 * - className: merged with the computed base classes
 * - all other standard <input> props are passed through via spread
 *
 * Label text and the current-value display (e.g. "7/10") remain the
 * consuming form's responsibility — this component renders only the
 * slider track/thumb itself.
 *
 * Purely presentational.
 *
 * Usage:
 *   <Slider
 *     min={1}
 *     max={10}
 *     value={stressLevel}
 *     onChange={(e) => onChange(Number(e.target.value))}
 *   />
 * ----------------------------------------------------------------
 */
export default function Slider({ className = '', ...rest }) {
    return <input type="range" className={cx(BASE_CLASSES, className)} {...rest} />
}