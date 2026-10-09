// ------------------------------------------------------------------
// FutureHealth — Cloudflare Workers API
// ------------------------------------------------------------------
// Backend for the FutureHealth client:
//   * Auth: email/password (PBKDF2-SHA256 hashing) + opaque,
//     rotating bearer-token sessions (30-day expiry).
//   * Profile: get / update the user's profile row.
//   * Simulations: create, list, and fetch saved simulations.
//
// Storage: Cloudflare D1 (SQLite). Binding `DB` (see wrangler.toml).
//
// Response envelopes (matching what the client's services expect):
//   success -> { "data": ... }
//   failure -> { "error": { "message": "..." } } with HTTP 4xx/5xx.
// ------------------------------------------------------------------

// Environment binding used by every D1 call.
const DB_NAME = 'DB';

// CORS: public API, browser-friendly.
const BASE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// -------------------------------------------------------------------
// Small helpers
// -------------------------------------------------------------------
const encoder = new TextEncoder();

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...BASE_HEADERS, ...extraHeaders },
  });
}

function error(message, status) {
  return json({ error: { message } }, status);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(input) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function encodeB64(bytes) {
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

function decodeB64(value) {
  const bin = atob(value);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Base64URL (RFC 4648 §5) — used by Google's tokens and JWKS.
function base64urlDecode(str) {
  const b64 = String(str).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function clientUser(id, email, fullName, avatarUrl, createdAt) {
  const user = { id, email, user_metadata: { full_name: fullName } };
  if (avatarUrl) user.avatar_url = avatarUrl;
  if (createdAt) user.created_at = createdAt;
  return user;
}

// -------------------------------------------------------------------
// HTML helpers (used by the Google OAuth popup pages)
// -------------------------------------------------------------------
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...BASE_HEADERS },
  });
}

// -------------------------------------------------------------------
// HTML helpers (used by the Google OAuth popup pages)
// -------------------------------------------------------------------
const PBKDF2_ITERATIONS = 60000;

