import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { motion } from 'framer-motion'

/**
 * ProtectedRoute
 * ----------------------------------------------------------------
 * Authentication gate and transition wrapper for protected pages.
 *
 * Usage (matches AppRouter.jsx):
 * <Route
 * path="/dashboard"
 * element={
 * <ProtectedRoute>
 * <DashboardPage />
 * </ProtectedRoute>
 * }
 * />
 *
 * Behavior:
 * - Displays a smoothly fading-in loading state while checking session.
 * - Redirects to /auth (replace) if unauthenticated.
 * - Renders the requested page with a smooth fade-in transition
 * once authentication is confirmed.
 * ----------------------------------------------------------------
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Variabel animasi untuk konsistensi transisi
  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  }

  if (loading) {
    // TODO: replace inner div with <Spinner /> once components/ui/Spinner.jsx
    // is implemented.
    return (
      <motion.div 
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        className="flex min-h-screen items-center justify-center bg-slate-50"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Memuat...
          </p>
        </div>
      </motion.div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Membungkus children agar setiap halaman yang dirender memiliki transisi masuk
  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}