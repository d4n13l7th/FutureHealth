import { ChevronDown } from 'lucide-react'

// Mirrors Input.jsx's base/border classes exactly, so Select and
// Input look identical within the same form. See Architecture
// Adjustments for why these are duplicated rather than imported.
const BASE_CLASSES =
    'w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all ' +
    'appearance-none cursor-pointer ' +
    'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

const DEFAULT_BORDER_CLASSES =
    'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'

const ERROR_BORDER_CLASSES =
    'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'

/**
 * Joins class fragments, skipping falsy values, and collapses
 * extra whitespace.
 */
function cx(...classes) {
    return classes.filter(Boolean).join(' ')
}

/**
 * Select
 * ----------------------------------------------------------------
 * Foundational, reusable select dropdown primitive for
 * FutureHealth. Styled to match Input.jsx exactly, with the native
 * browser dropdown arrow hidden in favor of a consistent custom
 * ChevronDown icon.
 *
 * Props:
 * - options: array of { value, label } — rendered as <option>
 *   elements.
 * - leftIcon: optional React element, absolutely positioned on the
 *   left. When present, the select gains pl-10 padding.
 * - error: boolean or string. If truthy, the select's border/focus
 *   ring switch to a red theme (identical to Input.jsx). The error
 *   message itself is NOT rendered here.
 * - className: merged with the computed base/border/padding classes
 * - all other standard <select> props (value, onChange, disabled,
 *   etc.) are passed through via spread
 *
 * Purely presentational.
 *
 * Usage:
 *   <Select
 *     value={sleepHours}
 *     onChange={(e) => onChange(e.target.value)}
 *     options={SIMULATION_OPTIONS.sleepHours.map((o) => ({ value: o, label: o }))}
 *   />
 * ----------------------------------------------------------------
 */
export default function Select({ options = [], leftIcon = null, error = false, className = '', ...rest }) {
    return (
        <div className="relative">
            {leftIcon && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {leftIcon}
                </span>
            )}

            <select
                className={cx(
                    BASE_CLASSES,
                    error ? ERROR_BORDER_CLASSES : DEFAULT_BORDER_CLASSES,
                    leftIcon && 'pl-10',
                    'pr-10',
                    className
                )}
                {...rest}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
        </div>
    )
}