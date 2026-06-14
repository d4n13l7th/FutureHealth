/** Padding variants per the `padding` prop. */
const PADDING_CLASSES = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const BASE_CLASSES =
  'rounded-2xl bg-white shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden'

const INTERACTIVE_CLASSES =
  'cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 ' +
  'hover:shadow-emerald-500/10 hover:border-emerald-100'

/**
 * Joins class fragments, skipping falsy values, and collapses
 * extra whitespace.
 */
function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Card
 * ----------------------------------------------------------------
 * Foundational, reusable container component for FutureHealth.
 * Formalizes the ad-hoc `<div className="card">` pattern used
 * across the app into a component with configurable padding and
 * built-in interactive states.
 *
 * Props:
 * - padding: 'none' | 'sm' | 'md' (default) | 'lg'
 * - onClick: if provided, the card automatically gains interactive
 *   hover styles (lift, shadow, emerald-tinted border) to signal
 *   it's clickable
 * - className: merged with the computed base/padding/interactive
 *   classes
 * - all other standard <div> props (onClick, role, aria-*, etc.)
 *   are passed through via spread
 *
 * Purely presentational.
 *
 * Usage:
 *   <Card>...</Card>
 *   <Card padding="lg" className="text-center">...</Card>
 *   <Card padding="none" onClick={handleSelect}>...</Card>
 * ----------------------------------------------------------------
 */
export default function Card({
  children,
  padding = 'md',
  onClick,
  className = '',
  ...rest
}) {
  return (
    <div
      onClick={onClick}
      className={cx(
        BASE_CLASSES,
        PADDING_CLASSES[padding] ?? PADDING_CLASSES.md,
        onClick && INTERACTIVE_CLASSES,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}