const BASE_CLASSES =
    'w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all ' +
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
 * Input
 * ----------------------------------------------------------------
 * Foundational, reusable input primitive for FutureHealth.
 * Formalizes the ad-hoc `<input className="input-field">` pattern
 * used across the app into a component that handles optional
 * leading/trailing icons, dynamic padding, and error styling.
 *
 * Props:
 * - leftIcon / rightIcon: optional React elements, absolutely
 *   positioned inside the input wrapper. When present, the input's
 *   horizontal padding is adjusted (pl-10 / pr-10) so text doesn't
 *   overlap the icon.
 * - error: boolean or string. If truthy, the input's border/focus
 *   ring switch to a red theme. The error message itself (if any)
 *   is NOT rendered here — that remains the consuming form's
 *   responsibility.
 * - className: merged with the computed base/border/padding classes
 * - all other standard <input> props (value, onChange, type,
 *   placeholder, disabled, etc.) are passed through via spread
 *
 * Purely presentational.
 *
 * Usage:
 *   <Input
 *     type="email"
 *     placeholder="nama@email.com"
 *     leftIcon={<Mail size={18} />}
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *   />
 *
 *   <Input error={!!validationError} value={age} onChange={...} />
 * ----------------------------------------------------------------
 */
export default function Input({ leftIcon = null, rightIcon = null, error = false, className = '', ...rest }) {
    return (
        <div className="relative">
            {leftIcon && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {leftIcon}
                </span>
            )}

            <input
                className={cx(
                    BASE_CLASSES,
                    error ? ERROR_BORDER_CLASSES : DEFAULT_BORDER_CLASSES,
                    leftIcon && 'pl-10',
                    rightIcon && 'pr-10',
                    className
                )}
                {...rest}
            />

            {rightIcon && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {rightIcon}
                </span>
            )}
        </div>
    )
}