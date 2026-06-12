import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { useSimulation } from '../hooks/useSimulation.js'

// ----------------------------------------------------------------
// TEMPORARY MOCK COMPONENTS
// ----------------------------------------------------------------
// Minimal placeholders so SimulationPage compiles and is fully
// testable end-to-end before their real implementations exist.
// Each will be replaced by an import from its architecture-approved
// location:
//
//   import PageContainer from '../components/layout/PageContainer.jsx'
//   import SimulationForm from '../components/simulation/SimulationForm.jsx'
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

/**
 * TODO: replace with components/simulation/SimulationForm.jsx
 *
 * Minimal mock of the real multi-step SimulationForm. Submits a
 * representative "dummy" inputs object matching the exact shape
 * simulationEngine.runSimulation() expects, so the page can be
 * exercised end-to-end (engine -> context -> results) before the
 * real form exists.
 */
function SimulationForm({ onSubmit, isSubmitting }) {
  const dummyInputs = {
    age: 24,
    gender: 'Perempuan',
    height: 165,
    weight: 60,
    sleepHours: '5-6 jam', // Ganti dari SIMULATION_OPTIONS
    waterIntake: 'Sedang', 
    exerciseFrequency: '1-2 kali per minggu',
    screenTime: '5-8 jam',
    stressLevel: 6,
    dietQuality: 'Cukup',
    target: 'Meningkatkan kebugaran',
    commitmentLevel: 7,
  }

  return (
    <div className="card flex flex-col items-center gap-4 py-12 text-center">
      <p className="max-w-md text-sm text-slate-500">
        Form simulasi lengkap (informasi pribadi, gaya hidup, target kesehatan,
        dan tingkat komitmen) akan ditampilkan di sini. Untuk saat ini, gunakan
        data contoh di bawah untuk menjalankan simulasi.
      </p>

      <button
        type="button"
        onClick={() => onSubmit(dummyInputs)}
        disabled={isSubmitting}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        Jalankan Simulasi
      </button>
    </div>
  )
}

// ----------------------------------------------------------------
// SimulationPage
// ----------------------------------------------------------------

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