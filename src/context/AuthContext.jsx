import { createContext, useContext, useState, useEffect } from 'react'
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle as signInWithGoogleService,
  signOut as signOutService,
} from '../services/supabase.js'

/**
 * AuthContext
 * ----------------------------------------------------------------
 * Single source of truth for authentication state across
 * FutureHealth. Wraps Supabase Auth session/user state and exposes
 * a small, stable API via the `useAuth()` hook.
 *
 * State:
 * - user:    the current Supabase auth user object, or null
 * - session: the current Supabase session object, or null
 * - loading: true while the initial session is being resolved
 *
 * Actions:
 * - signIn(email, password)
 * - signUp(email, password, fullName)
 * - signInWithGoogle()
 * - signOut()
 *
 * All actions return the underlying Supabase response
 * (`{ data, error }`) so calling components decide how to handle
 * errors and navigation (e.g. AuthPage redirects on success).
 * ----------------------------------------------------------------
 */
const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Hydrate initial state from any existing session (e.g. on
    // page reload, or after an OAuth redirect back to the app).
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Keep state in sync with sign-in, sign-out, token refresh,
    // and changes made in other tabs.
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!isMounted) return
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  /**
   * Signs in an existing user with email and password.
   * @returns {Promise<{ data, error }>}
   */
  async function signIn(email, password) {
    return signInWithEmail(email, password)
  }

  /**
   * Registers a new user with email, password, and full name.
   * @returns {Promise<{ data, error }>}
   */
  async function signUp(email, password, fullName) {
    return signUpWithEmail(email, password, fullName)
  }

  /**
   * Starts the Google OAuth sign-in flow. On success, Supabase
   * redirects the browser back to the app (see redirectTo in
   * services/supabase.js); the resulting session is picked up by
   * the onAuthStateChange listener above.
   * @returns {Promise<{ data, error }>}
   */
  async function signInWithGoogle() {
    return signInWithGoogleService()
  }

  /**
   * Signs the current user out. The onAuthStateChange listener
   * will clear `user`/`session` automatically once Supabase
   * confirms the sign-out.
   * @returns {Promise<{ error }>}
   */
  async function signOut() {
    return signOutService()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth
 * ----------------------------------------------------------------
 * Hook for consuming AuthContext. Throws if used outside of
 * AuthProvider so misconfiguration is caught during development
 * rather than producing confusing `undefined` errors downstream.
 *
 * @returns {{
 *   user: object|null,
 *   session: object|null,
 *   loading: boolean,
 *   signIn: (email: string, password: string) => Promise<object>,
 *   signUp: (email: string, password: string, fullName: string) => Promise<object>,
 *   signInWithGoogle: () => Promise<object>,
 *   signOut: () => Promise<object>,
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}