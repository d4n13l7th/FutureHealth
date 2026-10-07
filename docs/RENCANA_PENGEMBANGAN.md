# FutureHealth — Spesifikasi Lengkap & Rencana Maksimal (Versi Cloudflare)

> Backend & database telah dimigrasikan dari Supabase ke **Cloudflare**.
> Auth, data, dan API kini ditangani oleh **Cloudflare Workers (`futurehealth-api`)** + **Cloudflare D1 (SQLite)**.
> Semua rujukan Supabase/PostgreSQL di bawah sudah diganti ke stack Cloudflare.

---

## Visi & Misi

**Visi:**
Menjadi platform simulasi kesehatan digital terdepan di Indonesia yang memberdayakan masyarakat untuk membuat keputusan hidup sehat berdasarkan data proyeksi personal.

**Misi:**
- Membuat edukasi kesehatan preventif dapat diakses semua kalangan
- Mengubah data gaya hidup menjadi wawasan yang actionable dan memotivasi
- Mendukung pencapaian SDG 3 melalui teknologi simulasi yang inklusif

---

## Target Pengguna (Persona)

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Mahasiswa (18-24)** | Mulai sadar kesehatan, jadwal tidak teratur | Tahu dampak begadang & fast food |
| **Pekerja Muda (25-35)** | Stres tinggi, kurang gerak, sibuk | Simulasi cepat, insight langsung |
| **Orang Tua (35-50)** | Mulai khawatir kondisi fisik | Proyeksi jangka panjang, pencegahan |
| **Tamu/Penasaran** | Belum mau daftar, ingin coba dulu | Akses instan tanpa login |

---

## Arsitektur Sistem Lengkap

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│                                                         │
│  Landing → Auth → Simulation → Results → Dashboard      │
│                ↓                                        │
│         SimulationEngine.js (Pure, Deterministic)       │
│         ChatbotEngine.js (Rule-based, No LLM)           │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTPS (fetch via src/services/api.js)
                       │  Base URL dari VITE_API_URL
┌─────────────────────▼───────────────────────────────────┐
│               CLOUDFLARE WORKER (Edge API)              │
│                   futurehealth-api                      │
│                                                         │
│  All routes di src/index.js:                            │
│  POST  /auth/register      → register                   │
│  POST  /auth/login         → login                      │
│  GET   /auth/me            → me                         │
│  POST  /auth/logout        → logout                     │
│  GET   /profile            → getProfile                 │
│  PUT   /profile            → putProfile                 │
│  POST  /simulations        → createSimulation           │
│  GET   /simulations        → listSimulations            │
│  GET   /simulations/:id    → getSimulation              │
│                                                         │
│  Auth: email/password (PBKDF2-SHA256)                   │
│  Sesi: opaque bearer token (30 hari)                    │
└─────────────────────┬───────────────────────────────────┘
                      │  D1 binding "DB"
┌─────────────────────▼───────────────────────────────────┐
│              CLOUDFLARE D1 (SQLite)                     │
│                                                         │
│  users, sessions, profiles, simulations                 │
│  (migrasi: worker/migrations/0001_init.sql)             │
└─────────────────────────────────────────────────────────┘
```

### Deployment & Env

| Item | Nilai |
|---|---|
| Worker URL | `https://futurehealth-api.solvox-worker.workers.dev` |
| D1 database | `futurehealth-db` (`29aa61d1-8b3c-4923-8978-b35f214ba7e0`) |
| Frontend env | `VITE_API_URL=https://futurehealth-api.solvox-worker.workers.dev` |
| Frontend URL | `https://future-health-sdg3.vercel.app` |

---

## Peta Halaman Lengkap

### Public (Semua Orang)

**`/` — Landing Page**
- Hero: "Meet Your Future Health" + ilustrasi diri sekarang vs masa depan
- Problem Section: mengapa orang gagal hidup sehat
- How It Works: 5 langkah simulasi
- Testimonial/Stats section (mock data edukatif)
- SDG 3 badge + penjelasan singkat
- CTA: Mulai Simulasi / Daftar Gratis

**`/sdg` — SDG 3 Page**
- Penjelasan mendalam SDG 3
- 3 pilar kontribusi FutureHealth
- Statistik kesehatan Indonesia (mock/referensi)
- CTA simulasi

