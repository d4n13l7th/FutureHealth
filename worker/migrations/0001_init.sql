-- ----------------------------------------------------------------
-- FutureHealth — Cloudflare D1 schema (SQLite)
-- ----------------------------------------------------------------
-- Backend for the FutureHealth React app. Replacements for the old
-- Supabase tables (profiles & simulations) plus the auth internals
-- (email/password users + opaque bearer-token sessions) that Supabase
-- used to provide.
--
-- Note: D1 is SQLite. Ids are TEXT (crypto.randomUUID()), timestamps
-- are ISO-8601 strings.
-- ----------------------------------------------------------------

-- Users: registered accounts.
create table if not exists users (
  id            text primary key,
  email         text not null unique,
  password_hash text not null,
  full_name     text,
  created_at    text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Sessions: SHA-256 hash of the bearer token returned to the client.
create table if not exists sessions (
  token_hash  text primary key,
  user_id     text not null references users(id) on delete cascade,
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at  text not null
);

create index if not exists sessions_user_id_idx on sessions (user_id);

-- Profiles: profile data (used by SimulationPage auto-fill and
-- profileService.updateProfile).
create table if not exists profiles (
  id          text primary key references users(id) on delete cascade,
  full_name   text,
  age         integer,
  gender      text,
  height_cm   real,
  weight_kg   real,
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Simulations: history of health simulations.
create table if not exists simulations (
  id           text primary key,
  user_id      text not null references users(id) on delete cascade,
  inputs       text not null,
  results      text not null,
  health_score integer not null,
  target       text,
  created_at   text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create index if not exists simulations_user_id_created_at_idx
  on simulations (user_id, created_at desc);