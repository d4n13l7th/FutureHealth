import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout.jsx'
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx'

// ----------------------------------------------------------------
// Route-level code splitting (React.lazy)
// ----------------------------------------------------------------
// Pages are split into their own chunks so the initial bundle no
// longer ships Dashboard/History/Compare/Profile/Results together.
// MainLayout and ProtectedRoute stay eager: the shell (Navbar,
// Footer, ChatWidget) must render immediately, and each lazy page
// suspends inside MainLayout's <Suspense> boundary around <Outlet>.
// ----------------------------------------------------------------
const LandingPage = lazy(() => import('../pages/LandingPage.jsx'))
const AuthPage = lazy(() => import('../pages/AuthPage.jsx'))
const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx'))
const SimulationPage = lazy(() => import('../pages/SimulationPage.jsx'))
const ResultsPage = lazy(() => import('../pages/ResultsPage.jsx'))
const HistoryPage = lazy(() => import('../pages/HistoryPage.jsx'))
const CompareFuturesPage = lazy(() => import('../pages/CompareFuturesPage.jsx'))
const SDGPage = lazy(() => import('../pages/SDGPage.jsx'))
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'))

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/sdg" element={<SDGPage />} />

        {/* Protected routes (require login) */}
        {/* Simulator requires an account per user directive: mulai
            simulasi wajib daftar/masuk. Unguarded visitors are sent
            to /auth and returned to the intended page afterwards. */}
        <Route
          path="/simulation"
          element={<ProtectedRoute><SimulationPage /></ProtectedRoute>}
        />
        <Route
          path="/results"
          element={<ProtectedRoute><ResultsPage /></ProtectedRoute>}
        />
        <Route
          path="/compare"
          element={<ProtectedRoute><CompareFuturesPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/history"
          element={<ProtectedRoute><HistoryPage /></ProtectedRoute>}
        />
        <Route
          path="/history/:id"
          element={<ProtectedRoute><ResultsPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
