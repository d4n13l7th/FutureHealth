/**
 * api.js
 * ----------------------------------------------------------------
 * Low-level HTTP client for the FutureHealth API (Cloudflare
 * Workers + D1). All services talk to the backend through
 * `apiFetch`, which:
 *   - injects the bearer token (stored in localStorage) when present,
 *   - parses the `{ data }` / `{ error: { message } }` envelope,
 *   - throws an Error with the server's message for non-2xx
 *     responses, or a generic network/message on failures.
 *
 * The base URL comes from `import.meta.env.VITE_API_URL` and must
 * point at the deployed Workers URL (see .env.example).
 * ----------------------------------------------------------------
 */

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export const TOKEN_KEY = 'futurehealth_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage unavailable (e.g. privacy mode) — the session
    // simply resets on reload.
  }
}

export function clearToken() {
  setToken(null)
}

/**
 * Performs an authenticated HTTP request against the FutureHealth
 * API and unwraps the response envelope.
 *
 * @param {string} path - API path, e.g. '/auth/login'.
 * @param {{ method?: string, body?: object, auth?: boolean }} options
 * @returns {Promise<any>} The `data` field of a successful response.
 * @throws {Error} With the server's message for non-2xx responses.
 */
export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, auth = true } = options

  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (auth && token) headers['Authorization'] = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Terjadi kesalahan pada server. Coba lagi.')
  }

  return payload?.data ?? null
}