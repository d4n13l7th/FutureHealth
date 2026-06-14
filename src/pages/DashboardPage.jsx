import { Link } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Calendar,
  Target,
  HeartPulse,
  Scale,
  Cake,
  History,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSimulationHistory } from '../hooks/useSimulationHistory.js'
import PageContainer from '../components/layout/PageContainer.jsx'
import WelcomeCard from '../components/dashboard/WelcomeCard.jsx'
import EmptyDashboardState from '../components/dashboard/EmptyDashboardState.jsx'
import QuickStatsRow from '../components/dashboard/QuickStatsRow.jsx'
import LastSimulationCard from '../components/dashboard/LastSimulationCard.jsx'

/**
 * DashboardPage
 * ----------------------------------------------------------------
 * Authenticated route ("/dashboard") — the post-login landing page.
 *
 * States:
 * - Loading: shown while useSimulationHistory is fetching.
 * - Error: shown if the history fetch fails.
 * - Empty: shown if the user has no simulations yet — encourages
 *   running their first simulation via EmptyDashboardState.
 * - Populated: WelcomeBanner + QuickStatsRow + LastSimulationCard,
 *   all driven by history[0] (the most recent simulation).
 * ----------------------------------------------------------------
 */
export default function DashboardPage() {
  const { user } = useAuth()
  const { history, isLoading, error } = useSimulationHistory()

  if (isLoading) {
    return (
      <PageContainer className="py-12">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-500">Memuat dasbor...</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      </PageContainer>
    )
  }

  const hasHistory = Array.isArray(history) && history.length > 0
  const latest = hasHistory ? history[0] : null

  return (
    <PageContainer className="py-12">
      {hasHistory ? (
        <div className="flex flex-col gap-6">
          <WelcomeBanner user={user} />
          <QuickStatsRow latest={latest} />
          <LastSimulationCard latest={latest} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <WelcomeBanner user={user} />
          <EmptyDashboardState />
        </div>
      )}
    </PageContainer>
  )
}