**`/auth` — Login & Register**
- Toggle Login/Register
- (Google OAuth: rencana jangka menengah via Cloudflare)
- Email + Password
- Link "Lanjutkan sebagai tamu"

### Semi-Public (Tamu + User)

**`/simulation` — Halaman Simulasi**
- Banner info untuk tamu (hasil tidak disimpan)
- Multi-step wizard (3 langkah):
  - Step 1: Data Diri
  - Step 2: Gaya Hidup
  - Step 3: Target & Komitmen
- Progress bar antar step
- Validasi form per step

**`/results` — Hasil Simulasi**
- Tab Overview: FutureSelfCard + Timeline + ProgressChart
- Tab Insights: InsightsPanel + RecommendationsList + RiskRadar
- Tab What-If: Simulator interaktif
- Tab Narrative: Laporan personal AI-like
- Disclaimer banner selalu tampil
- Banner "Daftar untuk simpan hasil" (khusus tamu)
- Chatbot AI floating button

### Protected (Harus Login)

**`/dashboard` — Dashboard Utama**
- WelcomeCard (gradient, nama user)
- QuickStatsRow (4 kartu: Skor, BMI, Usia Kesehatan, Target)
- LastSimulationCard + link ke riwayat
- AchievementsStrip (badge pencapaian)
- CTA: Jalankan Simulasi Baru

**`/history` — Riwayat Simulasi**
- List semua simulasi (tanggal, target, skor)
- Filter/sort (terbaru, skor tertinggi)
- Link "Lihat Detail" → `/history/:id`
- Link "Bandingkan" → `/compare`

**`/history/:id` — Detail Riwayat**
- Sama dengan `/results` tapi mode read-only
- Tab What-If disembunyikan
- Banner "Simulasi [tanggal]"
- Tombol Kembali ke Riwayat

**`/compare` — Bandingkan Skenario**
- ScenarioCard: tweak Skenario B
- ScenarioComparison: side-by-side skor
- ComparisonSummary: selisih + estimasi waktu
- Pilihan "Simpan sebagai simulasi baru"

**`/profile` — Profil Pengguna**
- Avatar (inisial atau upload foto — R2/asset, rencana menengah)
- Nama lengkap, email, tanggal bergabung
- Edit profil (usia, tinggi, berat, gender) → `PUT /profile`
- Statistik akun: total simulasi, skor tertinggi, achievement
- Tombol Keluar (merah, dengan konfirmasi)

**`*` — 404 Not Found**
- Ikon, pesan ramah, tombol kembali ke Beranda

---

## Simulation Engine — Variabel Lengkap

(Engine berjalan **client-side**, tidak bergantung backend — tetap sama persis setelah migrasi.)

### Input Yang Dikumpulkan

| Kategori | Field | Tipe | Opsi |
|---|---|---|---|
| **Data Diri** | Usia | Number | 15-100 |
| | Jenis Kelamin | Select | Laki-laki / Perempuan |
| | Tinggi Badan | Number | 100-250 cm |
| | Berat Badan | Number | 30-300 kg |
| **Gaya Hidup** | Jam Tidur | Select | <5 / 5-6 / 7-8 / >8 jam |
| | Konsumsi Air | Select | <1L / 1-2L / 2-3L / >3L |
| | Frekuensi Olahraga | Select | Jarang / 1-2x / 3-4x / Setiap hari |
| | Kualitas Pola Makan | Select | Buruk / Sedang / Baik |
| | Tingkat Stres | Slider | 1-10 |
| **Kebiasaan** | Status Merokok | Select | Tidak / Mantan / Aktif |
| | Konsumsi Alkohol | Select | Tidak / Jarang / Sering |
| | Medical Check-up | Select | Rutin / Jarang / Tidak Pernah |
| **Target** | Target Kesehatan | Select | 4 opsi goal |
| | Tingkat Komitmen | Slider | 1-10 |

### Output Yang Dihasilkan

```
Health Score (0-100)
├── Current Score
├── Future Score (12 bulan)
├── Kategori: Sangat Baik / Baik / Sedang / Berisiko
│
BMI Analysis
├── BMI Value
├── BMI Category (Underweight/Normal/Overweight/Obese)
│
Health Age
├── Actual Age
├── Simulated Health Age
│
Health Trend
├── Improving / Stable / Declining
│
Timeline Proyeksi
├── Hari Ini → Bulan 1 → 3 → 6 → 12
│
Future Self Snapshot
├── Projected Weight
├── BMI Category
├── Fitness Level
├── Sleep Quality
├── Stress Trend
├── Overall Wellbeing
│
Insights
├── Strengths (array)
├── Weaknesses (array)
├── Dominant Factor
│
Recommendations (top 3, prioritized)
│
Risk Detection
├── Per factor: Rendah / Sedang / Tinggi
│
Narrative Report (5 paragraf personal)
│
Disclaimer (selalu tampil)
```

