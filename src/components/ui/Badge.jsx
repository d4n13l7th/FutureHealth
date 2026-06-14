/** Color themes per the `variant` prop. */
const VARIANT_CLASSES = {
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-sky-100 text-sky-800',
    neutral: 'bg-slate-100 text-slate-800',
}

const BASE_CLASSES =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap'

/**
 * Joins class fragments, skipping falsy values, and collapses
 * extra whitespace.
 */
function cx(...classes) {
    return classes.filter(Boolean).join(' ')
}

/**
 * Badge
 * ----------------------------------------------------------------
 * Foundational, reusable badge/pill component for FutureHealth.
 * Formalizes the ad-hoc `.pill` styling pattern used across the app
 * into a component with explicit semantic color variants and an
 * optional leading icon.
 *
 * Props:
 * - variant: 'success' | 'warning' | 'danger' | 'info' |
 *   'neutral' (default)
 * - icon: optional React element rendered before `children`
 * - className: merged with the computed base/variant classes
 * - all other standard <span> props (id, aria-*, etc.) are passed
 *   through via spread
 *
 * Purely presentational.
 *
 * Usage:
 *   <Badge variant="success">Sangat Baik</Badge>
 *   <Badge variant="danger" icon={<AlertOctagon size={14} />}>
 *     Stres: Tinggi
 *   </Badge>
 * ----------------------------------------------------------------
 */
export default function Badge({ children, variant = 'neutral', icon = null, className = '', ...rest }) {
    return (
        <span
            className={cx(BASE_CLASSES, VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral, className)}
            {...rest}
        >
            {icon}
            {children}
        </span>
    )
}