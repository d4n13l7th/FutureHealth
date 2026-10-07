import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'FutureHealth: Variabel lingkungan Supabase belum diatur. ' +
    'Salin .env.example menjadi .env dan isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key'
)

/**
 * Skema database (tabel `profiles` & `simulations`, RLS, trigger
 * profil otomatis) ada di supabase/schema.sql — jalankan file itu
 * sekali di Supabase Dashboard > SQL Editor sebelum memakai fitur
 * auth, profil, dan riwayat simulasi.
 */

// ---------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------
export async function signUpWithEmail(email, password, fullName) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
}

export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard' },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

// ---------------------------------------------------------------
// Simulation history helpers
// ---------------------------------------------------------------
export async function saveSimulation(userId, inputs, results) {
  return supabase
    .from('simulations')
    .insert({
      user_id: userId,
      inputs,
      results,
      health_score: results.healthScore,
      target: inputs.target,
    })
    .select()
    .single()
}

export async function getSimulationHistory(userId) {
  return supabase
    .from('simulations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

/**
 * Fetches a single simulation record by its id. Used by
 * useSimulationRecord for the /history/:id read-only view.
 */
export async function getSimulationById(id) {
  return supabase
    .from('simulations')
    .select('*')
    .eq('id', id)
    .single()
}