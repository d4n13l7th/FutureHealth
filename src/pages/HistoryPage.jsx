import { Loader2, AlertCircle, History as HistoryIcon, Calendar, Target, HeartPulse } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer.jsx'
import DisclaimerBanner from '../components/results/DisclaimerBanner.jsx'
import { useSimulationHistory } from '../hooks/useSimulationHistory.js'
import { DISCLAIMER } from '../services/simulationEngine.js'
import HistoryItemCard from '../components/history/HistoryItemCard.jsx'

const FALLBACK_VALUE = '-'

/**
 * HistoryPage
 * ----------------------------------------------------------------
 * Authenticated route ("/history") — the user's full simulation
 * history timeline.
 *
 * States:
 * - Loading: centered Loader2 spinner, matching DashboardPage.
 * - Error: red alert box, matching DashboardPage.
 * - Empty: fallback message if no simulations exist yet.
 * - Populated: maps `history` to HistoryItemCard entries.
 * ----------------------------------------------------------------
 */
export default function HistoryPage() {
  const { history, isLoading, error } = useSimulationHistory()

  if (isLoading) {
    return (
      <PageContainer className="py-12">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-500">Memuat riwayat simulasi...</p>
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

  return (
    <PageContainer className="py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title">Riwayat Simulasi</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Lihat seluruh simulasi yang pernah Anda jalankan dan lacak perkembangan
          skor kesehatan Anda dari waktu ke waktu.
        </p>
      </div>

      <DisclaimerBanner text={DISCLAIMER} />

      {/* Content */}
      {hasHistory ? (
        <div className="flex flex-col gap-4">
          {history.map((simulation) => (
            <HistoryItemCard key={simulation?.id ?? simulation?.created_at} simulation={simulation} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <HistoryIcon size={28} />
          </div>
          <p className="max-w-md text-sm text-slate-500">
            Anda belum memiliki riwayat simulasi. Jalankan simulasi pertama Anda
            untuk mulai melacak perjalanan kesehatan Anda.
          </p>
        </div>
      )}
    </PageContainer>
  )
}