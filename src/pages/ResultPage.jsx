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
// TODO: Remove these mocks once the real components are generated.
// ----------------------------------------------------------------

/** TODO: replace with components/layout/PageContainer.jsx */
function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

/** TODO: replace with components/results/DisclaimerBanner.jsx */
function DisclaimerBanner({ text }) {
  return (
    <div className="mb-6 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700">
      <Info size={18} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  )
}

/** TODO: replace with components/results/HealthScoreCircle.jsx */
function HealthScoreCircle({ score, category }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1 px-8 py-6">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Skor Kesehatan
      </span>
      <span className="text-5xl font-bold text-emerald-500">{score}</span>
      <span className="text-sm text-slate-400">/ 100</span>
      <span className="pill mt-2">{category}</span>
    </div>
  )
}

/** TODO: replace with components/results/HealthAgeBadge.jsx */
function HealthAgeBadge({ actualAge, healthAge }) {
  return (
    <div className="card flex flex-1 items-center gap-3">
      <Cake size={20} className="text-amber-500" />
      <div>
        <p className="text-xs font-medium text-slate-400">Usia Kesehatan</p>
        <p className="text-lg font-semibold text-slate-900">
          {healthAge} <span className="text-sm text-slate-400">/ usia {actualAge}</span>
        </p>
      </div>
    </div>
  )
}

/** TODO: replace with components/results/BMICard.jsx */
function BMICard({ bmi, bmiCategory }) {
  return (
    <div className="card flex flex-1 items-center gap-3">
      <Scale size={20} className="text-sky-500" />
      <div>
        <p className="text-xs font-medium text-slate-400">BMI</p>
        <p className="text-lg font-semibold text-slate-900">
          {bmi} <span className="text-sm text-slate-400">({bmiCategory})</span>
        </p>
      </div>
    </div>
  )
}

/** TODO: replace with components/results/HealthTrendBadge.jsx */
function HealthTrendBadge({ trend }) {
  const trendConfig = {
    Improving: { icon: TrendingUp, label: 'Meningkat', color: 'text-emerald-500' },
    Declining: { icon: TrendingDown, label: 'Menurun', color: 'text-red-500' },
    Stable: { icon: Minus, label: 'Stabil', color: 'text-slate-400' },
  }
  const config = trendConfig[trend] ?? trendConfig.Stable
  const Icon = config.icon

  return (
    <div className="card flex flex-1 items-center gap-3">
      <Icon size={20} className={config.color} />
      <div>
        <p className="text-xs font-medium text-slate-400">Tren Kesehatan</p>
        <p className="text-lg font-semibold text-slate-900">{config.label}</p>
      </div>
    </div>
  )
}

/** TODO: replace with components/results/FutureSelfCard.jsx */
function FutureSelfCard({ futureSelf }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Diri Anda 12 Bulan Mendatang</h3>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-400">Berat Badan</dt>
          <dd className="font-medium text-slate-900">{futureSelf?.projectedWeight} kg</dd>
        </div>
        <div>
          <dt className="text-slate-400">Kebugaran</dt>
          <dd className="font-medium text-slate-900">{futureSelf?.fitness}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Kualitas Tidur</dt>
          <dd className="font-medium text-slate-900">{futureSelf?.sleepQuality}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Tingkat Stres</dt>
          <dd className="font-medium text-slate-900">{futureSelf?.stressTrend}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Kategori BMI</dt>
          <dd className="font-medium text-slate-900">{futureSelf?.bmiCategory}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Kesejahteraan</dt>
          <dd className="font-medium text-slate-900">{futureSelf?.overallWellbeing}</dd>
        </div>
      </dl>
    </div>
  )
}

/** TODO: replace with components/results/Timeline.jsx */
function Timeline({ timeline }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Perjalanan Kesehatan</h3>
      <div className="mt-4 flex flex-col gap-3">
        {timeline?.map((point) => (
          <div key={point.month} className="flex items-center gap-3">
            <span className="flex h-8 w-16 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700">
              {point.label}
            </span>
            <div className="h-2 flex-1 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${point.score}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-medium text-slate-700">
              {point.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** TODO: replace with components/results/ProgressChart.jsx (Recharts) */
function ProgressChart({ timeline }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Grafik Perkembangan Skor</h3>
      <p className="mt-1 text-sm text-slate-400">
        Visualisasi Recharts akan ditampilkan di sini ({timeline?.length ?? 0} titik data).
      </p>
      <div className="mt-4 h-40 rounded-xl bg-gradient-to-t from-emerald-50 to-transparent" />
    </div>
  )
}

/** TODO: replace with components/results/InsightsPanel.jsx */
function InsightsPanel({ insights, strongestFactor, weakestFactor }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Wawasan Kesehatan</h3>
      <p className="mt-2 text-sm text-slate-500">
        Faktor terkuat: <span className="font-medium text-emerald-600">{strongestFactor}</span> ·
        Faktor terlemah: <span className="font-medium text-amber-600">{weakestFactor}</span>
      </p>
      <div className="mt-4 space-y-2 text-sm">
        {insights?.strengths?.map((item, i) => (
          <p key={`s-${i}`} className="text-slate-600">✅ {item}</p>
        ))}
        {insights?.weaknesses?.map((item, i) => (
          <p key={`w-${i}`} className="text-slate-600">⚠️ {item}</p>
        ))}
      </div>
    </div>
  )
}

/** TODO: replace with components/results/RecommendationsList.jsx */
function RecommendationsList({ recommendations }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Rekomendasi</h3>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
        {recommendations?.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ul>
    </div>
  )
}

/** TODO: replace with components/results/RiskRadar.jsx */
function RiskRadar({ risks }) {
  const riskColor = {
    Tinggi: 'bg-red-100 text-red-700',
    Sedang: 'bg-amber-100 text-amber-700',
    Rendah: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Tingkat Risiko</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {risks?.map((risk) => (
          <span
            key={risk.factor}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${riskColor[risk.level] ?? 'bg-slate-100 text-slate-600'}`}
          >
            {risk.factor}: {risk.level}
          </span>
        ))}
      </div>
    </div>
  )
}

/** TODO: replace with components/results/NarrativeReport.jsx */
function NarrativeReport({ narrative }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">{narrative?.title}</h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
        {narrative?.paragraphs?.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}

/** TODO: replace with components/whatif/WhatIfPanel.jsx */
function WhatIfPanel() {
  return (
    <div className="card flex flex-col items-center gap-2 py-12 text-center">
      <SlidersHorizontal size={28} className="text-emerald-500" />
      <h3 className="font-semibold text-slate-900">Simulator What-If</h3>
      <p className="max-w-md text-sm text-slate-500">
        Ubah variabel gaya hidup (olahraga, tidur, air putih) dan lihat
        dampaknya secara instan terhadap skor kesehatan Anda.
      </p>
    </div>
  )
}

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