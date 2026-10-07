-- ----------------------------------------------------------------
-- FutureHealth — Google OAuth support
-- ----------------------------------------------------------------
-- Adds Google identity fields to users (google_sub links an account
-- to a Google subject id; avatar_url stores the profile picture) and
-- the oauth_states table used by the Authorization-Code flow to store
-- the CSRF `state` token plus the app URL to redirect back to.
--
-- password_hash stays NOT NULL: Google-only accounts get an empty
-- string (''), which verifyPassword already rejects, so email/password
-- login stays impossible for those accounts until they set one.
-- ----------------------------------------------------------------

alter table users add column google_sub text;

alter table users add column avatar_url text;

create unique index if not exists users_google_sub_idx
  on users (google_sub) where google_sub is not null;

create table if not exists oauth_states (
  state       text primary key,
  redirect_to text,
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create index if not exists oauth_states_created_at_idx
  on oauth_states (created_at);