async function deriveKey(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const hashHex = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${encodeB64(salt)}$${hashHex}`;
}

async function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;
  let salt;
  try {
    salt = decodeB64(parts[2]);
  } catch {
    return false;
  }
  const hashHex = await deriveKey(password, salt, iterations);
  return hashHex === parts[3];
}

// -------------------------------------------------------------------
// Session helpers
// -------------------------------------------------------------------
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

async function createSession(env, userId) {
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await env[DB_NAME]
    .prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(tokenHash, userId, createdAt, expiresAt)
    .run();

  return { token, expiresAt };
}

async function getSessionUser(env, token) {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env[DB_NAME]
    .prepare(
      `SELECT s.user_id AS userId, s.expires_at AS expiresAt,
              u.id, u.email, u.full_name AS fullName
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?`
    )
    .bind(tokenHash)
    .first();

  if (!row) return null;

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await env[DB_NAME].prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    return null;
  }

  return {
    userId: row.userId,
    user: { id: row.id, email: row.email, fullName: row.fullName },
  };
}

// Requires a valid bearer token; throws 401 otherwise.
async function requireUser({ request, env }) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const session = await getSessionUser(env, token);
  if (!session) throw new ApiError('Sesi berakhir. Silakan masuk kembali.', 401);
  return session;
}

// -------------------------------------------------------------------
// Simulation row <-> JSON
// -------------------------------------------------------------------
function parseSimulation(row) {
  if (!row) return null;
  let inputs = row.inputs;
  let results = row.results;
  try {
    inputs = JSON.parse(row.inputs);
  } catch {
    inputs = {};
  }
  try {
    results = JSON.parse(row.results);
  } catch {
    results = {};
  }
  return { ...row, inputs, results };
}

// -------------------------------------------------------------------
// Google OAuth (Authorization Code + state; no PKCE — this is a
// confidential client because GOOGLE_CLIENT_SECRET lives in Worker
// secrets). Flow:
//
//   1. GET /auth/google?redirect_to=<spa-url>  -> issues `state`,
//      stores it in D1 (oauth_states), 302-redirects to Google.
//   2. Google redirects back to /auth/google/callback?code=..&state=..
//      The worker verifies state, exchanges the code for tokens at
//      oauth2.googleapis.com, verifies the id_token signature via
//      Google's JWKS (RS256, Web Crypto), finds or links the user,
//      creates a session, and serves an HTML page that postMessage's
//      the token back to the SPA popup.
//
// The `state` also carries the SPA URL to return to (redirect_to),
// so the callback always knows where to postMessage.
// -------------------------------------------------------------------

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_ISS = ['https://accounts.google.com', 'accounts.google.com'];
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_APP_ORIGIN = 'https://future-health-sdg3.vercel.app';

function safeOrigin(raw) {
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

// Only allow redirect targets that are the configured SPA origin or
// any http(s) localhost (local dev). Anything else is dropped so the
// OAuth `state` can never be abused as an open redirect.
function sanitizeRedirectTo(raw, appOrigin) {
  if (!raw) return appOrigin || DEFAULT_APP_ORIGIN;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return u.toString();
    const base = appOrigin || DEFAULT_APP_ORIGIN;
    if (u.origin === safeOrigin(base)) return u.toString();
  } catch {
    return null;
  }
  return null;
}

async function createOAuthState(env, redirectTo) {
  // Prune stale states on write (cheap, keeps the table small).
  await env[DB_NAME]
    .prepare('DELETE FROM oauth_states WHERE created_at < ?')
    .bind(new Date(Date.now() - OAUTH_STATE_TTL_MS).toISOString())
    .run();

  const state = randomHex(32);
  const now = new Date().toISOString();
  await env[DB_NAME]
    .prepare('INSERT INTO oauth_states (state, redirect_to, created_at) VALUES (?, ?, ?)')
    .bind(state, redirectTo, now)
    .run();
  return state;
}

async function consumeOAuthState(env, state) {
  if (!state) return null;
  const row = await env[DB_NAME]
    .prepare('SELECT redirect_to FROM oauth_states WHERE state = ?')
    .bind(state)
    .first();
  if (row) {
    await env[DB_NAME].prepare('DELETE FROM oauth_states WHERE state = ?').bind(state).run();
  }
  return row ? row.redirect_to : null;
}

// Google's signing keys (cached module-level; refreshed on expiry).
let googleJwksCache = null;
let googleJwksFetchedAt = 0;
const GOOGLE_JWKS_MAX_AGE_MS = 24 * 60 * 60 * 1000;

async function getGoogleJwks() {
  if (googleJwksCache && Date.now() - googleJwksFetchedAt < GOOGLE_JWKS_MAX_AGE_MS) {
    return googleJwksCache;
  }
  const res = await fetch(GOOGLE_JWKS_URL);
  if (!res.ok) throw new ApiError('Gagal mengambil kunci verifikasi Google.', 502);
  const data = await res.json();
  const keys = {};
  for (const key of Array.isArray(data.keys) ? data.keys : []) {
    if (key && key.kid && key.kty === 'RSA' && key.n && key.e) keys[key.kid] = key;
  }
  if (Object.keys(keys).length === 0) throw new ApiError('Kunci verifikasi Google kosong.', 502);
  googleJwksCache = keys;
  googleJwksFetchedAt = Date.now();
  return keys;
}

// Verifies the Google id_token (JWT, RS256) and returns its claims.
async function verifyGoogleIdToken(idToken, expectedAudience) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3) throw new ApiError('Token Google tidak valid.', 401);
  const [headerB64, payloadB64, sigB64] = parts;

  let header;
  try {
    header = JSON.parse(new TextDecoder().decode(base64urlDecode(headerB64)));
  } catch {
    throw new ApiError('Token Google tidak valid.', 401);
  }
  if (header.alg !== 'RS256') throw new ApiError('Algoritme token Google tidak didukung.', 401);

  const keys = await getGoogleJwks();
  const key = keys[header.kid];
  if (!key) throw new ApiError('Kunci token Google tidak ditemukan.', 401);

  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  let valid = false;
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      { kty: 'RSA', n: key.n, e: key.e, alg: 'RS256', use: 'sig' },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, base64urlDecode(sigB64), data);
  } catch {
    valid = false;
  }
  if (!valid) throw new ApiError('Verifikasi token Google gagal.', 401);

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
  } catch {
    throw new ApiError('Token Google tidak valid.', 401);
  }

  const now = Math.floor(Date.now() / 1000);
  if (!GOOGLE_ISS.includes(String(payload.iss || ''))) throw new ApiError('Issuer token Google tidak valid.', 401);
  if (payload.aud !== expectedAudience) throw new ApiError('Audience token Google tidak valid.', 401);
  if (typeof payload.exp !== 'number' || payload.exp <= now) throw new ApiError('Token Google telah kedaluwarsa.', 401);

  return payload;
}

// HTML page shown inside the popup: relays the auth result to the
// SPA through postMessage, then closes the window.
function oauthCallbackPage(redirectTo, result, errorMessage) {
  const target = safeOrigin(redirectTo) || '*';
  const payload = result
    ? { source: 'futurehealth-google-auth', token: result.token, expiresAt: result.expiresAt, user: result.user }
    : { source: 'futurehealth-google-auth', error: errorMessage };

  const message = errorMessage || 'Berhasil masuk. Jendela ini akan ditutup otomatis.';
  const script =
    '(function(){' +
    'var p = ' + JSON.stringify(payload) + ';' +
    'if (window.opener) {' +
    '  try { window.opener.postMessage(p, ' + JSON.stringify(target) + '); } catch (e) {}' +
    '  setTimeout(function () { window.close(); }, 400);' +
    '}' +
    '})();';

  return html(
    '<!doctype html><html lang="id"><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + escapeHtml(errorMessage ? 'Gagal masuk' : 'Berhasil masuk') + '</title>' +
      '<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;min-height:100vh;' +
      'display:flex;align-items:center;justify-content:center;background:#f8fafc;color:#0f172a">' +
      '<div style="text-align:center;padding:32px;max-width:360px">' +
      '<p style="font-size:18px;font-weight:600;margin:0 0 8px">' + escapeHtml(message) + '</p>' +
      '<p style="color:#64748b;font-size:14px;margin:0 0 16px">Jika jendela ini tidak menutup otomatis, tutup secara manual.</p>' +
      '<a href="' + escapeHtml(redirectTo || '/') + '" style="color:#059669;font-size:14px">Kembali ke FutureHealth</a>' +
      '</div><script>' + script + '</script></body></html>'
  );
}

async function startGoogleAuth({ request, env, url }) {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectTo = sanitizeRedirectTo(url.searchParams.get('redirect_to'), env.APP_ORIGIN) || DEFAULT_APP_ORIGIN;

  if (!clientId || !clientSecret) {
    return oauthCallbackPage(
      redirectTo,
      null,
      'Login dengan Google belum dikonfigurasi. Coba lagi nanti.'
    );
  }

  const state = await createOAuthState(env, redirectTo);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: new URL('/auth/google/callback', request.url).toString(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  });

  return Response.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`, 302);
}

