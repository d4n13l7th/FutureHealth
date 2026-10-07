import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle, Info, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSimulation } from '../hooks/useSimulation.js'
import { getProfile } from '../services/profileService.js'
import SimulationForm from '../components/simulation/SimulationForm.jsx'
import PageContainer from '../components/layout/PageContainer.jsx'

/**
 * SimulationPage
 * ----------------------------------------------------------------
 * Route ("/simulation") where users configure and run a new
 * FutureHealth simulation. Accessible by both guests and
 * authenticated users.
 *
 * v2 additions:
 * - Reads location.state.fromRedirect to show an informative
 *   banner when the user was redirected here from /results.
 * - Fetches the authenticated user's profile (height, weight,
 *   age, gender) from Supabase and maps it into SimulationForm's
 *   `initialData` shape so fields auto-fill on mount.
 * ----------------------------------------------------------------
 */

/**
 * Maps a profile row (app shape from profileService.getProfile) to
 * SimulationForm's `initialData` shape. Only fields with real values
 * are included so defaults survive a partial profile.
 *
 * DB gender may be 'male'/'female' (OAuth / manual) while the form
 * uses Indonesian labels ('Laki-laki' / 'Perempuan').
 */
function profileToInitialData(profile) {
  if (!profile) return {}

  const genderMap = {
    male: 'Laki-laki',
    laki: 'Laki-laki',
    'laki-laki': 'Laki-laki',
    female: 'Perempuan',
    perempuan: 'Perempuan',
  }

  const initialData = {}

  if (Number(profile.age) > 0) initialData.age = Number(profile.age)
  if (Number(profile.height) > 0) initialData.height = Number(profile.height)
  if (Number(profile.weight) > 0) initialData.weight = Number(profile.weight)

  if (profile.gender) {
    const gender =
      genderMap[String(profile.gender).toLowerCase()] ?? profile.gender
    initialData.gender = gender
  }

  return initialData
}
export default function SimulationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { runAndSaveSimulation, isSimulating } = useSimulation()
  const [submitError, setSubmitError] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(() => Boolean(user))

  const fromRedirect = location.state?.fromRedirect === true

  // Fetch profile data for auto-filling the form (logged-in users only)
  useEffect(() => {
    if (!user) return

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flag loading harus di-reset tiap fetch dimulai (user bisa berganti)
    setIsLoadingProfile(true)

    getProfile(user.id).then(({ data }) => {
      if (!cancelled && data) {
        setProfileData(data)
      }
      if (!cancelled) setIsLoadingProfile(false)
    })

    return () => {
      cancelled = true
    }
  }, [user])

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

      {/* Redirect info banner */}
      {fromRedirect && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700">
          <Info size={18} className="mt-0.5 shrink-0" />
          <span>
            Anda dialihkan ke sini karena belum ada simulasi aktif. Silakan
            jalankan simulasi terlebih dahulu untuk melihat hasil proyeksi
            kesehatan Anda.
          </span>
        </div>
      )}

      {/* Error banner */}
      {submitError && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Simulation form — profileData auto-fills height, weight, age */}
      {isLoadingProfile ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-500">Memuat data profil...</p>
        </div>
      ) : (
        <SimulationForm
          initialData={profileToInitialData(profileData)}
          onSubmit={handleSimulationSubmit}
          isSubmitting={isSimulating}
        />
      )}
    </PageContainer>
  )
}