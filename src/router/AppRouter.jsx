import { Routes, Route } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout.jsx'
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx'

import LandingPage from '../pages/LandingPage.jsx'
import AuthPage from '../pages/AuthPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import SimulationPage from '../pages/SimulationPage.jsx'
import ResultsPage from '../pages/ResultsPage.jsx'
import HistoryPage from '../pages/HistoryPage.jsx'
import CompareFuturesPage from '../pages/CompareFuturesPage.jsx'
import SDGPage from '../pages/SDGPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

/**
 * AppRouter
 * ----------------------------------------------------------------
 * Defines the complete route map for FutureHealth.
 *
 * Structure:
 * - All routes are nested under `MainLayout`, which renders the
 *   Navbar, Footer, global ChatWidget, and an <Outlet /> for the
 *   active page.
 * - Protected routes (require an authenticated Supabase session)
 *   are wrapped individually with `ProtectedRoute`. This keeps the
 *   guard logic centralized in one component while still allowing
 *   each route to declare its own access requirement explicitly.
 * - `/results` and `/history/:id` both render `ResultsPage`.
 *   `ResultsPage` itself determines (via `useParams`) whether it is
 *   showing the "live" simulation from `SimulationContext` or a
 *   read-only historical record loaded by id.
 *
 * This component contains NO business logic, data fetching, or
 * auth checks — it is purely declarative routing.
 * ----------------------------------------------------------------
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/sdg" element={<SDGPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulation"
          element={
            <ProtectedRoute>
              <SimulationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history/:id"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <CompareFuturesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}