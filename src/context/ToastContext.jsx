import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const TOAST_DURATION_MS = 3000

/**
 * Per-type styling for toast cards: accent border color, icon
 * background/color, and the icon component itself.
 */
const TOAST_TYPE_CONFIG = {
  success: {
    icon: CheckCircle,
    borderClassName: 'border-l-emerald-500',
    iconClassName: 'bg-emerald-50 text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    borderClassName: 'border-l-red-500',
    iconClassName: 'bg-red-50 text-red-500',
  },
  info: {
    icon: Info,
    borderClassName: 'border-l-sky-500',
    iconClassName: 'bg-sky-50 text-sky-500',
  },
}

/**
 * ToastContext
 * ----------------------------------------------------------------
 * Global state for lightweight toast notifications (save success,
 * errors, achievements unlocked).
 *
 * Public API (via useToast):
 * - addToast(message, type) — type is 'success' | 'error' | 'info'
 *   (defaults to 'info'). Each toast auto-dismisses after 3 seconds.
 *
 * The floating toast container is rendered inline within
 * ToastProvider (no separate Toast.jsx component, per the approved
 * architecture).
 * ----------------------------------------------------------------
 */
const ToastContext = createContext(undefined)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  /**
   * Removes a toast by id (called by the close button and by the
   * auto-dismiss timer).
   */
  const removeToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }, [])

  /**
   * Adds a new toast notification.
   *
   * @param {string} message - The text to display.
   * @param {'success' | 'error' | 'info'} [type] - Visual style
   *   and icon. Defaults to 'info'.
   */
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((previous) => [...previous, { id, message, type }])
  }, [])

  // Auto-dismiss: schedules removal of every active toast after
  // TOAST_DURATION_MS. Re-runs whenever `toasts` changes, clearing
  // any previously-scheduled timers to avoid leaks.
  useEffect(() => {
    if (toasts.length === 0) return

    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), TOAST_DURATION_MS)
    )

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [toasts, removeToast])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Floating toast container */}
      <div className="fixed top-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map((toast) => {
          const config = TOAST_TYPE_CONFIG[toast.type] ?? TOAST_TYPE_CONFIG.info
          const Icon = config.icon

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-xl border-l-4 bg-white px-4 py-3 shadow-lg ${config.borderClassName}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.iconClassName}`}>
                <Icon size={16} />
              </span>
              <p className="flex-1 pt-1 text-sm text-slate-700">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="mt-1 shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * useToast
 * ----------------------------------------------------------------
 * Hook for consuming ToastContext. Throws if used outside of
 * ToastProvider so misconfiguration is caught during development.
 *
 * @returns {{ addToast: (message: string, type?: 'success' | 'error' | 'info') => void }}
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}