async function googleAuthCallback({ env, url }) {
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');

  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;

  // The `state` must exist and match a live oauth_states row. Without
  // it this callback is not part of a flow we started, so reject it.
  const consumedRedirectTo = await consumeOAuthState(env, state);
  const redirectTo = consumedRedirectTo || env.APP_ORIGIN || DEFAULT_APP_ORIGIN;
  if (!consumedRedirectTo) {
    return oauthCallbackPage(
      redirectTo,
      null,
      'Sesi login tidak valid atau sudah kedaluwarsa. Silakan coba lagi.'
    );
  }

  if (errorParam) {
    return oauthCallbackPage(redirectTo, null, 'Anda membatalkan login dengan Google.');
  }
  if (!clientId || !clientSecret) {
    return oauthCallbackPage(redirectTo, null, 'Login dengan Google belum dikonfigurasi. Coba lagi nanti.');
  }
  if (!code) {
    return oauthCallbackPage(redirectTo, null, 'Kode otorisasi Google tidak valid.');
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: new URL('/auth/google/callback', url).toString(),
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData || !tokenData.id_token) {
    return oauthCallbackPage(redirectTo, null, 'Gagal menukar kode otorisasi Google. Coba lagi.');
  }

  let claims;
  try {
    claims = await verifyGoogleIdToken(tokenData.id_token, clientId);
  } catch (err) {
    return oauthCallbackPage(redirectTo, null, err instanceof ApiError ? err.message : 'Token Google tidak valid.');
  }

  if (claims.email_verified !== true) {
    return oauthCallbackPage(redirectTo, null, 'Harap verifikasi alamat email Google Anda terlebih dahulu.');
  }

  const email = String(claims.email || '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return oauthCallbackPage(redirectTo, null, 'Akun Google tidak memiliki alamat email yang valid.');
  }

  const fullName = String(claims.name || claims.given_name || '').trim() || null;
  const avatarUrl = String(claims.picture || '').trim() || null;
  const now = new Date().toISOString();

  const existing = await env[DB_NAME].prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  let userId;
  if (existing) {
    userId = existing.id;
    await env[DB_NAME]
      .prepare(
        'UPDATE users SET google_sub = COALESCE(google_sub, ?), full_name = COALESCE(?, full_name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?'
      )
      .bind(claims.sub, fullName, avatarUrl, userId)
      .run();
  } else {
    userId = crypto.randomUUID();
    await env[DB_NAME].batch([
      env[DB_NAME]
        .prepare(
          'INSERT INTO users (id, email, password_hash, google_sub, avatar_url, full_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(userId, email, '', claims.sub, avatarUrl, fullName, now),
      env[DB_NAME]
        .prepare('INSERT INTO profiles (id, full_name, created_at, updated_at) VALUES (?, ?, ?, ?)')
        .bind(userId, fullName, now, now),
    ]);
  }

  const { token, expiresAt } = await createSession(env, userId);
  return oauthCallbackPage(redirectTo, { token, expiresAt, user: clientUser(userId, email, fullName, avatarUrl) }, null);
}

// -------------------------------------------------------------------
// Handlers
// -------------------------------------------------------------------
async function register({ request, env }) {
  const body = await readJson(request);
  const email = String(body?.email ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');
  const fullName = String(body?.fullName ?? '').trim() || null;

  if (!email || !EMAIL_RE.test(email)) throw new ApiError('Alamat email tidak valid.', 400);
  if (password.length < 6) throw new ApiError('Kata sandi minimal 6 karakter.', 400);

  const existing = await env[DB_NAME].prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) throw new ApiError('Email sudah terdaftar.', 409);

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  await env[DB_NAME].batch([
    env[DB_NAME]
      .prepare('INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(userId, email, passwordHash, fullName, now),
    env[DB_NAME]
      .prepare('INSERT INTO profiles (id, full_name, created_at, updated_at) VALUES (?, ?, ?, ?)')
      .bind(userId, fullName, now, now),
  ]);

  const { token, expiresAt } = await createSession(env, userId);
  return json({ data: { token, expiresAt, user: clientUser(userId, email, fullName) } });
}

async function login({ request, env }) {
  const body = await readJson(request);
  const email = String(body?.email ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');

  if (!email || !password) throw new ApiError('Email dan kata sandi wajib diisi.', 400);

  const user = await env[DB_NAME].prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new ApiError('Email atau kata sandi salah.', 401);
  }

  const { token, expiresAt } = await createSession(env, user.id);
  return json({ data: { token, expiresAt, user: clientUser(user.id, user.email, user.full_name) } });
}

async function me(ctx) {
  const session = await requireUser(ctx);
  const userRow = await ctx.env[DB_NAME].prepare('SELECT created_at FROM users WHERE id = ?').bind(session.userId).first();
  const createdAt = userRow?.created_at || null;
  return json({ data: { user: clientUser(session.user.id, session.user.email, session.user.fullName, createdAt) } });
}

async function logout({ request, env }) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    const tokenHash = await sha256Hex(token);
    await env[DB_NAME].prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
  }
  return json({ data: { ok: true } });
}

