import { useState } from 'react'
import { Navigate, useParams, Link } from 'react-router-dom'
import {
  LayoutGrid,
  Lightbulb,
  SlidersHorizontal,
  FileText,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { useSimulationContext } from '../context/SimulationContext.jsx'
import { useSimulationRecord } from '../hooks/useSimulationRecord.js'
import PageContainer from '../components/layout/PageContainer.jsx'
import DisclaimerBanner from '../components/results/DisclaimerBanner.jsx'
import HealthScoreCircle from '../components/results/HealthScoreCircle.jsx'
import HealthAgeBadge from '../components/results/HealthAgeBadge.jsx'
import BMICard from '../components/results/BMICard.jsx'
import HealthTrendBadge from '../components/results/HealthTrendBadge.jsx'
import FutureSelfCard from '../components/results/FutureSelfCard.jsx'
import Timeline from '../components/results/Timeline.jsx'
import ProgressChart from '../components/results/ProgressChart.jsx'
import InsightsPanel from '../components/results/InsightsPanel.jsx'
import RecommendationsList from '../components/results/RecommendationsList.jsx'
import RiskRadar from '../components/results/RiskRadar.jsx'
import NarrativeReport from '../components/results/NarrativeReport.jsx'
import WhatIfPanel from '../components/whatif/WhatIfPanel.jsx'

// ----------------------------------------------------------------
// Tab configuration
// ----------------------------------------------------------------

const ALL_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'whatif', label: 'What-If', icon: SlidersHorizontal },
  { id: 'narrative', label: 'Narrative', icon: FileText },
]

/**
 * Formats an ISO date string into Indonesian long-form date
 * (e.g. "14 Juni 2026"). Falls back to "-" if missing or invalid.
 */
function formatRecordDate(createdAt) {
  if (!createdAt) return '-'

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ----------------------------------------------------------------
// ResultsPage
// ----------------------------------------------------------------

/**
 * ResultsPage
 * ----------------------------------------------------------------
 * Dual-mode results dashboard:
 *
 * - Active mode ("/results", no :id param): displays the simulation
 *   currently held in SimulationContext (currentResult/currentInputs)
 *   — the most recent result from runAndSaveSimulation(). Fully
 *   interactive, including the What-If tab.
 *
 * - Read-only mode ("/history/:id"): loads a historical record via
 *   useSimulationRecord(id) and displays its stored results/inputs
 *   exactly as they were at that time. The What-If tab is hidden —
 *   What-If only makes sense against the current baseline, not a
 *   frozen historical snapshot.
 *
 * Both modes resolve to a single `resolvedResult`/`resolvedInputs`
 * pair consumed identically by every child component, which remain
 * unaware of which mode produced the data.
 * ----------------------------------------------------------------
 */
export default function ResultsPage() {
  const { id } = useParams()
  const { currentResult, currentInputs } = useSimulationContext()
  const { record, isLoading: isRecordLoading, error: recordError } = useSimulationRecord(id)

  const isReadOnly = Boolean(id)

  const [activeTab, setActiveTab] = useState('overview')

  // --- Read-only mode: loading state ---
  if (isReadOnly && isRecordLoading) {
    return (
      <PageContainer className="py-12">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-500">Memuat data simulasi...</p>
        </div>
      </PageContainer>
    )
  }

  // --- Read-only mode: error or missing/malformed record ---
  if (isReadOnly && (recordError || !record?.results)) {
    return (
      <PageContainer className="py-12">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>
              {recordError ?? 'Data simulasi tidak ditemukan atau telah dihapus.'}
            </span>
          </div>
          <Link to="/history" className="btn-secondary px-4 py-2 text-sm">
            <ArrowLeft size={16} />
            Kembali ke Riwayat
          </Link>
        </div>
      </PageContainer>
    )
  }

  // --- Active mode: no simulation in memory -> redirect ---
  if (!isReadOnly && !currentResult) {
    return <Navigate to="/simulation" replace />
  }

  // --- Resolve data source based on mode ---
  const resolvedResult = isReadOnly ? record.results : currentResult
  const resolvedInputs = isReadOnly ? record?.inputs : currentInputs

  // Hide the What-If tab entirely in read-only mode.
  const tabs = isReadOnly ? ALL_TABS.filter((tab) => tab.id !== 'whatif') : ALL_TABS
  const effectiveTab = isReadOnly && activeTab === 'whatif' ? 'overview' : activeTab

  return (
    <PageContainer className="py-12">
      {/* Read-only mode banner */}
      {isReadOnly && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="pill">Simulasi {formatRecordDate(record?.created_at)}</span>
          <Link to="/history" className="btn-secondary px-4 py-2 text-sm">
            <ArrowLeft size={16} />
            Kembali ke Riwayat
          </Link>
        </div>
      )}

      <DisclaimerBanner text={resolvedResult.disclaimer} />

      {/* Header: score + compact stat badges */}
      <div className="mb-8 grid gap-4 lg:grid-cols-[auto_1fr]">
        <HealthScoreCircle score={resolvedResult.healthScore} category={resolvedResult.category} />

        <div className="grid gap-4 sm:grid-cols-3">
          <HealthAgeBadge
            actualAge={resolvedInputs?.age}
            healthAge={resolvedResult.healthAge}
          />
          <BMICard bmi={resolvedResult.bmi} bmiCategory={resolvedResult.bmiCategory} />
          <HealthTrendBadge trend={resolvedResult.healthTrend} />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-100 pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = effectiveTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {effectiveTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <FutureSelfCard futureSelf={resolvedResult.futureSelf} />
          <Timeline timeline={resolvedResult.timeline} />
          <div className="lg:col-span-2">
            <ProgressChart timeline={resolvedResult.timeline} />
          </div>
        </div>
      )}

      {effectiveTab === 'insights' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <InsightsPanel
            insights={resolvedResult.insights}
            strongestFactor={resolvedResult.strongestFactor}
            weakestFactor={resolvedResult.weakestFactor}
          />
          <div className="flex flex-col gap-6">
            <RecommendationsList recommendations={resolvedResult.recommendations} />
            <RiskRadar risks={resolvedResult.risks} />
          </div>
        </div>
      )}

      {/* What-If tab only exists in active mode (tabs array already
          excludes it when isReadOnly, this is defense in depth) */}
      {!isReadOnly && effectiveTab === 'whatif' && <WhatIfPanel />}

      {effectiveTab === 'narrative' && <NarrativeReport narrative={resolvedResult.narrative} />}
    </PageContainer>
  )
}