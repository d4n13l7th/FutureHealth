import { supabase } from './supabase.js'

/**
 * profileService
 * ----------------------------------------------------------------
 * Dedicated CRUD service for the Supabase `profiles` table.
 *
 * CRITICAL FIELD-NAME MAPPING:
 * The Supabase schema stores height_cm / weight_kg.
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
 * Fetches the profile row for `userId` from the `profiles` table
 * and maps database column names to the frontend field names used
 * throughout the React app and simulationEngine.js.
 *
 * @param {string} userId - The auth user's UUID (auth.users.id).
 * @returns {Promise<{ data: object|null, error: Error|null }>}
 */
export async function getProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

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
 * Upserts the profile row for `userId` in the `profiles` table,
 * mapping frontend field names back to database column names
 * before sending the payload to Supabase.
 *
 * Uses upsert (insert + on-conflict update) so this function works
 * whether the profile row already exists or not, including for
 * OAuth users whose profile may have been auto-created by the
 * handle_new_user trigger without height/weight yet.
 *
 * @param {string} userId - The auth user's UUID (auth.users.id).
 * @param {object} profileData - Frontend-shaped profile fields.
 *   Accepted keys: full_name, age, gender, height, weight
 *   (plus any other `profiles` columns the caller wants to set).
 * @returns {Promise<{ data: object|null, error: Error|null }>}
 */
export async function updateProfile(userId, profileData) {
    try {
        const payload = mapToDatabase(userId, profileData)

        const { data, error } = await supabase
            .from('profiles')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .single()

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
 * Maps a raw Supabase `profiles` row (database shape) to the
 * frontend shape used by SimulationForm.jsx and simulationEngine.js:
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
 * names expected by the Supabase `profiles` schema:
 *   { height, weight, ... } -> { id, height_cm, weight_kg, updated_at, ... }
 *
 * Also injects `id` (required for upsert) and a fresh `updated_at`
 * timestamp.
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