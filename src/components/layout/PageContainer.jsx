// FILE: src/components/layout/PageContainer.jsx

/**
 * PageContainer
 * ----------------------------------------------------------------
 * Central reusable layout primitive for wrapping page content.
 *
 * Provides a standardized structure across the application with
 * explicit props to handle common layout edge-cases (full-width
 * sections, no-padding bleed) safely, avoiding Tailwind class
 * specificity conflicts.
 *
 * Props:
 * - fullWidth (boolean): Bypasses the max-w-6xl constraint.
 * - noPadding (boolean): Removes the default horizontal padding.
 * - className (string): For safe, non-conflicting layout additions
 * (e.g., vertical margins like 'py-12' or 'mt-8').
 * ----------------------------------------------------------------
 */
export default function PageContainer({
  children,
  className = '',
  fullWidth = false,
  noPadding = false,
}) {
  // Gunakan variabel terpisah agar Tailwind tidak mengalami
  // konflik kelas (misal: "max-w-6xl max-w-full" bertabrakan).
  const maxWidthClass = fullWidth ? 'max-w-full' : 'max-w-6xl'
  const paddingClass = noPadding ? 'px-0' : 'px-4 sm:px-6 lg:px-8'

  return (
    <div
      className={`mx-auto w-full ${maxWidthClass} ${paddingClass} ${className}`}
    >
      {children}
    </div>
  )
}