---

## Fitur Interaktif Lengkap

### What-If Simulator
```
Base Scenario (currentInputs)
         ↓
   User tweaks variable
   (sleep: 5-6 → 7-8 jam)
         ↓
   runWhatIf(baseInputs, overrides)
         ↓
   Compare: +12 poin, 3 bulan lebih cepat
         ↓
   [Terapkan] → jadi baseline baru
   [Reset]    → kembali ke awal
```

### Compare Futures
```
Skenario A (auto dari currentInputs)
         vs
Skenario B (dimodifikasi user)
         ↓
compareScenarios(A, B)
         ↓
┌─────────────┬─────────────┐
│ Skenario A  │ Skenario B  │
│ Skor: 65    │ Skor: 84    │
│ Sedang      │ Baik        │
└─────────────┴─────────────┘
Selisih: +19 poin
Skenario B 3 bulan lebih cepat mencapai target
```

### AI Chatbot (Rule-Based)
```
Intent Keywords → Context-Aware Response
─────────────────────────────────────────
"skor"      → "Skor kesehatan Anda 72/100, kategori Baik..."
"tidur"     → "Tidur Anda 5-6 jam. Idealnya 7-8 jam karena..."
"bmi"       → "BMI Anda 24.3, kategori Normal..."
"olahraga"  → "Anda olahraga 1-2x/minggu. Tingkatkan ke 3-4x..."
"stres"     → "Stres level 7/10 cukup tinggi. Coba teknik..."
"target"    → "Target Anda: Meningkatkan Kebugaran. Rekomendasi..."
"halo"      → Greeting personal dengan skor
Fallback    → Saran topik yang bisa ditanyakan
```

### Achievement System
```
🏆 Future Planner       → Selesaikan simulasi pertama
🔭 Health Explorer      → Buat 5 simulasi berbeda
📈 Consistency Builder  → Tingkatkan skor 10+ poin
🏗️ Future Architect    → Buat 3+ skenario berbeda
⚡ What-If Master       → Gunakan What-If 10+ kali
🌟 SDG Champion         → Kunjungi halaman SDG + simulasi
```

---

## Database Schema (Cloudflare D1 / SQLite)

Konfigurasi binding ada di `worker/wrangler.toml`, migrasi di `worker/migrations/0001_init.sql`.

```sql
-- Users: akun terdaftar
users
  id (text, PK)
  email (text, unique)
  password_hash (text)            -- format "pbkdf2$iter$saltB64$hashHex"
  full_name (text)
  created_at (text, ISO-8601)

-- Sessions: hash bearer token
sessions
  token_hash (text, PK)           -- SHA-256 dari token yang dikirim klien
  user_id (text, FK users.id)
  created_at (text)
  expires_at (text)               -- TTL 30 hari

-- Profiles: data profil (auth dari tabel users)
profiles
  id (text, PK, FK users.id)
  full_name (text)
  age (integer)
  gender (text)
  height_cm (real)
  weight_kg (real)
  created_at (text)
  updated_at (text)

-- Simulations: riwayat simulasi
simulations
  id (text, PK)
  user_id (text, FK users.id)
  inputs (text, JSON)             -- semua form inputs
  results (text, JSON)            -- semua engine outputs
  health_score (integer)          -- denormalized untuk query cepat
  target (text)                   -- denormalized untuk filter
  created_at (text)

-- (Rencana) achievements: badge yang sudah di-unlock
achievements
  id (text, PK)
  user_id (text, FK users.id)
  achievement_key (text)
  unlocked_at (text)
```

**Isolasi data (pengganti RLS Supabase):** tidak ada PostgreSQL/RLS. Setiap rute worker memanggil `requireUser()` lalu mengkueri dengan `WHERE user_id = ?` — user hanya bisa membaca/menulis datanya sendiri (lihat `getSimulation`, `listSimulations`, `putProfile`).

**Auto-profil (pengganti trigger `handle_new_user`):** saat `POST /auth/register`, worker membuat row `profiles` dalam satu batch bersama insert `users`.

