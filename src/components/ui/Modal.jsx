import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Modal
 * ----------------------------------------------------------------
 * Confirmation dialog component with overlay, close button, and
 * action buttons. Used for confirmations like deleting a simulation.
 *
 * Props:
 * - isOpen:    boolean — controls visibility
 * - onClose:   () => void — called on overlay click, X button, or Escape
 * - title:     string — modal heading
 * - children:  ReactNode — modal body content
 * - actions:   ReactNode — optional footer buttons area
 *
 * Accessibility: traps focus within the modal and closes on Escape.
 * ----------------------------------------------------------------
 */
export default function Modal({ isOpen, onClose, title, children, actions }) {
  const overlayRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleOverlayClick(event) {
    if (event.target === overlayRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fade-in"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 text-sm text-slate-600">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="mt-6 flex justify-end gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}