async function getProfile(ctx) {
  const session = await requireUser(ctx);
  const row = await ctx.env[DB_NAME].prepare('SELECT * FROM profiles WHERE id = ?').bind(session.userId).first();
  if (!row) return json({ data: null });
  return json({ data: row });
}

async function putProfile(ctx) {
  const session = await requireUser(ctx);
  const body = await readJson(ctx.request);

  let existing = null;
  try {
    existing = await ctx.env[DB_NAME].prepare('SELECT * FROM profiles WHERE id = ?').bind(session.userId).first();
  } catch {
    existing = null;
  }

  const read = (k) => (body && body[k] !== undefined ? body[k] : null);
  const merged = {
    full_name: read('full_name') ?? existing?.full_name ?? session.user.fullName ?? null,
    age: read('age') ?? existing?.age ?? null,
    gender: read('gender') ?? existing?.gender ?? null,
    height_cm: read('height_cm') ?? existing?.height_cm ?? null,
    weight_kg: read('weight_kg') ?? existing?.weight_kg ?? null,
    avatar_url: read('avatar_url') ?? existing?.avatar_url ?? session.user.avatar_url ?? null,
  };

  const now = new Date().toISOString();
  const createdAt = existing?.created_at ?? now;

  await ctx.env[DB_NAME]
    .prepare(
      `INSERT INTO profiles (id, full_name, age, gender, height_cm, weight_kg, avatar_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET
         full_name = excluded.full_name,
         age = excluded.age,
         gender = excluded.gender,
         height_cm = excluded.height_cm,
         weight_kg = excluded.weight_kg,
         avatar_url = excluded.avatar_url,
         updated_at = excluded.updated_at`
    )
    .bind(
      session.userId,
      merged.full_name,
      merged.age,
      merged.gender,
      merged.height_cm,
      merged.weight_kg,
      merged.avatar_url,
      createdAt,
      now
    )
    .run();

  // Keep the user's display name in sync when the profile is edited.
  if (merged.full_name && merged.full_name !== session.user.fullName) {
    await ctx.env[DB_NAME]
      .prepare('UPDATE users SET full_name = ? WHERE id = ?')
      .bind(merged.full_name, session.userId)
      .run();
  }

  return json({ data: { id: session.userId, ...merged, created_at: createdAt, updated_at: now } });
}

