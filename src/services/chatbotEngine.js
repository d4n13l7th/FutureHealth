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
  'Maaf, saya belum memahami pertanyaan Anda. Anda bisa bertanya tentang skor kesehatan, BMI, tips tidur, olahraga, tingkat stres, atau target kesehatan Anda.'

// ----------------------------------------------------------------
// Intent response builders
// ----------------------------------------------------------------
// Each function takes `contextData` (possibly null) and returns a
// response string — personalized when context is available,
// otherwise a general explanation plus a gentle prompt to run a
// simulation.
// ----------------------------------------------------------------

function getGreetingResponse(contextData) {
  const healthScore = contextData?.results?.healthScore

  if (healthScore != null) {
    return (
      `Halo! Skor kesehatan masa depan Anda saat ini adalah ${healthScore}/100. ` +
      'Ada yang ingin Anda tanyakan tentang tidur, olahraga, BMI, stres, atau target kesehatan Anda?'
    )
  }

  return (
    'Halo! Saya asisten FutureHealth. Anda bisa bertanya tentang skor kesehatan, BMI, ' +
    'tidur, olahraga, stres, atau target kesehatan Anda. Jalankan simulasi terlebih ' +
    'dahulu agar saya bisa memberikan jawaban yang lebih personal.'
  )
}

function getHealthScoreResponse(contextData) {
  const results = contextData?.results

  if (results?.healthScore != null) {
    return (
      `Skor kesehatan masa depan Anda saat ini adalah ${results.healthScore}/100, ` +
      `dengan kategori "${results.category}". Skor ini adalah proyeksi edukatif ` +
      'berdasarkan kebiasaan Anda saat ini, bukan diagnosis medis.'
    )
  }

  return (
    NO_SIMULATION_NOTICE +
    'Skor kesehatan FutureHealth adalah angka 0-100 yang menggambarkan proyeksi kondisi ' +
    'kesehatan Anda di masa depan berdasarkan gaya hidup saat ini. Jalankan simulasi ' +
    'untuk melihat skor Anda.'
  )
}

function getBmiResponse(contextData) {
  const results = contextData?.results

  if (results?.bmi != null) {
    return (
      `BMI (Indeks Massa Tubuh) Anda saat ini adalah ${results.bmi}, yang termasuk ` +
      `dalam kategori "${results.bmiCategory}". BMI memberikan gambaran umum ` +
      'kategori berat badan, namun bukan satu-satunya indikator kesehatan Anda.'
    )
  }

  return (
    NO_SIMULATION_NOTICE +
    'BMI dihitung dari tinggi dan berat badan Anda untuk memberikan gambaran umum ' +
    'kategori berat badan. Jalankan simulasi untuk melihat BMI Anda.'
  )
}

function getSleepResponse(contextData) {
  const sleepHours = contextData?.inputs?.sleepHours
  const advice =
    'Tidur 7-8 jam per malam secara konsisten dapat membantu pemulihan tubuh, ' +
    'menjaga suasana hati, dan mendukung kesehatan jangka panjang.'

  if (!contextData) {
    return NO_SIMULATION_NOTICE + advice
  }

  if (!sleepHours) {
    return advice
  }

  if (sleepHours === '7-8 jam') {
    return (
      `Durasi tidur Anda saat ini (${sleepHours}) sudah berada pada rentang ideal — ` +
      `pertahankan kebiasaan ini! ${advice}`
    )
  }

  return `Durasi tidur Anda saat ini adalah "${sleepHours}". ${advice}`
}

function getExerciseResponse(contextData) {
  const exerciseFrequency = contextData?.inputs?.exerciseFrequency
  const advice =
    'Meningkatkan frekuensi olahraga secara bertahap, idealnya menuju 3-4 kali per ' +
    'minggu atau lebih, dapat berdampak besar pada skor kesehatan dan kebugaran Anda.'

  if (!contextData) {
    return NO_SIMULATION_NOTICE + advice
  }

  if (!exerciseFrequency) {
    return advice
  }

  return `Saat ini Anda berolahraga "${exerciseFrequency}". ${advice}`
}

function getStressResponse(contextData) {
  const stressLevel = contextData?.inputs?.stressLevel
  const advice =
    'Mengelola stres melalui relaksasi, olahraga ringan, atau berbicara dengan orang ' +
    'terdekat dapat membantu menjaga kualitas tidur dan kesehatan secara keseluruhan.'

  if (!contextData) {
    return NO_SIMULATION_NOTICE + advice
  }

  if (stressLevel == null) {
    return advice
  }

  return `Tingkat stres yang Anda laporkan adalah ${stressLevel}/10. ${advice}`
}

function getTargetResponse(contextData) {
  const target = contextData?.inputs?.target
  const recommendations = contextData?.results?.recommendations

  if (!target) {
    return (
      NO_SIMULATION_NOTICE +
      'Saat menjalankan simulasi, Anda dapat memilih target seperti menurunkan berat ' +
      'badan, meningkatkan kebugaran, memperbaiki kualitas tidur, mengurangi stres, ' +
      'atau mempertahankan gaya hidup sehat.'
    )
  }

  let response = `Target kesehatan Anda saat ini adalah "${target}".`

  if (Array.isArray(recommendations) && recommendations.length > 0) {
    response += ` Salah satu rekomendasi untuk membantu mencapainya: ${recommendations[0]}`
  }

  return response
}

// ----------------------------------------------------------------
// Intent registry
// ----------------------------------------------------------------
// Checked in order; the first intent whose keywords appear in the
// (lowercased) message wins. More specific intents (bmi, target)
// are placed before broader ones where overlap is possible.
// ----------------------------------------------------------------

const INTENTS = [
  {
    keywords: ['halo', 'hai', 'hi ', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam'],
    getResponse: getGreetingResponse,
  },
  {
    keywords: ['bmi', 'massa tubuh'],
    getResponse: getBmiResponse,
  },
  {
    keywords: ['skor', 'score', 'nilai kesehatan'],
    getResponse: getHealthScoreResponse,
  },
  {
    keywords: ['tidur', 'sleep', 'ngantuk'],
    getResponse: getSleepResponse,
  },
  {
    keywords: ['olahraga', 'exercise', 'workout', 'fitnes', 'fitness'],
    getResponse: getExerciseResponse,
  },
  {
    keywords: ['stres', 'stress', 'cemas'],
    getResponse: getStressResponse,
  },
  {
    keywords: ['target', 'tujuan', 'goal'],
    getResponse: getTargetResponse,
  },
]

/**
 * generateChatbotResponse
 * ----------------------------------------------------------------
 * Generates a rule-based chatbot response for the given user
 * message, optionally personalized using `contextData`.
 *
 * @param {string} message - The user's text input.
 * @param {{ inputs: object, results: object } | null} [contextData]
 *   The current simulation inputs/results (from SimulationContext),
 *   or null if no simulation has been run yet.
 * @returns {Promise<string>} Resolves with the response text after
 *   a simulated delay (~800ms).
 */
export async function generateChatbotResponse(message, contextData = null) {
  const normalizedMessage = (message ?? '').toLowerCase()

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