import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { GitCompare } from 'lucide-react'

// Hooks & Services
import { useSimulationContext } from '../context/SimulationContext.jsx'
import { compareScenarios } from '../services/simulationEngine.js'

// Components
import PageContainer from '../components/layout/PageContainer.jsx'
import ScenarioCard from '../components/compare/ScenarioCard.jsx'
import ScenarioComparison from '../components/compare/ScenarioComparison.jsx'
import ComparisonSummary from '../components/compare/ComparisonSummary.jsx'

/**
 * CompareFuturesPage
 * ----------------------------------------------------------------
 * Authenticated route ("/compare") — side-by-side comparison of the
 * user's current simulation ("Scenario A") against a tweaked
 * alternative ("Scenario B").
 *
 * - Scenario A is always `currentInputs` from SimulationContext.
 * - Scenario B (`alternativeInputs`) starts as a copy of Scenario A
 * and is adjusted via ScenarioCard. It re-syncs itself during render
 * whenever a new baseline simulation arrives, so it can never go
 * stale (or stay null after an async first load).
 * - simulationEngine.compareScenarios() recomputes both full
 * simulations and their difference whenever either input changes.
 *
 * Guard: if currentInputs is null (no active simulation), redirects
 * to /simulation.
 * ----------------------------------------------------------------
 */
export default function CompareFuturesPage() {
  const { currentInputs } = useSimulationContext()
  const [alternativeInputs, setAlternativeInputs] = useState(currentInputs)
  const [prevCurrentInputs, setPrevCurrentInputs] = useState(currentInputs)

  // Re-sync Scenario B during render whenever the active simulation
  // (Scenario A) changes — after a new run or an async first load.
  // User edits to Scenario B are preserved because this only runs
  // when currentInputs itself changes.
  if (currentInputs !== prevCurrentInputs) {
    setPrevCurrentInputs(currentInputs)
    setAlternativeInputs(currentInputs)
  }

  const comparisonData = useMemo(() => {
    if (!currentInputs || !alternativeInputs) return null
    return compareScenarios(currentInputs, alternativeInputs)
  }, [currentInputs, alternativeInputs])

  // Guard: Redirect jika tidak ada simulasi aktif
  if (!currentInputs) {
    return <Navigate to="/simulation" replace />
  }

  // Transient frame: currentInputs loaded but state not yet re-synced.
  if (!comparisonData) {
    return null
  }

  const { resultA, resultB } = comparisonData

  return (
    <PageContainer className="py-12">
      {/* Page header */}
      <div className="mb-8">
        <span className="pill mb-3">
          <GitCompare size={14} />
          Compare Futures
        </span>
        <h1 className="section-title">Bandingkan Skenario</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Bandingkan proyeksi kesehatan Anda saat ini dengan skenario alternatif
          untuk memahami bagaimana perubahan kebiasaan dapat memengaruhi masa
          depan kesehatan Anda.
        </p>
      </div>

      {/* Konten Perbandingan */}
      <div className="flex flex-col gap-6">
        <ScenarioCard 
          alternativeInputs={alternativeInputs} 
          onChange={setAlternativeInputs} 
        />
        <ScenarioComparison 
          resultA={resultA} 
          resultB={resultB} 
        />
        <ComparisonSummary 
          data={comparisonData} 
        />
      </div>
    </PageContainer>
  )
}