-- ----------------------------------------------------------------
-- FutureHealth — Supabase schema
-- ----------------------------------------------------------------
-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor.
-- Idempotent: aman dijalankan berulang kali.
--
-- Tabel:
--   profiles    — data profil user (dipakai SimulationPage auto-fill
--                 dan profileService.updateProfile).
--   simulations — riwayat simulasi (dipakai useSimulation,
--                 useSimulationHistory, DashboardPage, HistoryPage).
-- ----------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  age         int,
  gender      text,
  height_cm   numeric,
  weight_kg   numeric,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.simulations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  inputs      jsonb not null,
  results     jsonb not null,
  health_score int not null,
  target      text,
  created_at  timestamptz not null default now()
);

create index if not exists simulations_user_id_created_at_idx
  on public.simulations (user_id, created_at desc);

-- ----------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.simulations enable row level security;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users manage own simulations" on public.simulations;
create policy "Users manage own simulations" on public.simulations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- Trigger: buat baris profiles otomatis saat user baru terdaftar
-- (email/password maupun OAuth). Dipakai profileService.updateProfile
-- (upsert) & SimulationPage (auto-fill height/weight/age/gender).
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, updated_at)
  values (new.id, new.raw_user_meta_data ->> 'full_name', now())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- Trigger: updated_at selalu diperbarui saat baris diubah
-- (dibutuhkan oleh profileService.mapToDatabase).
-- ----------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
