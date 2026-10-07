import { useMemo, useState } from 'react'
import { Loader2, AlertCircle, History as HistoryIcon } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer.jsx'
import DisclaimerBanner from '../components/results/DisclaimerBanner.jsx'
import Select from '../components/ui/Select.jsx'
import { useSimulationHistory } from '../hooks/useSimulationHistory.js'
import { DISCLAIMER } from '../services/simulationEngine.js'
import HistoryItemCard from '../components/history/HistoryItemCard.jsx'

/**
 * Sort options for the history list. Persisted-order independent —
 * each entry maps to a comparator branch in `sortHistory`.
 */
const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'score_high', label: 'Skor tertinggi' },
  { value: 'score_low', label: 'Skor terendah' },
]

/**
 * Best-effort timestamp (ms) of a history record; 0 when
 * created_at is missing/invalid so such records sort to the end.
 */
function timeOf(simulation) {
  const raw = simulation?.created_at
  if (!raw) return 0
  const ts = new Date(raw).getTime()
  return Number.isNaN(ts) ? 0 : ts
}

/**
 * Numeric health score for sorting; -Infinity when unavailable so
 * records without a score always sort below scored ones.
 */
function scoreOf(simulation) {
  const score = simulation?.results?.healthScore
  return typeof score === 'number' && !Number.isNaN(score) ? score : -Infinity
}

/**
 * Sorts a shallow copy of `list` by the given strategy key.
 * 'score_high'/'score_low' fall back to newest on ties.
 */
function sortHistory(list, sortBy) {
  return [...list].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return timeOf(a) - timeOf(b)
      case 'score_high':
        return scoreOf(b) - scoreOf(a) || timeOf(b) - timeOf(a)
      case 'score_low':
        return scoreOf(a) - scoreOf(b) || timeOf(b) - timeOf(a)
      default:
        return timeOf(b) - timeOf(a)
    }
  })
}

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

  const [targetFilter, setTargetFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  /**
   * Filter options derived from the targets actually present in the
   * history (deduplicated, insertion order preserved).
   */
  const targetOptions = useMemo(() => {
    const seen = new Set()
    const options = []
    for (const sim of history ?? []) {
      const target = sim?.target ?? sim?.inputs?.target
      if (target && !seen.has(target)) {
        seen.add(target)
        options.push({ value: target, label: target })
      }
    }
    return options
  }, [history])

  /**
   * The list actually rendered: filtered by target first, then
   * sorted by the selected strategy.
   */
  const visibleHistory = useMemo(() => {
    const list = Array.isArray(history) ? history : []
    const filtered = targetFilter
      ? list.filter((sim) => (sim?.target ?? sim?.inputs?.target) === targetFilter)
      : list
    return sortHistory(filtered, sortBy)
  }, [history, targetFilter, sortBy])

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
        <div>
          {/* Filter + sort controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5 sm:max-w-xs">
              <label htmlFor="history-target-filter" className="text-sm font-medium text-slate-500">
                Filter Target
              </label>
              <Select
                id="history-target-filter"
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                options={[{ value: '', label: 'Semua target' }, ...targetOptions]}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 sm:max-w-xs">
              <label htmlFor="history-sort" className="text-sm font-medium text-slate-500">
                Urutkan
              </label>
              <Select
                id="history-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          {/* List */}
          {visibleHistory.length > 0 ? (
            <div className="mt-6 flex flex-col gap-4">
              {visibleHistory.map((simulation) => (
                <HistoryItemCard
                  key={simulation?.id ?? simulation?.created_at}
                  simulation={simulation}
                />
              ))}
            </div>
          ) : (
            <div className="card mt-6 flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <HistoryIcon size={28} />
              </div>
              <p className="max-w-md text-sm text-slate-500">
                Tidak ada simulasi yang cocok dengan filter target tersebut.
              </p>
              <button
                type="button"
                onClick={() => setTargetFilter('')}
                className="btn-secondary mt-1 px-4 py-2 text-sm"
              >
                Tampilkan semua
              </button>
            </div>
          )}
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