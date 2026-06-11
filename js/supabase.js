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
 * ----------------------------------------------------------------
 * Skema tabel yang disarankan (jalankan di Supabase SQL editor)
 * ----------------------------------------------------------------
 *
 * create table public.profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   full_name text,
 *   age int,
 *   gender text,
 *   height_cm numeric,
 *   weight_kg numeric,
 *   created_at timestamp with time zone default now()
 * );
 *
 * create table public.simulations (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users on delete cascade,
 *   inputs jsonb not null,
 *   results jsonb not null,
 *   health_score int not null,
 *   target text,
 *   created_at timestamp with time zone default now()
 * );
 *
 * alter table public.profiles enable row level security;
 * alter table public.simulations enable row level security;
 *
 * create policy "Users manage own profile" on public.profiles
 *   for all using (auth.uid() = id);
 *
 * create policy "Users manage own simulations" on public.simulations
 *   for all using (auth.uid() = user_id);
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