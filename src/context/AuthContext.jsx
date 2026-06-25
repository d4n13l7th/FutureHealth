import { createContext, useContext, useState, useEffect } from 'react'
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle as signInWithGoogleService,
  signOut as signOutService,
} from '../services/supabase.js'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

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
   */
  async function signIn(email, password) {
    return signInWithEmail(email, password)
  }

  /**
   * Registers a new user, then immediately attempts to sign them
   * in — bypassing the email confirmation flow entirely.
   *
   * Why: Supabase sometimes ignores the "disable email confirmation"
   * toggle due to caching. By signing in right after signup with
   * the same credentials, the user gets a valid session regardless
   * of whether their email is confirmed, as long as the Supabase
   * project has email auth enabled.
   */
  async function signUp(email, password, fullName) {
    const { data, error } = await signUpWithEmail(email, password, fullName)

    if (error) {
      return { data, error }
    }

    // If Supabase returned a session directly (email confirmation
    // disabled), we're done — onAuthStateChange will pick it up.
    if (data?.session) {
      return { data, error: null }
    }

    // Otherwise (email confirmation still active on Supabase's
    // side), attempt an immediate sign-in with the same credentials.
    // This works because the user *was* created in auth.users —
    // they just haven't clicked the confirmation link yet, but
    // Supabase allows sign-in for unconfirmed accounts when
    // "Confirm email" is disabled at the project level.
    const signInResult = await signInWithEmail(email, password)

    if (signInResult.error) {
      // Sign-in failed (e.g., email confirmation still truly
      // enforced). Return the original signup success data so the
      // caller can show a "check your email" message.
      return { data, error: null, requiresConfirmation: true }
    }

    return { data: signInResult.data, error: null }
  }

  async function signInWithGoogle() {
    return signInWithGoogleService()
  }

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}