---

## Alur Auth Lengkap (Cloudflare Workers)

```
Register Email
    → POST /auth/register {email, password, fullName}
    → Worker hash password (PBKDF2-SHA256) + insert users & profiles (batch)
    → Buat session (bearer token, 30 hari)
    → Response { token, expiresAt, user }
    → Token disimpan ke localStorage (key: futurehealth_token)
    → <Navigate to="/dashboard">

Login Email
    → POST /auth/login {email, password}
    → Worker verifikasi password, buat session baru
    → Response { token, expiresAt, user }
    → <Navigate to="/dashboard">

Session Check / Reload
    → GET /auth/me (Authorization: Bearer <token>)
    → Jika token valid → user tetap login
    → Jika 401 → clearToken() → kembali ke halaman auth

Mode Tamu
    → Langsung ke /simulation
    → runSimulation() berjalan normal
    → Hasil tampil di /results
    → API TIDAK dipanggil (if (user) { saveSimulation() })
    → Banner "Daftar untuk simpan hasil"

Logout
    → POST /auth/logout (hapus session di D1)
    → clearToken() + clearSimulation() di SimulationContext
    → <Navigate to="/">
```

**Frontend service:** `src/services/api.js` (HTTP client + bearer token + envelope `{data}`/`{error}`), `src/services/backend.js`, `src/services/profileService.js`, `src/services/achievementService.js`.

---

## Status & Prioritas Pengembangan Selanjutnya

### Segera (Bug Fix & Polish)
| Task | Status |
|---|---|
| Migrasi Supabase → Cloudflare (Worker + D1) | ✅ Selesai |
| Auth email (register/login/me/logout) di Worker | ✅ Selesai |
| Guest mode tanpa login | ✅ Selesai |
| Link "Lanjutkan sebagai tamu" di AuthPage | ✅ Selesai |
| Banner info tamu di SimulationPage | ✅ Selesai |
| Simpan & ambil simulasi via D1 (POST/GET /simulations) | ✅ Selesai |
| Profil (GET/PUT /profile) dengan auto-fill form | ✅ Selesai |

### Jangka Pendek (Fitur Penting)
| Task | Prioritas |
|---|---|
| Banner "Daftar untuk simpan" di ResultsPage untuk tamu | 🔴 Tinggi |
| Edit profil di ProfilePage (height, weight, age) lengkap UX | 🔴 Tinggi |
| Migrasi D1 untuk tabel `achievements` + AchievementsStrip | 🟡 Sedang |
| Toast notification saat simulasi berhasil disimpan | 🟡 Sedang |
| Filter/sort di HistoryPage | 🟡 Sedang |

### Jangka Menengah (Peningkatan UX)
| Task | Prioritas |
|---|---|
| Google OAuth (via Cloudflare Worker/Social — tanpa Supabase) | 🟡 Sedang |
| Avatar upload / file asset (Cloudflare R2 atau Workers Asset) | 🟢 Rendah |
| Export hasil simulasi ke PDF | 🟢 Rendah |
| Share hasil simulasi via link publik | 🟢 Rendah |
| Endpoint detail simulasi & pagination siap di History | 🟢 Rendah |
| Dark mode | 🟢 Rendah |
| Animasi transisi antar halaman (Framer Motion) | 🟢 Rendah |

### Jangka Panjang (Skala)
| Task | Prioritas |
|---|---|
| PWA (installable di mobile) | 🟢 Rendah |
| Notifikasi pengingat simulasi berkala | 🟢 Rendah |
| Integrasi LLM untuk chatbot lebih cerdas | 🟢 Rendah |
| Leaderboard komunitas (opsional, privasi-first) | 🟢 Rendah |
| Multi-bahasa (EN/ID) | 🟢 Rendah |

---

## Prinsip Desain

```
✅ Motivasi bukan menakut-nakuti
✅ Edukatif bukan klinis
✅ Visual bukan tabel data
✅ Personal bukan generik
✅ Cepat & responsif di mobile
✅ Disclaimer selalu tampil (bukan alat medis)
✅ Guest-friendly (coba dulu, daftar kemudian)

❌ Tidak ada warna merah dominan
❌ Tidak ada istilah medis teknis
❌ Tidak ada diagnosis penyakit
❌ Tidak ada data yang menakutkan tanpa konteks
```