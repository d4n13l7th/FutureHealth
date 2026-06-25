import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Loader2, Chrome, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  function switchMode() {
    setIsSignUp((prev) => !prev)
    setError(null)
    setSuccessMessage(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      if (isSignUp) {
        const result = await signUp(email, password, fullName)

        if (result.error) {
          setError(mapAuthError(result.error))
          return
        }

        if (result.requiresConfirmation) {
          setSuccessMessage(
            'Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi, lalu kembali ke halaman ini untuk masuk.'
          )
          setIsSignUp(false)
          return
        }
      } else {
        const { error: authError } = await signIn(email, password)
        if (authError) {
          setError(mapAuthError(authError))
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan tak terduga. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    setSuccessMessage(null)
    setIsGoogleLoading(true)

    try {
      const { error: authError } = await signInWithGoogle()
      if (authError) {
        setError(mapAuthError(authError))
        setIsGoogleLoading(false)
      }
    } catch (err) {
      setError('Tidak dapat memulai proses masuk dengan Google.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isSignUp ? 'Buat Akun FutureHealth' : 'Selamat Datang Kembali'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isSignUp
                ? 'Mulai simulasikan masa depan kesehatanmu.'
                : 'Masuk untuk melanjutkan perjalanan kesehatanmu.'}
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success banner */}
          {successMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle size={18} className="mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Chrome size={18} />
            )}
            Masuk dengan Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              atau
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="label-text">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Anda"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label-text">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-text">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {isSignUp ? 'Daftar' : 'Masuk'}
            </button>
          </form>

          {/* Mode toggle */}
          <p className="mt-6 text-center text-sm text-slate-500">
            {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {isSignUp ? 'Masuk' : 'Daftar'}
            </button>
          </p>

          {/* Guest mode */}
          <div className="mt-4 border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-400">
              Hanya ingin mencoba?{' '}
              <Link
                to="/simulation"
                className="font-medium text-slate-500 underline decoration-slate-400 underline-offset-2 hover:text-emerald-600 hover:decoration-emerald-500"
              >
                Lanjutkan sebagai tamu
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function mapAuthError(authError) {
  const message = authError?.message ?? ''
  if (message.includes('Invalid login credentials'))
    return 'Email atau kata sandi salah. Silakan coba lagi.'
  if (message.includes('User already registered'))
    return 'Email ini sudah terdaftar. Silakan masuk.'
  if (message.includes('Password should be at least'))
    return 'Kata sandi minimal harus 6 karakter.'
  if (message.includes('Email not confirmed'))
    return 'Email belum dikonfirmasi. Coba daftar ulang atau hubungi support.'
  return message || 'Terjadi kesalahan. Silakan coba lagi.'
}