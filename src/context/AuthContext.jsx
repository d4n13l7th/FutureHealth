import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle as signInWithGoogleService,
  signOut as signOutService,
  getCurrentUser,
} from '../services/backend.js'
import { clearToken } from '../services/api.js'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore the signed-in user from the stored bearer token. There
  // is no realtime auth subscription in the Cloudflare backend, so
  // the session state is derived from GET /auth/me at mount and
  // updated by the signIn/signUp/signOut actions below.
  useEffect(() => {
    let isMounted = true

    getCurrentUser().then(({ data, error }) => {
      if (!isMounted) return
      if (error) clearToken()
      setUser(error ? null : (data?.user ?? null))
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  /**
   * Signs in an existing user with email and password.
   */
  async function signIn(email, password) {
    const result = await signInWithEmail(email, password)
    if (!result.error) setUser(result.data.user)
    return result
  }

  /**
   * Registers a new user and signs them in immediately (the API
   * returns a session token on signup, so no confirmation flow is
   * involved).
   */
  async function signUp(email, password, fullName) {
    const result = await signUpWithEmail(email, password, fullName)
    if (!result.error) setUser(result.data.user)
    return result
  }

  async function signInWithGoogle() {
    return signInWithGoogleService()
  }

  async function signOut() {
    await signOutService()
    setUser(null)
  }

  const value = {
    user,
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