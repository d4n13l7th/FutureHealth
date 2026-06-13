import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  LayoutGrid,
  Lightbulb,
  SlidersHorizontal,
  FileText,
  Info,
  Cake,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { useSimulationContext } from '../context/SimulationContext.jsx'
import PageContainer from '../components/layout/PageContainer.jsx'
import HealthScoreCircle from '../components/results/HealthScoreCircle.jsx'
import FutureSelfCard from '../components/results/FutureSelfCard.jsx'
import Timeline from '../components/results/Timeline.jsx'
import ProgressChart from '../components/results/ProgressChart.jsx'
import InsightsPanel from '../components/results/InsightsPanel.jsx'
import DisclaimerBanner from '../components/results/DisclaimerBanner.jsx'
import RecommendationsList from '../components/results/RecommendationsList.jsx'
import RiskRadar from '../components/results/RiskRadar.jsx'
import NarrativeReport from '../components/results/NarrativeReport.jsx'
import WhatIfPanel from '../components/whatif/WhatIfPanel.jsx'
import HealthAgeBadge from '../components/results/HealthAgeBadge.jsx'
import BMICard from '../components/results/BMICard.jsx'
import HealthTrendBadge from '../components/results/HealthTrendBadge.jsx'

// ----------------------------------------------------------------
// TEMPORARY MOCK COMPONENTS
// ----------------------------------------------------------------
// Minimal, self-contained placeholders so ResultsPage compiles and
// is fully navigable before their real implementations exist. Each
// will be replaced by an import from its architecture-approved
// location:
//
//   import PageContainer from '../components/layout/PageContainer.jsx'
//   import DisclaimerBanner from '../components/results/DisclaimerBanner.jsx'
//   import HealthScoreCircle from '../components/results/HealthScoreCircle.jsx'
//   import HealthAgeBadge from '../components/results/HealthAgeBadge.jsx'
//   import BMICard from '../components/results/BMICard.jsx'
//   import HealthTrendBadge from '../components/results/HealthTrendBadge.jsx'
//   import FutureSelfCard from '../components/results/FutureSelfCard.jsx'
//   import Timeline from '../components/results/Timeline.jsx'
//   import ProgressChart from '../components/results/ProgressChart.jsx'
//   import InsightsPanel from '../components/results/InsightsPanel.jsx'
//   import RecommendationsList from '../components/results/RecommendationsList.jsx'
//   import RiskRadar from '../components/results/RiskRadar.jsx'
//   import NarrativeReport from '../components/results/NarrativeReport.jsx'
//   import WhatIfPanel from '../components/whatif/WhatIfPanel.jsx'
//
// TODO: Remove these mocks once the real components are generated. status: DONE
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// Tab configuration
// ----------------------------------------------------------------

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'whatif', label: 'What-If', icon: SlidersHorizontal },
  { id: 'narrative', label: 'Narrative', icon: FileText },
]

// ----------------------------------------------------------------
// ResultsPage
// ----------------------------------------------------------------

/**
 * ResultsPage
 * ----------------------------------------------------------------
 * Authenticated route ("/results") displaying the full output of
 * simulationEngine.runSimulation() as a tabbed dashboard.
 *
 * Guard: if SimulationContext.currentResult is null (no active
 * simulation — e.g. direct navigation or a page refresh that lost
 * in-memory state), redirects to /simulation via <Navigate replace>
 * so the user can run a simulation first.
 *
 * All tab content is derived from a single `result` object, so
 * every view (score, future self, insights, narrative, what-if)
 * stays internally consistent.
 * ----------------------------------------------------------------
 */
export default function ResultsPage() {
  const { currentResult } = useSimulationContext()
  const [activeTab, setActiveTab] = useState('overview')

  // Critical guard — no active simulation to display.
  if (!currentResult) {
    return <Navigate to="/simulation" replace />
  }

  const result = currentResult

  return (
    <PageContainer className="py-12">
      <DisclaimerBanner text={result.disclaimer} />

      {/* Header: score + compact stat badges */}
      <div className="mb-8 grid gap-4 lg:grid-cols-[auto_1fr]">
        <HealthScoreCircle score={result.healthScore} category={result.category} />

        <div className="grid gap-4 sm:grid-cols-3">
          <HealthAgeBadge
            actualAge={result.futureSelf?.actualAge ?? result.healthAge}
            healthAge={result.healthAge}
          />
          <BMICard bmi={result.bmi} bmiCategory={result.bmiCategory} />
          <HealthTrendBadge trend={result.healthTrend} />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-100 pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

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
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <FutureSelfCard futureSelf={result.futureSelf} />
          <Timeline timeline={result.timeline} />
          <div className="lg:col-span-2">
            <ProgressChart timeline={result.timeline} />
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <InsightsPanel
            insights={result.insights}
            strongestFactor={result.strongestFactor}
            weakestFactor={result.weakestFactor}
          />
          <div className="flex flex-col gap-6">
            <RecommendationsList recommendations={result.recommendations} />
            <RiskRadar risks={result.risks} />
          </div>
        </div>
      )}

      {activeTab === 'whatif' && <WhatIfPanel />}

      {activeTab === 'narrative' && <NarrativeReport narrative={result.narrative} />}
    </PageContainer>
  )
}