// -------------------------------------------------------------------
// Avatar upload
// -------------------------------------------------------------------

async function uploadAvatar(ctx) {
  const session = await requireUser(ctx);
  const formData = await ctx.request.formData()
  const file = formData.get('avatar') as File | null

  if (!file) {
    return json({ error: 'File gambar wajib diisi.' }, 400)
  }

  const supportedFormats = ['image/png', 'image/jpeg', 'image/webp']
  if (!supportedFormats.includes(file.type)) {
    return json({ error: 'Format foto tidak didukung. Gunakan PNG, JPEG, atau WebP.' }, 400)
  }

  if (file.size > 5 * 1024 * 1024) {
    return json({ error: 'Foto terlalu besar. Maksimal 5MB.' }, 400)
  }

  const bytes = await file.arrayBuffer()
  const base64 = btoa(
    String.fromCharCode(...new Uint8Array(bytes))
  )
  const dataUrl = `data:${file.type};base64,${base64}`

  await ctx.env[DB_NAME]
    .prepare('UPDATE users SET avatar_url = ? WHERE id = ?')
    .bind(dataUrl, session.userId)
    .run()

  return json({ data: { avatar_url: dataUrl } })
}

async function listAchievements(ctx) {
  const session = await requireUser(ctx);
  const result = await ctx.env[DB_NAME]
    .prepare('SELECT achievement_key AS key FROM achievements WHERE user_id = ? ORDER BY unlocked_at ASC')
    .bind(session.userId)
    .all();
  return json({ data: result.results.map((row) => row.key) });
}

