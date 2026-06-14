// FILE: src/pages/AuthPage.jsx

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * AuthPage
 * ----------------------------------------------------------------
 * Public authentication page ("/auth"). Self-contained: toggles
 * between "Masuk" (sign in) and "Daftar" (sign up), plus Google
 * OAuth, via AuthContext.
 *
 * - While AuthContext.loading is true, shows a centered spinner.
 * - If `user` exists, redirects to /dashboard via <Navigate replace>.
 * - On successful sign in/up, AuthContext's onAuthStateChange
 * updates `user`, triggering the <Navigate> branch automatically.
 * - Errors from Supabase are surfaced inline.
 * ----------------------------------------------------------------
 */
export default function AuthPage() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Wait for initial session resolution
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  // Already authenticated -> redirect immediately.
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  function switchMode() {
    setIsSignUp((prev) => !prev)
    setError(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { error: authError } = isSignUp
        ? await signUp(email, password, fullName)
        : await signIn(email, password)

      if (authError) {
        setError(mapAuthError(authError))
      }
    } catch (err) {
      setError('Terjadi kesalahan tak terduga. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
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
          {/* Header */}
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
              <GoogleIcon />
            )}
            Masuk dengan Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              atau
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Email/password form */}
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
        </div>
      </div>
    </div>
  )
}

/**
 * Maps a raw Supabase auth error into a user-friendly Indonesian message.
 */
function mapAuthError(authError) {
  const message = authError?.message ?? ''

  if (message.includes('Invalid login credentials')) {
    return 'Email atau kata sandi salah. Silakan coba lagi.'
  }
  if (message.includes('User already registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk.'
  }
  if (message.includes('Password should be at least')) {
    return 'Kata sandi minimal harus 6 karakter.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Silakan konfirmasi email Anda terlebih dahulu sebelum masuk.'
  }

  return message || 'Terjadi kesalahan. Silakan coba lagi.'
}

/** Inline Google "G" logo (multi-color, no external asset needed). */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}