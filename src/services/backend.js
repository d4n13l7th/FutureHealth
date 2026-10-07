/**
 * backend.js
 * ----------------------------------------------------------------
 * Client service layer for the FutureHealth API (Cloudflare
 * Workers + D1). This module is the single point of contact for
 * auth, profile, and simulation persistence.
 *
 * Every function returns `{ data, error }` (or `{ error }`) so
 * callers integrating with ToastContext and form handling keep
 * working unchanged.
 *
 * Auth uses an opaque bearer token stored under
 * `futurehealth_token` in localStorage (30-day TTL, enforced
 * server-side; the client clears it when a request returns 401).
 * ----------------------------------------------------------------
 */

import { apiFetch, setToken, clearToken, getToken } from './api.js'

const GOOGLE_NOT_AVAILABLE =
  'Masuk dengan Google belum tersedia di versi ini. Silakan pakai email & kata sandi.'

// Auth -------------------------------------------------------------------

export async function signUpWithEmail(email, password, fullName) {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      auth: false,
      body: { email, password, fullName },
    })
    setToken(data.token)
    return { data: { user: data.user }, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function signInWithEmail(email, password) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    })
    setToken(data.token)
    return { data: { user: data.user }, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export function signInWithGoogle() {
  return Promise.resolve({ data: null, error: new Error(GOOGLE_NOT_AVAILABLE) })
}

/**
 * Restores the signed-in user from the stored token via
 * GET /auth/me. Returns { data: { user }, error }; `error` is
 * non-null when no token exists or it is invalid/expired — the
 * caller should then call clearToken().
 */
export async function getCurrentUser() {
  if (!getToken()) return { data: null, error: null }
  try {
    const data = await apiFetch('/auth/me')
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function signOut() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' })
  } catch {
    // Best-effort: the token is cleared locally regardless.
  } finally {
    clearToken()
  }
  return { error: null }
}

// Profile -----------------------------------------------------------------

export async function getProfile() {
  try {
    const data = await apiFetch('/profile')
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function updateProfile(profileData) {
  try {
    const data = await apiFetch('/profile', { method: 'PUT', body: profileData })
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

// Simulations -------------------------------------------------------------

export async function saveSimulation(_userId, inputs, results) {
  try {
    const data = await apiFetch('/simulations', {
      method: 'POST',
      body: {
        inputs,
        results,
        health_score: results?.healthScore ?? 0,
        target: inputs?.target ?? null,
      },
    })
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function getSimulationHistory(_userId) {
  try {
    const data = await apiFetch('/simulations')
    return { data: data ?? [], error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function getSimulationById(id) {
  try {
    const data = await apiFetch(`/simulations/${encodeURIComponent(id)}`)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}