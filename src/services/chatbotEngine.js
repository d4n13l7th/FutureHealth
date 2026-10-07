/**
 * chatbotEngine
 * ----------------------------------------------------------------
 * Local, rule-based logic engine for FutureHealth's AI Assistant.
 *
 * Like simulationEngine.js, this is intentionally DETERMINISTIC and
 * keyword-based — NO external AI APIs, NO machine learning. The
 * goal is an assistant that *feels* personalized and intelligent by
 * weaving live simulation data into canned, well-written responses.
 *
 * v2 additions:
 * - Expanded intents: greetings, thanks, goodbye, about app,
 *   SDG 3, help, diet, water, screen time, and more.
 * - Fuzzy matching: normalizes input (strips accents, handles
 *   common typos and abbreviations) before keyword matching.
 * - Many more keyword variations per intent so casual/informal
 *   Indonesian input is handled gracefully.
 *
 * `contextData` mirrors the shape of:
 *   {
 *     inputs:  SimulationContext.currentInputs  (raw form inputs),
 *     results: SimulationContext.currentResult  (runSimulation output)
 *   }
 * and may be `null` if the user hasn't run a simulation yet.
 * ----------------------------------------------------------------
 */

const RESPONSE_DELAY_MS = 800

const NO_SIMULATION_NOTICE =
  'Anda belum menjalankan simulasi, jadi saya belum bisa memberikan analisis yang personal. '

const FALLBACK_RESPONSE =
  'Maaf, saya belum memahami pertanyaan Anda. Anda bisa bertanya tentang skor kesehatan, BMI, tips tidur, olahraga, pola makan, tingkat stres, target kesehatan, apa itu FutureHealth, atau apa itu SDG 3. Ketik "bantuan" untuk melihat daftar topik yang tersedia.'

// ----------------------------------------------------------------
// Text normalization & fuzzy matching utilities
// ----------------------------------------------------------------

/**
 * Normalizes user input for more flexible keyword matching:
 * - Lowercases everything
 * - Strips common punctuation (?, !, ., etc.)
 * - Collapses repeated characters (e.g. "makasihhh" -> "makasih")
 * - Expands common Indonesian abbreviations & typos
 * - Trims and collapses whitespace
 */
