import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Calendar, LogOut, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import PageContainer from '../components/layout/PageContainer.jsx'

const FALLBACK_NAME = 'Pengguna FutureHealth'
const FALLBACK_VALUE = '-'

/**
 * Formats an ISO date string into Indonesian long-form date
 * (e.g. "14 Juni 2026"). Falls back to "-" if missing or invalid.
 */
function formatJoinDate(createdAt) {
  if (!createdAt) return FALLBACK_VALUE

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return FALLBACK_VALUE

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * ProfilePage
 * ----------------------------------------------------------------
 * Authenticated route ("/profile") — user profile and settings
 * area.
 *
 * - Profile details card: avatar placeholder, full name (falls back
 *   to "Pengguna FutureHealth"), email, and account creation date.
 * - Actions section: danger-themed sign-out button. Handles the
 *   async signOut() flow defensively — shows a loading state on the
 *   button and surfaces any error via an inline AlertCircle banner.
 * - On successful sign-out, redirects to "/" (matching Navbar's
 *   post-signout behavior).
 * ----------------------------------------------------------------
 */
export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(null)

  const fullName = user?.user_metadata?.full_name || FALLBACK_NAME
  const email = user?.email || FALLBACK_VALUE
  const joinDate = formatJoinDate(user?.created_at)

  async function handleSignOut() {
    setLogoutError(null)
    setIsLoggingOut(true)

    try {
      const { error } = await signOut()

      if (error) {
        setLogoutError('Gagal keluar. Silakan coba lagi.')
        setIsLoggingOut(false)
        return
      }

      navigate('/')
    } catch (err) {
      setLogoutError('Terjadi kesalahan tak terduga. Silakan coba lagi.')
      setIsLoggingOut(false)
    }
  }

  return (
    <PageContainer className="py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* Page header */}
        <div>
          <h1 className="section-title">Profil Saya</h1>
          <p className="mt-2 text-slate-500">
            Kelola informasi akun dan preferensi FutureHealth Anda.
          </p>
        </div>

        {/* Profile details card */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <User size={28} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900">{fullName}</h2>
              <p className="text-sm text-slate-400">Anggota FutureHealth</p>
            </div>
          </div>

          <dl className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                <Mail size={16} />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">Email</dt>
                <dd className="truncate text-sm font-medium text-slate-900">{email}</dd>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">Bergabung Sejak</dt>
                <dd className="text-sm font-medium text-slate-900">{joinDate}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Error banner */}
        {logoutError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{logoutError}</span>
          </div>
        )}

        {/* Actions */}
        <div className="card">
          <h3 className="font-semibold text-slate-900">Akun</h3>
          <p className="mt-1 text-sm text-slate-500">
            Keluar dari akun FutureHealth Anda di perangkat ini.
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-3 font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            Keluar
          </button>
        </div>
      </div>
    </PageContainer>
  )
}