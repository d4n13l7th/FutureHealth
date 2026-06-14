import { Loader2 } from 'lucide-react'

/**
 * Visual variants. Styling mirrors the existing `.btn-primary` /
 * `.btn-secondary` classes from src/index.css (same colors, radius,
 * and press effect) so this component is a visual drop-in
 * replacement, plus adds a `ghost` variant not previously available
 * as a reusable class.
 */
const VARIANT_CLASSES = {
  primary:
    'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:shadow-emerald-500/40',
  secondary:
    'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-300',
  ghost: 'bg-transparent text-slate-600 hover:bg-emerald-50 hover:text-emerald-600',
}

/** Padding + text size per `size` prop. */
const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold ' +
  'transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200'

/**
 * Joins class fragments, skipping falsy values, and collapses
 * extra whitespace.
 */
function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Button
 * ----------------------------------------------------------------
 * Foundational, reusable button component for FutureHealth.
 *
 * Props:
 * - variant: 'primary' (default) | 'secondary' | 'ghost'
 * - size: 'sm' | 'md' (default) | 'lg'
 * - isLoading: when true, disables the button and replaces
 *   `leftIcon` with a spinning Loader2 (children text is preserved)
 * - leftIcon / rightIcon: optional icon elements rendered before/
 *   after the children
 * - className: merged with the computed base/variant/size classes
 * - all other standard <button> props (onClick, type, disabled,
 *   aria-*, etc.) are passed through via spread
 *
 * Purely presentational — no context, no custom hooks.
 *
 * Usage:
 *   <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />}>
 *     Tambah
 *   </Button>
 *
 *   <Button isLoading={isSubmitting}>Simpan</Button>
 * ----------------------------------------------------------------
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || isLoading

  const displayedLeftIcon = isLoading ? (
    <Loader2 size={18} className="animate-spin" />
  ) : (
    leftIcon
  )

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cx(
        BASE_CLASSES,
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        className
      )}
      {...rest}
    >
      {displayedLeftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}