function normalizeText(text) {
  let normalized = (text ?? '').toLowerCase()

  // Strip punctuation
  normalized = normalized.replace(/[?!.,;:'"()[\]{}]/g, '')

  // Collapse repeated chars (3+ of the same letter -> 2)
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1')

  // Common abbreviations & typos -> canonical form
  const ABBREVIATION_MAP = [
    [/\bap\b/g, 'apa'],
    [/\bapa ?itu\b/g, 'apa itu'],
    [/\bapa ?yg\b/g, 'apa yang'],
    [/\bapa ?yang\b/g, 'apa yang'],
    [/\bgmn\b/g, 'bagaimana'],
    [/\bgimana\b/g, 'bagaimana'],
    [/\bgmna\b/g, 'bagaimana'],
    [/\bbgmn\b/g, 'bagaimana'],
    [/\bcranya\b/g, 'caranya'],
    [/\bcra\b/g, 'cara'],
    [/\bkrn\b/g, 'karena'],
    [/\bkrna\b/g, 'karena'],
    [/\bkarna\b/g, 'karena'],
    [/\bknp\b/g, 'kenapa'],
    [/\bknapa\b/g, 'kenapa'],
    [/\btrs\b/g, 'terus'],
    [/\btrus\b/g, 'terus'],
    [/\byg\b/g, 'yang'],
    [/\bdr\b/g, 'dari'],
    [/\bdri\b/g, 'dari'],
    [/\bdgn\b/g, 'dengan'],
    [/\bga\b/g, 'tidak'],
    [/\bgk\b/g, 'tidak'],
    [/\bgak\b/g, 'tidak'],
    [/\btdk\b/g, 'tidak'],
    [/\bgpp\b/g, 'tidak apa-apa'],
    [/\bmksh\b/g, 'makasih'],
    [/\bmksd\b/g, 'maksud'],
    [/\bmksud\b/g, 'maksud'],
    [/\bmaksd\b/g, 'maksud'],
    [/\bthx\b/g, 'terima kasih'],
    [/\bty\b/g, 'terima kasih'],
    [/\btq\b/g, 'terima kasih'],
    [/\bmkasih\b/g, 'makasih'],
    [/\bmakasi\b/g, 'makasih'],
    [/\btrims\b/g, 'terima kasih'],
    [/\btrmksh\b/g, 'terima kasih'],
    [/\btrmkasih\b/g, 'terima kasih'],
    [/\btrimakasih\b/g, 'terima kasih'],
    [/\bterimakasih\b/g, 'terima kasih'],
    [/\bsdg\s?3\b/g, 'sdg tiga'],
    [/\bsdg\b/g, 'sdg'],
    [/\bweb\b/g, 'website'],
    [/\bsitus\b/g, 'website'],
    [/\baplikasi\b/g, 'aplikasi'],
    [/\bapp\b/g, 'aplikasi'],
    [/\bfi?tur\b/g, 'fitur'],
    [/\btdr\b/g, 'tidur'],
    [/\bstrees\b/g, 'stres'],
    [/\bstress\b/g, 'stres'],
    [/\bstrss\b/g, 'stres'],
    [/\bexercise\b/g, 'olahraga'],
    [/\bworkout\b/g, 'olahraga'],
    [/\bfitness\b/g, 'olahraga'],
    [/\bfitnes\b/g, 'olahraga'],
    [/\bgym\b/g, 'olahraga'],
    [/\bdiet\b/g, 'pola makan'],
    [/\bnutrisi\b/g, 'pola makan'],
    [/\bmkn\b/g, 'makan'],
    [/\bmkanan\b/g, 'makanan'],
    [/\bscreen ?time\b/g, 'screentime'],
    [/\blay?ar\b/g, 'screentime'],
    [/\bhp\b/g, 'screentime'],
    [/\bgadget\b/g, 'screentime'],
    [/\bmnm\b/g, 'minum'],
    [/\bmnuman\b/g, 'minuman'],
    [/\bthnks\b/g, 'terima kasih'],
    [/\bthanks\b/g, 'terima kasih'],
    [/\bthank you\b/g, 'terima kasih'],
    [/\bthank u\b/g, 'terima kasih'],
  ]

  for (const [pattern, replacement] of ABBREVIATION_MAP) {
    normalized = normalized.replace(pattern, replacement)
  }

  // Collapse whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim()

  return normalized
}

// ----------------------------------------------------------------
// Intent response builders
// ----------------------------------------------------------------

function getGreetingResponse(contextData) {
  const healthScore = contextData?.results?.healthScore

  if (healthScore != null) {
    return (
      `Halo! 👋 Skor kesehatan masa depan Anda saat ini adalah ${healthScore}/100. ` +
      'Ada yang ingin Anda tanyakan tentang tidur, olahraga, BMI, stres, atau target kesehatan Anda?'
    )
  }

  return (
    'Halo! 👋 Saya asisten FutureHealth. Anda bisa bertanya tentang skor kesehatan, BMI, ' +
    'tidur, olahraga, stres, pola makan, atau target kesehatan Anda. ' +
    'Jalankan simulasi terlebih dahulu agar saya bisa memberikan jawaban yang lebih personal!'
  )
}

function getThanksResponse() {
  return (
    'Sama-sama! 😊 Senang bisa membantu. Jika ada pertanyaan lain seputar kesehatan ' +
    'atau fitur FutureHealth, jangan ragu untuk bertanya kapan saja.'
  )
}

function getGoodbyeResponse() {
  return 'Sampai jumpa! 👋 Jaga kesehatan Anda selalu. Semoga kebiasaan sehat yang Anda bangun hari ini membawa hasil luar biasa di masa depan. 🌟'
}

function getAboutAppResponse() {
  return (
    '🌿 **FutureHealth** adalah platform simulasi kesehatan interaktif yang membantu Anda ' +
    'memvisualisasikan dampak gaya hidup terhadap kesehatan jangka panjang.\n\n' +
    'Fitur utama:\n' +
    '• 🔮 **Simulasi Kesehatan** — Proyeksikan kondisi 12 bulan ke depan\n' +
    '• 🎛️ **What-If Simulator** — Ubah variabel dan lihat dampak real-time\n' +
    '• ⚖️ **Compare Futures** — Bandingkan 2 skenario gaya hidup\n' +
    '• 🤖 **AI Assistant** — Saya! Siap menjawab pertanyaan Anda\n' +
    '• 📊 **History Tracking** — Lacak perkembangan skor Anda\n\n' +
    'Semua kalkulasi berjalan di perangkat Anda — aman, cepat, dan tanpa mengumpulkan data medis pribadi.'
  )
}

function getSDG3Response() {
  return (
    '🌍 **SDG 3 (Sustainable Development Goal 3)** adalah tujuan pembangunan berkelanjutan PBB ' +
    'ke-3 yang bertema **"Good Health and Well-being"** — memastikan kehidupan yang sehat dan ' +
    'mendorong kesejahteraan bagi semua orang di segala usia.\n\n' +
    'FutureHealth berkontribusi pada SDG 3 melalui 3 pilar:\n' +
    '• 🎯 **Pencegahan Penyakit** — Membantu memahami risiko sebelum terjadi\n' +
    '• 📈 **Pemantauan Kesehatan** — Melacak perkembangan gaya hidup\n' +
    '• 🧠 **Edukasi & Kesadaran** — Meningkatkan literasi kesehatan\n\n' +
    'Kunjungi halaman SDG kami untuk informasi lengkap!'
  )
}

function getHelpResponse() {
  return (
    '📋 Berikut topik yang bisa saya bantu:\n\n' +
    '• **Skor kesehatan** — "Berapa skor saya?"\n' +
    '• **BMI** — "Berapa BMI saya?"\n' +
    '• **Tidur** — "Tips tidur yang baik"\n' +
    '• **Olahraga** — "Bagaimana cara meningkatkan kebugaran?"\n' +
    '• **Stres** — "Bagaimana mengurangi stres?"\n' +
    '• **Pola makan** — "Tips makan sehat"\n' +
    '• **Air putih** — "Berapa banyak air yang harus diminum?"\n' +
    '• **Screen time** — "Dampak screen time"\n' +
    '• **Target kesehatan** — "Apa target saya?"\n' +
    '• **FutureHealth** — "Apa itu FutureHealth?"\n' +
    '• **SDG 3** — "Apa itu SDG 3?"\n\n' +
    'Jalankan simulasi terlebih dahulu untuk mendapatkan jawaban yang dipersonalisasi!'
  )
}

function getHealthScoreResponse(contextData) {
  const results = contextData?.results

  if (results?.healthScore != null) {
    return (
      `📊 Skor kesehatan masa depan Anda saat ini adalah **${results.healthScore}/100**, ` +
      `dengan kategori **"${results.category}"**.\n\n` +
      'Skor ini adalah proyeksi edukatif berdasarkan kebiasaan Anda saat ini, bukan diagnosis medis. ' +
      `Faktor terkuat Anda: **${results.strongestFactor}**, dan yang perlu ditingkatkan: **${results.weakestFactor}**.`
    )
  }

  return (
    NO_SIMULATION_NOTICE +
    'Skor kesehatan FutureHealth adalah angka 0-100 yang menggambarkan proyeksi kondisi ' +
    'kesehatan Anda di masa depan berdasarkan gaya hidup saat ini. Jalankan simulasi ' +
    'untuk melihat skor Anda!'
  )
}

function getBmiResponse(contextData) {
  const results = contextData?.results

  if (results?.bmi != null) {
    return (
      `⚖️ BMI (Indeks Massa Tubuh) Anda saat ini adalah **${results.bmi}**, yang termasuk ` +
      `dalam kategori **"${results.bmiCategory}"**.\n\n` +
      'BMI memberikan gambaran umum kategori berat badan, namun bukan satu-satunya indikator kesehatan. ' +
      'Faktor seperti komposisi otot, pola makan, dan aktivitas fisik juga sangat berpengaruh.'
    )
  }

  return (
    NO_SIMULATION_NOTICE +
    'BMI dihitung dari tinggi dan berat badan Anda untuk memberikan gambaran umum ' +
    'kategori berat badan (Underweight, Normal, Overweight, Obese). Jalankan simulasi untuk melihat BMI Anda!'
  )
}

function getSleepResponse(contextData) {
  const sleepHours = contextData?.inputs?.sleepHours
  const advice =
    '💤 Tips tidur berkualitas:\n' +
    '• Tidur 7-8 jam per malam secara konsisten\n' +
    '• Hindari layar gadget 30 menit sebelum tidur\n' +
    '• Buat jadwal tidur yang tetap setiap hari\n' +
    '• Pastikan ruangan gelap, sejuk, dan tenang\n' +
    '• Hindari kafein di sore/malam hari'

  if (!contextData) {
    return NO_SIMULATION_NOTICE + advice
  }

  if (!sleepHours) {
    return advice
  }

  if (sleepHours === '7-8 jam') {
    return (
      `✅ Durasi tidur Anda saat ini (${sleepHours}) sudah berada pada rentang ideal — ` +
      `pertahankan kebiasaan ini!\n\n${advice}`
    )
  }

  return `Durasi tidur Anda saat ini adalah "${sleepHours}".\n\n${advice}`
}

function getExerciseResponse(contextData) {
  const exerciseFrequency = contextData?.inputs?.exerciseFrequency
  const advice =
    '🏋️ Tips meningkatkan aktivitas fisik:\n' +
    '• Target minimal 150 menit aktivitas sedang per minggu\n' +
    '• Mulai bertahap — jalan kaki 30 menit sudah sangat bermanfaat\n' +
    '• Kombinasikan kardio dan latihan kekuatan\n' +
    '• Pilih olahraga yang Anda nikmati agar konsisten\n' +
    '• Idealnya olahraga 3-5 kali per minggu'

  if (!contextData) {
    return NO_SIMULATION_NOTICE + advice
  }

  if (!exerciseFrequency) {
    return advice
  }

  return `Saat ini Anda berolahraga "${exerciseFrequency}".\n\n${advice}`
}

function getStressResponse(contextData) {
  const stressLevel = contextData?.inputs?.stressLevel
  const advice =
    '🧘 Tips mengelola stres:\n' +
    '• Lakukan teknik pernapasan dalam (4-7-8)\n' +
    '• Meditasi atau mindfulness 10 menit per hari\n' +
    '• Olahraga teratur membantu menurunkan hormon stres\n' +
    '• Bicara dengan orang terdekat tentang perasaan Anda\n' +
    '• Batasi konsumsi berita dan media sosial yang berlebihan\n' +
    '• Pastikan istirahat dan waktu luang yang cukup'

  if (!contextData) {
    return NO_SIMULATION_NOTICE + advice
  }

  if (stressLevel == null) {
    return advice
  }

  const assessment =
    stressLevel >= 7
      ? '⚠️ Tingkat stres Anda cukup tinggi. Sangat disarankan untuk menerapkan strategi manajemen stres secara rutin.'
      : stressLevel >= 4
      ? 'Tingkat stres Anda berada di level sedang.'
      : '✅ Tingkat stres Anda tergolong rendah — pertahankan!'

  return `Tingkat stres yang Anda laporkan adalah **${stressLevel}/10**. ${assessment}\n\n${advice}`
}

function getDietResponse(contextData) {
  const dietQuality = contextData?.inputs?.dietQuality
  const advice =
    '🥗 Tips pola makan sehat:\n' +
    '• Perbanyak sayur dan buah (5 porsi per hari)\n' +
    '• Pilih karbohidrat kompleks (nasi merah, oat, roti gandum)\n' +
    '• Konsumsi protein yang cukup (ikan, ayam, tahu, tempe)\n' +
    '• Kurangi gula tambahan dan makanan ultra-proses\n' +
    '• Makan teratur dan tidak melewatkan sarapan\n' +
    '• Porsi makan seimbang: ½ sayur, ¼ protein, ¼ karbohidrat'

  if (!contextData) {
    return NO_SIMULATION_NOTICE + advice
  }

  if (!dietQuality) {
    return advice
  }

  return `Kualitas pola makan Anda saat ini: **"${dietQuality}"**.\n\n${advice}`
}

function getWaterResponse(contextData) {
  const waterIntake = contextData?.inputs?.waterIntake
  const advice =
    '💧 Tips konsumsi air putih:\n' +
    '• Target minimal 8 gelas (2 liter) per hari\n' +
    '• Minum segelas air putih saat bangun tidur\n' +
    '• Bawa botol minum ke mana-mana\n' +
    '• Minum sebelum merasa haus — haus adalah tanda dehidrasi ringan\n' +
    '• Tambah asupan saat berolahraga atau cuaca panas'

  if (!contextData) {
    return NO_SIMULATION_NOTICE + advice
  }

  if (!waterIntake) {
    return advice
  }

  return `Konsumsi air putih Anda saat ini: **"${waterIntake}"**.\n\n${advice}`
}

function getScreenTimeResponse(contextData) {
  const screenTime = contextData?.inputs?.screenTime
  const advice =
    '📱 Tips mengelola screen time:\n' +
    '• Batasi penggunaan layar non-produktif menjadi < 2 jam/hari\n' +
    '• Gunakan fitur "screen time limit" di smartphone\n' +
    '• Terapkan aturan "no screen" 1 jam sebelum tidur\n' +
    '• Ganti waktu layar dengan aktivitas outdoor\n' +
    '• Gunakan mode "night shift" atau filter cahaya biru di malam hari'

  if (!contextData) {
    return NO_SIMULATION_NOTICE + advice
  }

  if (!screenTime) {
    return advice
  }

  return `Screen time harian Anda saat ini: **"${screenTime}"**.\n\n${advice}`
}

function getTargetResponse(contextData) {
  const target = contextData?.inputs?.target
  const recommendations = contextData?.results?.recommendations

  if (!target) {
    return (
      NO_SIMULATION_NOTICE +
      'Saat menjalankan simulasi, Anda dapat memilih target seperti:\n' +
      '• Menurunkan berat badan\n' +
      '• Menambah berat badan\n' +
      '• Meningkatkan kebugaran\n' +
      '• Memperbaiki kualitas tidur\n' +
      '• Mengurangi stres\n' +
      '• Mempertahankan gaya hidup sehat'
    )
  }

  let response = `🎯 Target kesehatan Anda saat ini adalah **"${target}"**.`

  if (Array.isArray(recommendations) && recommendations.length > 0) {
    response += '\n\nRekomendasi untuk membantu mencapainya:\n'
    recommendations.forEach((rec, i) => {
      response += `${i + 1}. ${rec}\n`
    })
  }

  return response
}

function getRiskResponse(contextData) {
  const risks = contextData?.results?.risks

  if (!risks) {
    return (
      NO_SIMULATION_NOTICE +
      'FutureHealth menganalisis risiko pada 5 faktor utama: Tidur, Stres, Screen Time, Olahraga, dan Pola Makan. ' +
      'Jalankan simulasi untuk melihat profil risiko Anda.'
    )
  }

  let response = '⚠️ Profil risiko kesehatan Anda:\n\n'
  risks.forEach(({ factor, level }) => {
    const emoji = level === 'Tinggi' ? '🔴' : level === 'Sedang' ? '🟡' : '🟢'
    response += `${emoji} **${factor}**: ${level}\n`
  })

  const highRisks = risks.filter((r) => r.level === 'Tinggi')
  if (highRisks.length > 0) {
    response += `\nFokus utama perbaikan: **${highRisks.map((r) => r.factor).join(', ')}**`
  } else {
    response += '\n✅ Tidak ada faktor dengan risiko tinggi — pertahankan!'
  }

  return response
}

function getTimelineResponse(contextData) {
  const results = contextData?.results

  if (!results?.timeline) {
    return (
      NO_SIMULATION_NOTICE +
      'Setelah menjalankan simulasi, Anda akan melihat proyeksi skor kesehatan di bulan ke-0, 1, 3, 6, dan 12.'
    )
  }

  let response = '📈 Proyeksi timeline skor kesehatan Anda:\n\n'
  results.timeline.forEach(({ label, score }) => {
    response += `• **${label}**: ${score}/100\n`
  })
  response += `\nEstimasi waktu mencapai target: **${results.timeToGoal}**`

  return response
}

function getHealthAgeResponse(contextData) {
  const results = contextData?.results

  if (results?.healthAge != null) {
    const inputs = contextData?.inputs
    const actualAge = inputs?.age ?? '?'
    const diff = actualAge - results.healthAge

    let assessment
    if (diff > 0) {
      assessment = `Ini berarti tubuh Anda secara simulatif **${diff} tahun lebih muda** dari usia kronologis — terus pertahankan! 🎉`
    } else if (diff < 0) {
      assessment = `Ini berarti tubuh Anda secara simulatif **${Math.abs(diff)} tahun lebih tua** dari usia kronologis. Masih bisa diperbaiki!`
    } else {
      assessment = 'Usia kesehatan Anda sesuai dengan usia kronologis.'
    }

    return (
      `🏥 Usia kesehatan (health age) Anda: **${results.healthAge} tahun** (usia kronologis: ${actualAge} tahun).\n\n` +
      `${assessment}\n\n` +
      'Catatan: ini adalah simulasi edukatif, bukan penilaian medis.'
    )
  }

  return (
    NO_SIMULATION_NOTICE +
    'Health Age adalah estimasi "usia biologis" berdasarkan gaya hidup Anda. ' +
    'Jalankan simulasi untuk melihat berapa usia kesehatan Anda!'
  )
}

// ----------------------------------------------------------------
// Intent registry
// ----------------------------------------------------------------
// Checked in order; the first intent whose keywords appear in the
// (normalized) message wins. More specific intents are placed
// before broader ones where overlap is possible.
// ----------------------------------------------------------------

const INTENTS = [
  // --- Greetings ---
  {
    keywords: [
      'halo', 'hai', 'hi', 'hello', 'hey', 'hei',
      'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
      'pagi', 'siang', 'sore', 'malam',
      'assalamualaikum', 'assalamu', 'waalaikum',
    ],
    getResponse: getGreetingResponse,
  },

  // --- Thanks & appreciation ---
  {
    keywords: [
      'terima kasih', 'makasih', 'thanks', 'thank',
      'trima kasih', 'trmakasih', 'nuhun', 'matur nuwun',
      'tengkyu', 'sankyu',
    ],
    getResponse: getThanksResponse,
  },

  // --- Goodbye ---
  {
    keywords: [
      'sampai jumpa', 'bye', 'dadah', 'daa',
      'selamat tinggal', 'pamit', 'duluan',
      'sampai ketemu', 'see you',
    ],
    getResponse: getGoodbyeResponse,
  },

  // --- About FutureHealth ---
  {
    keywords: [
      'futurehealth', 'future health', 'tentang aplikasi',
      'apa ini', 'aplikasi ini', 'website ini',
      'tentang website', 'tentang web', 'tentang situs',
      'apa itu futurehealth', 'apa futurehealth',
      'platform ini', 'tentang platform',
    ],
    getResponse: getAboutAppResponse,
  },

  // --- SDG 3 ---
  {
    keywords: [
      'sdg tiga', 'sdg', 'sustainable development',
      'tujuan pembangunan', 'pembangunan berkelanjutan',
      'good health', 'well-being', 'wellbeing',
      'pbb', 'united nations',
    ],
    getResponse: getSDG3Response,
  },

  // --- Help / features ---
  {
    keywords: [
      'bantuan', 'help', 'bisa apa', 'fitur',
      'apa saja', 'menu', 'topik', 'daftar',
      'bisa tanya apa', 'cara pakai',
      'cara menggunakan', 'panduan',
    ],
    getResponse: getHelpResponse,
  },

  // --- Risk ---
  {
    keywords: ['risiko', 'resiko', 'risk', 'bahaya', 'deteksi risiko'],
    getResponse: getRiskResponse,
  },

  // --- Health Age ---
  {
    keywords: ['usia kesehatan', 'health age', 'umur kesehatan', 'usia biologis', 'umur biologis'],
    getResponse: getHealthAgeResponse,
  },

  // --- Timeline / projection ---
  {
    keywords: ['timeline', 'proyeksi', 'prediksi', 'perkiraan', 'masa depan', 'bulan ke'],
    getResponse: getTimelineResponse,
  },

  // --- BMI (before score, more specific) ---
  {
    keywords: ['bmi', 'massa tubuh', 'indeks massa', 'body mass'],
    getResponse: getBmiResponse,
  },

  // --- Health Score ---
  {
    keywords: ['skor', 'score', 'nilai kesehatan', 'nilai saya', 'berapa nilai', 'berapa skor'],
    getResponse: getHealthScoreResponse,
  },

  // --- Sleep ---
  {
    keywords: ['tidur', 'sleep', 'ngantuk', 'insomnia', 'begadang', 'istirahat'],
    getResponse: getSleepResponse,
  },

  // --- Exercise ---
  {
    keywords: ['olahraga', 'gerak', 'lari', 'jogging', 'jalan kaki', 'kebugaran', 'aktif'],
    getResponse: getExerciseResponse,
  },

  // --- Stress ---
  {
    keywords: ['stres', 'cemas', 'anxiety', 'khawatir', 'gelisah', 'tekanan', 'mental'],
    getResponse: getStressResponse,
  },

  // --- Diet ---
  {
    keywords: [
      'pola makan', 'makan', 'makanan', 'nutrisi', 'gizi',
      'sayur', 'buah', 'protein', 'karbohidrat',
      'sarapan', 'makan siang', 'makan malam',
    ],
    getResponse: getDietResponse,
  },

  // --- Water ---
  {
    keywords: ['air putih', 'minum', 'hidrasi', 'dehidrasi', 'air mineral', 'cairan'],
    getResponse: getWaterResponse,
  },

  // --- Screen time ---
  {
    keywords: ['screentime', 'layar', 'gadget', 'media sosial', 'medsos', 'sosial media'],
    getResponse: getScreenTimeResponse,
  },

  // --- Target ---
  {
    keywords: ['target', 'tujuan', 'goal', 'sasaran', 'impian', 'harapan'],
    getResponse: getTargetResponse,
  },
]

/**
 * generateChatbotResponse
 * ----------------------------------------------------------------
 * Generates a rule-based chatbot response for the given user
 * message, optionally personalized using `contextData`.
 *
 * v2: Input is normalized (lowered, typo-expanded, punctuation-
 * stripped) before keyword matching for much more flexible input
 * handling.
 *
 * @param {string} message - The user's text input.
 * @param {{ inputs: object, results: object } | null} [contextData]
 *   The current simulation inputs/results (from SimulationContext),
 *   or null if no simulation has been run yet.
 * @returns {Promise<string>} Resolves with the response text after
 *   a simulated delay (~800ms).
 */
export async function generateChatbotResponse(message, contextData = null) {
  const normalizedMessage = normalizeText(message)

  const matchedIntent = INTENTS.find((intent) =>
    intent.keywords.some((keyword) => normalizedMessage.includes(keyword))
  )

  const responseText = matchedIntent
    ? matchedIntent.getResponse(contextData)
    : FALLBACK_RESPONSE

  return new Promise((resolve) => {
    setTimeout(() => resolve(responseText), RESPONSE_DELAY_MS)
  })
}