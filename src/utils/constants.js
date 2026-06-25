/**
 * constants.js
 * ----------------------------------------------------------------
 * Centralized UI copy and content constants for FutureHealth.
 * All user-facing strings in Indonesian, making future i18n
 * extraction straightforward.
 * ----------------------------------------------------------------
 */

// ----------------------------------------------------------------
// App metadata
// ----------------------------------------------------------------

export const APP_NAME = 'FutureHealth'
export const APP_TAGLINE = 'Simulasi Kesehatan Masa Depan'

// ----------------------------------------------------------------
// Landing page content
// ----------------------------------------------------------------

export const LANDING_HERO = {
  badge: 'Simulasi Kesehatan Masa Depan',
  title: 'Meet Your',
  titleHighlight: 'Future Health',
  subtitle: 'Temukan bagaimana kebiasaan hari ini membentuk kesehatanmu di masa depan.',
  cta: 'Mulai Simulasi Saya',
}

export const LANDING_PROBLEM = {
  title: 'Tahu Pentingnya Sehat, Tapi Sulit Membayangkan Dampaknya?',
  paragraphs: [
    'Banyak orang mengetahui pentingnya hidup sehat, namun sulit memahami bagaimana keputusan kecil setiap hari dapat memengaruhi kesehatan mereka dalam jangka panjang.',
    'FutureHealth hadir untuk menjembatani kesenjangan tersebut melalui simulasi kesehatan masa depan.',
  ],
}

export const LANDING_HOW_IT_WORKS = {
  title: 'Cara Kerja FutureHealth',
  subtitle: 'Lima langkah sederhana untuk melihat cerminan dirimu di masa depan.',
  steps: [
    { title: 'Masukkan Kondisi Saat Ini', desc: 'Masukkan kondisi dan gaya hidup saat ini.' },
    { title: 'Pilih Target Kesehatan', desc: 'Pilih target kesehatan yang ingin dicapai.' },
    { title: 'Jalankan Simulasi', desc: 'Jalankan simulasi masa depan kesehatanmu.' },
    { title: 'Lihat Hasil Proyeksi', desc: 'Lihat hasil proyeksi kesehatan secara visual.' },
    { title: 'Ubah & Bandingkan', desc: 'Ubah kebiasaan dan bandingkan hasilnya.' },
  ],
}

export const LANDING_CTA = {
  title: 'Siap melihat dirimu di masa depan?',
  subtitle:
    '"Saya bisa melihat seperti apa diri saya di masa depan jika mulai mengubah kebiasaan saya hari ini."',
  cta: 'Mulai Simulasi Saya',
}

// ----------------------------------------------------------------
// Chatbot suggestion chips
// ----------------------------------------------------------------

export const CHATBOT_SUGGESTIONS = [
  'Apa arti skor saya?',
  'Bagaimana cara meningkatkan tidur?',
  'Jelaskan risiko saya',
  'Tips olahraga',
  'Apa itu BMI?',
  'Target kesehatan saya',
]

// ----------------------------------------------------------------
// Achievement definitions
// ----------------------------------------------------------------

export const ACHIEVEMENTS = [
  {
    key: 'future_planner',
    label: 'Future Planner',
    description: 'Menyelesaikan simulasi pertama Anda.',
    icon: '🎯',
  },
  {
    key: 'health_explorer',
    label: 'Health Explorer',
    description: 'Menjelajahi semua tab di halaman hasil.',
    icon: '🔍',
  },
  {
    key: 'consistency_builder',
    label: 'Consistency Builder',
    description: 'Menjalankan 5 simulasi atau lebih.',
    icon: '🔥',
  },
  {
    key: 'future_architect',
    label: 'Future Architect',
    description: 'Mencapai skor kesehatan 85+ dalam simulasi.',
    icon: '🏆',
  },
]

// ----------------------------------------------------------------
// SDG 3 content
// ----------------------------------------------------------------

export const SDG_PILLARS = [
  {
    key: 'prevention',
    title: 'Pencegahan Penyakit',
    description:
      'FutureHealth membantu pengguna memahami bagaimana kebiasaan harian dapat memengaruhi risiko penyakit tidak menular di masa depan, sehingga langkah pencegahan dapat dimulai lebih awal — sebelum masalah kesehatan benar-benar terjadi.',
  },
  {
    key: 'monitoring',
    title: 'Pemantauan Kesehatan',
    description:
      'Melalui pelacakan gaya hidup yang berkelanjutan dan proyeksi usia kesehatan, pengguna dapat memantau perkembangan kondisi mereka dari waktu ke waktu dan melihat dampak nyata dari setiap perubahan kebiasaan.',
  },
  {
    key: 'education',
    title: 'Edukasi & Kesadaran',
    description:
      'Wawasan dan rekomendasi yang dipersonalisasi membantu pengguna memahami faktor-faktor yang memengaruhi kesehatan mereka, meningkatkan kesadaran, dan mendorong pengambilan keputusan yang lebih sehat secara mandiri.',
  },
]

// ----------------------------------------------------------------
// Navigation links
// ----------------------------------------------------------------

export const NAV_LINKS_PUBLIC = [
  { to: '/', label: 'Beranda' },
  { to: '/sdg', label: 'SDG 3' },
]

export const NAV_LINKS_AUTHENTICATED = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/simulation', label: 'Simulasi' },
  { to: '/history', label: 'Riwayat' },
  { to: '/sdg', label: 'SDG 3' },
]
