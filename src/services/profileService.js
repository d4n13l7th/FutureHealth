import { getProfile as fetchProfile, updateProfile as saveProfile } from './backend.js'

/**
 * profileService
 * ----------------------------------------------------------------
 * Dedicated read/update service for the `profiles` row, backed by
 * the Cloudflare Workers API (via backend.js).
 *
 * CRITICAL FIELD-NAME MAPPING:
 * The database schema stores height_cm / weight_kg.
 * The React frontend (SimulationForm.jsx, simulationEngine.js) uses
 * height / weight throughout.
 *
 * This service is the single translation boundary:
 * - getProfile:    DB { height_cm, weight_kg } → app { height, weight }
 * - updateProfile: app { height, weight } → DB { height_cm, weight_kg }
 *
 * No other file needs to know this mapping exists.
 *
 * Both functions return { data, error } for easy integration with
 * ToastContext: addToast(error.message, 'error').
 * ----------------------------------------------------------------
 */

/**
 * Fetches the profile row for `userId` from the worker API and maps
 * database column names to the frontend field names used throughout
 * the React app and simulationEngine.js.
 *
 * @param {string} _userId - The auth user's UUID (unused by the API;
 *   kept for signature compatibility with the old backend client).
 * @returns {Promise<{ data: object|null, error: Error|null }>}
 */
export async function getProfile(_userId) {
    try {
        const { data, error } = await fetchProfile()

        if (error) {
            return { data: null, error }
        }

        return {
            data: mapFromDatabase(data),
            error: null,
        }
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err : new Error('Gagal mengambil data profil.'),
        }
    }
}

/**
 * Saves the profile row for `userId` through the worker API
 * (PUT /profile is an upsert), mapping frontend field names back to
 * database column names before sending the payload.
 *
 * @param {string} userId - The auth user's UUID (unused by the API;
 *   kept for signature compatibility with the old backend client).
 * @param {object} profileData - Frontend-shaped profile fields.
 *   Accepted keys: full_name, age, gender, height, weight
 *   (plus any other `profiles` columns the caller wants to set).
 * @returns {Promise<{ data: object|null, error: Error|null }>}
 */
export async function updateProfile(userId, profileData) {
    try {
        const payload = mapToDatabase(userId, profileData)

        const { data, error } = await saveProfile(payload)

        if (error) {
            return { data: null, error }
        }

        return {
            data: mapFromDatabase(data),
            error: null,
        }
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err : new Error('Gagal menyimpan data profil.'),
        }
    }
}

// ----------------------------------------------------------------
// Internal mapping helpers
// ----------------------------------------------------------------

/**
 * Maps a raw `profiles` row (database shape) to the frontend shape
 * used by SimulationForm.jsx and simulationEngine.js:
 *   { height_cm, weight_kg, ... } -> { height, weight, ... }
 */
function mapFromDatabase(row) {
    if (!row) return null

    const { height_cm, weight_kg, ...rest } = row

    return {
        ...rest,
        height: height_cm ?? null,
        weight: weight_kg ?? null,
    }
}

/**
 * Maps a frontend-shaped profileData object to the database column
 * names expected by the `profiles` schema:
 *   { height, weight, ... } -> { id, height_cm, weight_kg, updated_at, ... }
 *
 * Also injects `id` (for parity with the upsert contract) and a
 * fresh `updated_at` timestamp (the worker ignores unknown keys and
 * stamps its own updated_at server-side).
 */
function mapToDatabase(userId, profileData) {
    const { height, weight, ...rest } = profileData

    return {
        ...rest,
        id: userId,
        ...(height !== undefined && { height_cm: height }),
        ...(weight !== undefined && { weight_kg: weight }),
        updated_at: new Date().toISOString(),
    }
}