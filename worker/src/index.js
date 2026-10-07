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

class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function clientUser(id, email, fullName) {
  return { id, email, user_metadata: { full_name: fullName } };
}

// -------------------------------------------------------------------
// Password hashing (PBKDF2-SHA256)
// Stored format: "pbkdf2$<iterations>$<saltB64>$<hashHex>"
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
  return json({ data: { user: clientUser(session.user.id, session.user.email, session.user.fullName) } });
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
  };

  const now = new Date().toISOString();
  const createdAt = existing?.created_at ?? now;

  await ctx.env[DB_NAME]
    .prepare(
      `INSERT INTO profiles (id, full_name, age, gender, height_cm, weight_kg, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET
         full_name = excluded.full_name,
         age = excluded.age,
         gender = excluded.gender,
         height_cm = excluded.height_cm,
         weight_kg = excluded.weight_kg,
         updated_at = excluded.updated_at`
    )
    .bind(
      session.userId,
      merged.full_name,
      merged.age,
      merged.gender,
      merged.height_cm,
      merged.weight_kg,
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
  if (path === '/profile' && method === 'GET') return getProfile(ctx);
  if (path === '/profile' && method === 'PUT') return putProfile(ctx);
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