async function putAchievements(ctx) {
  const session = await requireUser(ctx);
  const body = await readJson(ctx.request);
  const keys = Array.isArray(body?.keys) ? body.keys : [];
  const uniqueKeys = [...new Set(keys.map((k) => String(k).trim()).filter(Boolean))];

  if (uniqueKeys.length > 0) {
    const now = new Date().toISOString();
    await ctx.env[DB_NAME].batch(
      uniqueKeys.map((achievementKey) =>
        ctx.env[DB_NAME]
          .prepare(
            `INSERT INTO achievements (user_id, achievement_key, unlocked_at)
             VALUES (?, ?, ?)
             ON CONFLICT (user_id, achievement_key) DO NOTHING`
          )
          .bind(session.userId, achievementKey, now)
      )
    );
  }

  const result = await ctx.env[DB_NAME]
    .prepare('SELECT achievement_key AS key FROM achievements WHERE user_id = ? ORDER BY unlocked_at ASC')
    .bind(session.userId)
    .all();
  return json({ data: result.results.map((row) => row.key) });
}

async function createSimulation(ctx) {
  const session = await requireUser(ctx);
  const body = await readJson(ctx.request);
  const inputs = body?.inputs;
  const results = body?.results;

  if (!inputs || typeof inputs !== 'object' || !results || typeof results !== 'object') {
    throw new ApiError('Data simulasi tidak lengkap.', 400);
  }

  const healthScore = Number(body?.health_score ?? results?.healthScore ?? 0);
  const target = body?.target ?? inputs?.target ?? null;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await ctx.env[DB_NAME]
    .prepare(
      'INSERT INTO simulations (id, user_id, inputs, results, health_score, target, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(id, session.userId, JSON.stringify(inputs), JSON.stringify(results), healthScore, target, now)
    .run();

  return json(
    { data: { id, user_id: session.userId, inputs, results, health_score: healthScore, target, created_at: now } },
    201
  );
}

async function listSimulations(ctx) {
  const session = await requireUser(ctx);
  const limit = Math.min(Math.max(Number(ctx.url.searchParams.get('limit')) || 50, 1), 100);
  const offset = Math.max(Number(ctx.url.searchParams.get('offset')) || 0, 0);

  const result = await ctx.env[DB_NAME]
    .prepare('SELECT * FROM simulations WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(session.userId, limit, offset)
    .all();

  return json({ data: result.results.map(parseSimulation) });
}

async function getSimulation(ctx, id) {
  const session = await requireUser(ctx);
  const row = await ctx.env[DB_NAME]
    .prepare('SELECT * FROM simulations WHERE id = ? AND user_id = ?')
    .bind(id, session.userId)
    .first();
  if (!row) throw new ApiError('Data simulasi tidak ditemukan.', 404);
  return json({ data: parseSimulation(row) });
}

// -------------------------------------------------------------------
// Router
// -------------------------------------------------------------------
async function route(ctx) {
  const { method, path } = ctx;

  if (path === '/auth/register' && method === 'POST') return register(ctx);
  if (path === '/auth/login' && method === 'POST') return login(ctx);
  if (path === '/auth/me' && method === 'GET') return me(ctx);
  if (path === '/auth/logout' && method === 'POST') return logout(ctx);
  if (path === '/auth/google' && method === 'GET') return startGoogleAuth(ctx);
  if (path === '/auth/google/callback' && method === 'GET') return googleAuthCallback(ctx);
  if (path === '/profile' && method === 'GET') return getProfile(ctx);
  if (path === '/profile' && method === 'PUT') return putProfile(ctx);
  if (path === '/profile/avatar' && method === 'POST') return uploadAvatar(ctx);
  if (path === '/achievements' && method === 'GET') return listAchievements(ctx);
  if (path === '/achievements' && method === 'PUT') return putAchievements(ctx);
  if (path === '/simulations' && method === 'POST') return createSimulation(ctx);
  if (path === '/simulations' && method === 'GET') return listSimulations(ctx);

  const matched = path.match(/^\/simulations\/([^/]+)$/);
  if (matched && method === 'GET') return getSimulation(ctx, matched[1]);

  return error('Rute tidak ditemukan.', 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: BASE_HEADERS });
    }

    try {
      return await route({ request, env, url, method: request.method, path: url.pathname });
    } catch (err) {
      if (err instanceof ApiError) return error(err.message, err.status);
      console.error('FutureHealth API error:', err);
      return error('Terjadi kesalahan pada server. Coba lagi.', 500);
    }
  },
};