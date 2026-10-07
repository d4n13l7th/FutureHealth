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

import { apiFetch, setToken, clearToken, getToken, API_ORIGIN } from './api.js'

const GOOGLE_NOT_AVAILABLE =
  'Masuk dengan Google belum tersedia di versi ini. Silakan pakai email & kata sandi.'

const GOOGLE_POPUP_WIDTH = 520
const GOOGLE_POPUP_HEIGHT = 640
const GOOGLE_POPUP_TIMEOUT_MS = 5 * 60 * 1000
const GOOGLE_AUTH_SOURCE = 'futurehealth-google-auth'

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

/**
 * Google OAuth via popup.
 *
 * Opens a popup pointing at `GET /auth/google?...` on the API origin.
 * The worker runs the Authorization-Code flow and, on success, serves
 * an HTML page that `postMessage`s the token back to this window
 * ({ source: 'futurehealth-google-auth', token, user, ... }) before
 * closing itself. Only messages from the API origin are accepted.
 *
 * Resolves `{ data: { user }, error }` (token stored on success).
 */
export function signInWithGoogle() {
  return new Promise((resolve) => {
    if (!API_ORIGIN) {
      resolve({ data: null, error: new Error(GOOGLE_NOT_AVAILABLE) })
      return
    }

    let authUrl
    try {
      const u = new URL('/auth/google', API_ORIGIN)
      if (typeof window !== 'undefined' && window.location?.href) {
        u.searchParams.set('redirect_to', window.location.href)
      }
      authUrl = u.toString()
    } catch {
      resolve({ data: null, error: new Error(GOOGLE_NOT_AVAILABLE) })
      return
    }

    const screenX = window.screenX ?? window.screenLeft ?? 0
    const screenY = window.screenY ?? window.screenTop ?? 0
    const outerWidth = window.outerWidth ?? window.innerWidth ?? 0
    const outerHeight = window.outerHeight ?? window.innerHeight ?? 0
    const left = screenX + (outerWidth - GOOGLE_POPUP_WIDTH) / 2
    const top = screenY + (outerHeight - GOOGLE_POPUP_HEIGHT) / 2

    let popup
    try {
      popup = window.open(
        authUrl,
        'futurehealth-google-auth',
        `popup=1,width=${GOOGLE_POPUP_WIDTH},height=${GOOGLE_POPUP_HEIGHT},left=${Math.max(left, 0)},top=${Math.max(top, 0)}`
      )
    } catch {
      popup = null
    }
    if (!popup) {
      resolve({
        data: null,
        error: new Error(
          'Pop-up diblokir oleh browser. Izinkan pop-up untuk situs ini lalu coba lagi.'
        ),
      })
      return
    }

    let settled = false
    let timeoutId
    let pollId

    const cleanup = () => {
      window.removeEventListener('message', onAuthMessage)
      if (timeoutId) clearTimeout(timeoutId)
      if (pollId) clearInterval(pollId)
    }

    const finish = (data, error) => {
      if (settled) return
      settled = true
      cleanup()
      try {
        if (!error) popup.close()
      } catch {
        // Ignore — the popup may already be gone.
      }
      resolve({ data, error })
    }

    timeoutId = setTimeout(() => {
      finish(
        null,
        new Error('Login dengan Google terlalu lama. Tutup pop-up dan coba lagi.')
      )
    }, GOOGLE_POPUP_TIMEOUT_MS)

    // If the user closes the popup, surface it as a cancellations.
    pollId = setInterval(() => {
      if (popup.closed) {
        finish(null, new Error('Anda menutup jendela login Google sebelum selesai.'))
      }
    }, 400)

    function onAuthMessage(event) {
      if (event.origin !== API_ORIGIN) return
      const msg = event.data
      if (!msg || typeof msg !== 'object' || msg.source !== GOOGLE_AUTH_SOURCE) return
      if (msg.error) {
        finish(null, new Error(msg.error))
      } else if (msg.token) {
        setToken(msg.token)
        finish({ user: msg.user }, null)
      } else {
        finish(null, new Error('Respons login Google tidak dikenali. Coba lagi.'))
      }
    }

    window.addEventListener('message', onAuthMessage)
  })
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

// Achievements ------------------------------------------------------------

export async function getAchievements() {
  try {
    const data = await apiFetch('/achievements')
    return { data: data ?? [], error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Persists a set of unlocked achievement keys for the signed-in user
 * (PUT /achievements). The userId comes from the bearer token, so it
 * is not passed as an argument. Returns { data, error } with `data`
 * being the full stored key list after the upsert.
 */
export async function syncAchievements(keys) {
  try {
    const data = await apiFetch('/achievements', {
      method: 'PUT',
      body: { keys: Array.isArray(keys) ? keys : [] },
    })
    return { data: data ?? [], error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}