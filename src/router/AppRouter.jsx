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

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/sdg" element={<SDGPage />} />

        {/*
          /simulation and /results are PUBLIC so guests can try
          the simulator. useSimulation.js already guards persistence:
          `if (user) { saveSimulation(...) }` — guests run the engine
          but results are never written to Supabase.
        */}
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/results" element={<ResultsPage />} />

        {/* Protected routes (require login) */}
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
          path="/compare"
          element={<ProtectedRoute><CompareFuturesPage /></ProtectedRoute>}
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