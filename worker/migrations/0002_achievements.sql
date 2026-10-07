-- ----------------------------------------------------------------
-- FutureHealth — Cloudflare D1 schema migration 0002
-- ----------------------------------------------------------------
-- Persistent achievements: which achievement keys a user has
-- unlocked, stored server-side so progress survives across
-- devices/sessions.
-- ----------------------------------------------------------------

-- Achievements: a user may unlock each achievement key at most once.
create table if not exists achievements (
  user_id         text not null references users(id) on delete cascade,
  achievement_key text not null,
  unlocked_at     text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  primary key (user_id, achievement_key)
);

create index if not exists achievements_user_id_idx on achievements (user_id);