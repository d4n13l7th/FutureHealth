import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { useSimulation } from '../hooks/useSimulation.js'
import SimulationForm from '../components/simulation/SimulationForm.jsx'
import PageContainer from '../components/layout/PageContainer.jsx'

/**
 * SimulationPage
 * ----------------------------------------------------------------
 * Authenticated route ("/simulation") where users configure and
 * run a new FutureHealth simulation.
 *
 * Flow:
 *   1. SimulationForm collects lifestyle/profile inputs.
 *   2. handleSimulationSubmit calls runAndSaveSimulation(inputs)
 *      via useSimulation, which:
 *        - runs the deterministic simulationEngine
 *        - writes currentInputs/currentResult to SimulationContext
 *        - persists the record to Supabase (if authenticated)
 *   3. On success, navigates to /results (which reads
 *      SimulationContext.currentResult).
 *   4. On error, an inline banner is shown and the user remains on
 *      this page to retry.
 * ----------------------------------------------------------------
 */
export default function SimulationPage() {
  const navigate = useNavigate()
  const { runAndSaveSimulation, isSimulating } = useSimulation()
  const [submitError, setSubmitError] = useState(null)

  async function handleSimulationSubmit(inputs) {
    setSubmitError(null)

    const { error } = await runAndSaveSimulation(inputs)

    if (error) {
      setSubmitError(
        'Gagal menjalankan simulasi. Silakan periksa kembali data Anda dan coba lagi.'
      )
      return
    }

    navigate('/results')
  }

  return (
    <PageContainer className="py-12">
      {/* Page header */}
      <div className="mb-8 text-center sm:text-left">
        <span className="pill mb-3">
          <Sparkles size={14} />
          Simulasi Masa Depan
        </span>
        <h1 className="section-title">Atur Simulasi Masa Depan Anda</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Masukkan kondisi dan kebiasaan Anda saat ini, pilih target kesehatan,
          dan tentukan tingkat komitmen Anda. FutureHealth akan memproyeksikan
          bagaimana kebiasaan ini dapat membentuk kondisi Anda di masa depan.
        </p>
      </div>

      {/* Error banner */}
      {submitError && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Simulation form */}
      <SimulationForm onSubmit={handleSimulationSubmit} isSubmitting={isSimulating} />
    </PageContainer>
  )
}