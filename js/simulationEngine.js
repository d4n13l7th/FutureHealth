/**
 * FutureHealth Simulation Engine
 * ----------------------------------------------------------------
 * PENTING: Ini adalah model edukatif yang disederhanakan untuk
 * tujuan visualisasi dan motivasi. BUKAN alat diagnosis medis dan
 * tidak menghasilkan prediksi kesehatan yang akurat secara klinis.
 *
 * Seluruh logika di file ini bersifat rule-based & deterministik —
 * TIDAK menggunakan AI generatif, ML, maupun API eksternal.
 * ----------------------------------------------------------------
 */

export const DISCLAIMER =
  'Hasil ini adalah simulasi edukatif untuk membantu Anda memvisualisasikan ' +
  'dampak gaya hidup, bukan prediksi medis yang akurat. Untuk keputusan ' +
  'kesehatan, selalu konsultasikan dengan tenaga profesional.'

// ----------------------------------------------------------------
// Scoring tables — each habit contributes points (0-100 scale)
// ----------------------------------------------------------------
const SLEEP_SCORES = {
  'Kurang dari 5 jam': 30,
  '5-6 jam': 55,
  '7-8 jam': 90,
  'Lebih dari 8 jam': 75,
}

const WATER_SCORES = {
  Kurang: 35,
  Sedang: 65,
  Baik: 95,
}

const EXERCISE_SCORES = {
  'Tidak pernah': 25,
  '1-2 kali per minggu': 50,
  '3-4 kali per minggu': 80,
  '5 kali atau lebih per minggu': 95,
}

const SCREEN_TIME_SCORES = {
  'Kurang dari 2 jam': 95,
  '2-5 jam': 75,
  '5-8 jam': 50,
  'Lebih dari 8 jam': 25,
}

const DIET_SCORES = {
  Buruk: 30,
  Cukup: 65,
  Sehat: 95,
}

// Default weighting of each lifestyle factor toward the overall
// health score. These can be overridden per-goal (see GOAL_WEIGHTS).
const DEFAULT_WEIGHTS = {
  sleep: 0.18,
  water: 0.12,
  exercise: 0.25,
  screenTime: 0.1,
  stress: 0.15,
  diet: 0.2,
}

/**
 * Goal-specific weight profiles. Each health target prioritizes
 * different lifestyle factors, which changes how the score is
 * calculated AND how recommendations/narratives are generated.
 */
const GOAL_WEIGHTS = {
  'Menurunkan berat badan': {
    sleep: 0.12,
    water: 0.12,
    exercise: 0.32,
    screenTime: 0.06,
    stress: 0.1,
    diet: 0.28,
  },
  'Menambah berat badan': {
    sleep: 0.15,
    water: 0.1,
    exercise: 0.25,
    screenTime: 0.05,
    stress: 0.15,
    diet: 0.3,
  },
  'Meningkatkan kebugaran': {
    sleep: 0.15,
    water: 0.12,
    exercise: 0.35,
    screenTime: 0.08,
    stress: 0.1,
    diet: 0.2,
  },
  'Memperbaiki kualitas tidur': {
    sleep: 0.32,
    water: 0.08,
    exercise: 0.15,
    screenTime: 0.2,
    stress: 0.2,
    diet: 0.05,
  },
  'Mengurangi stres': {
    sleep: 0.22,
    water: 0.08,
    exercise: 0.22,
    screenTime: 0.13,
    stress: 0.3,
    diet: 0.05,
  },
  'Mempertahankan gaya hidup sehat': DEFAULT_WEIGHTS,
}

const CATEGORY_THRESHOLDS = [
  { min: 85, label: 'Sangat Baik' },
  { min: 70, label: 'Baik' },
  { min: 50, label: 'Sedang' },
  { min: 0, label: 'Berisiko' },
]

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function getWeights(target) {
  return GOAL_WEIGHTS[target] ?? DEFAULT_WEIGHTS
}

/**
 * Returns the raw 0-100 sub-score for each lifestyle factor,
 * independent of weighting. Used by insights, risks, and
 * factor-identification logic.
 */
function getFactorScores(inputs) {
  return {
    sleep: SLEEP_SCORES[inputs.sleepHours] ?? 50,
    water: WATER_SCORES[inputs.waterIntake] ?? 50,
    exercise: EXERCISE_SCORES[inputs.exerciseFrequency] ?? 50,
    screenTime: SCREEN_TIME_SCORES[inputs.screenTime] ?? 50,
    stress: clamp(100 - (Number(inputs.stressLevel) || 5) * 10),
    diet: DIET_SCORES[inputs.dietQuality] ?? 50,
  }
}

const FACTOR_LABELS = {
  sleep: 'Tidur',
  water: 'Air Putih',
  exercise: 'Olahraga',
  screenTime: 'Screen Time',
  stress: 'Stres',
  diet: 'Pola Makan',
}

/**
 * Calculates the current baseline health score (0-100) from raw
 * lifestyle inputs. Weighting adapts to the user's chosen target.
 */
export function calculateCurrentScore(inputs) {
  const factors = getFactorScores(inputs)
  const weights = getWeights(inputs.target)

  const weighted = Object.keys(factors).reduce(
    (total, key) => total + factors[key] * (weights[key] ?? DEFAULT_WEIGHTS[key]),
    0
  )

  return Math.round(clamp(weighted))
}

function getCategory(score) {
  return CATEGORY_THRESHOLDS.find((c) => score >= c.min)?.label ?? 'Sedang'
}

/**
 * Projects how the health score evolves over a 12-month horizon
 * given the current score, target health goal, and commitment level.
 *
 * Returns an array of { month, score, label } points used for
 * charts/timelines.
 */
/**
 * Goal-specific timeline profiles describing how quickly progress
 * is felt over the 12-month horizon. `cap` limits the maximum
 * achievable improvement (relative to the default 0.7), and
 * `curve` is the ease-out exponent — lower values mean gains
 * arrive earlier, higher values mean gains arrive later.
 */
const GOAL_TIMELINE_PROFILES = {
  'Menurunkan berat badan': { cap: 0.6, curve: 2.2 }, // slower, long-term
  'Menambah berat badan': { cap: 0.6, curve: 2.0 },
  'Meningkatkan kebugaran': { cap: 0.75, curve: 1.1 }, // fast early gains
  'Memperbaiki kualitas tidur': { cap: 0.8, curve: 0.9 }, // noticeable early gains
  'Mengurangi stres': { cap: 0.7, curve: 1.4 }, // moderate
  'Mempertahankan gaya hidup sehat': { cap: 0.2, curve: 1.6 }, // minimal changes
}

const DEFAULT_TIMELINE_PROFILE = { cap: 0.7, curve: 1.6 }

function getTimelineProfile(targetGoal) {
  return GOAL_TIMELINE_PROFILES[targetGoal] ?? DEFAULT_TIMELINE_PROFILE
}

export function projectTimeline(currentScore, commitmentLevel, targetGoal) {
  const months = [0, 1, 3, 6, 12]
  const commitment = clamp(Number(commitmentLevel) || 5, 1, 10)
  const profile = getTimelineProfile(targetGoal)

  // Maximum realistic improvement achievable over 12 months at full
  // (10/10) commitment. Lower commitment scales this down, and can
  // even slightly regress the score if commitment is very low. The
  // cap is goal-dependent so each target "feels" different.
  const maxImprovement = (100 - currentScore) * profile.cap
  const commitmentFactor = (commitment - 5) / 5 // -0.8 .. +1
  const totalChange = maxImprovement * Math.max(commitmentFactor, -0.3)

  return months.map((month) => {
    const progressRatio = month === 0 ? 0 : Math.min(1, month / 12)
    // ease-out curve: goal-dependent exponent shapes how quickly
    // gains are felt (lower = earlier gains, higher = later gains)
    const eased = 1 - Math.pow(1 - progressRatio, profile.curve)
    const score = Math.round(clamp(currentScore + totalChange * eased))
    return { month, score, label: monthLabel(month) }
  })
}

function monthLabel(month) {
  if (month === 0) return 'Hari Ini'
  if (month === 12) return 'Bulan 12'
  return `Bulan ${month}`
}

/**
 * Estimates the number of months required to reach a "Baik" or
 * "Sangat Baik" category based on current score and commitment.
 */
export function estimateTimeToGoal(currentScore, commitmentLevel) {
  const timeline = projectTimeline(currentScore, commitmentLevel)
  const targetScore = 80
  const reached = timeline.find((point) => point.score >= targetScore)
  if (currentScore >= targetScore) return '0 bulan (sudah tercapai)'
  if (!reached) return 'Lebih dari 12 bulan'
  return `${reached.month} bulan`
}

/**
 * Builds a "Future Self" snapshot describing qualitative changes
 * expected at the 12-month mark.
 */
export function buildFutureSelf(inputs, futureScore, extras = {}) {
  const weight = Number(inputs.weight) || 0
  let projectedWeight = weight

  if (inputs.target === 'Menurunkan berat badan') {
    projectedWeight = Math.round(weight * 0.95 * 10) / 10
  } else if (inputs.target === 'Menambah berat badan') {
    projectedWeight = Math.round(weight * 1.05 * 10) / 10
  }

  const fitness =
    EXERCISE_SCORES[inputs.exerciseFrequency] >= 80
      ? 'Meningkat Pesat'
      : EXERCISE_SCORES[inputs.exerciseFrequency] >= 50
      ? 'Meningkat'
      : 'Stabil'

  const sleepQuality =
    SLEEP_SCORES[inputs.sleepHours] >= 85
      ? 'Sangat Baik'
      : SLEEP_SCORES[inputs.sleepHours] >= 60
      ? 'Baik'
      : 'Perlu Perbaikan'

  const stressTrend =
    Number(inputs.commitmentLevel) >= 6 ? 'Menurun' : 'Stabil'

  // Future BMI category is derived from the *projected* weight, so
  // the future self reflects the simulated outcome rather than the
  // user's current measurements.
  const { category: bmiCategory } = calculateBMI(inputs.height, projectedWeight)

  const { healthAge } = calculateHealthAge(inputs.age, futureScore)

  const { trend: healthTrend } = generateHealthTrend(
    extras.currentScore ?? futureScore,
    futureScore,
    inputs.commitmentLevel
  )

  return {
    projectedWeight,
    bmiCategory,
    healthAge,
    healthTrend,
    fitness,
    sleepQuality,
    stressTrend,
    overallWellbeing: getCategory(futureScore),
  }
}

// ----------------------------------------------------------------
// BMI Calculation
// ----------------------------------------------------------------

const BMI_CATEGORY_THRESHOLDS = [
  { max: 18.5, label: 'Underweight' },
  { max: 25, label: 'Normal' },
  { max: 30, label: 'Overweight' },
  { max: Infinity, label: 'Obese' },
]

/**
 * Calculates Body Mass Index from height (cm) and weight (kg).
 * Returns { bmi, category }. Educational only — not a diagnosis.
 */
export function calculateBMI(height, weight) {
  const heightM = (Number(height) || 0) / 100
  const weightKg = Number(weight) || 0

  if (heightM <= 0) {
    return { bmi: 0, category: 'Tidak diketahui' }
  }

  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10
  const category = BMI_CATEGORY_THRESHOLDS.find((c) => bmi < c.max)?.label ?? 'Obese'

  return { bmi, category }
}

// ----------------------------------------------------------------
// Health Trend Detection
// ----------------------------------------------------------------

/**
 * Compares the current score against the projected future score to
 * determine whether the user's trajectory is Improving, Stable, or
 * Declining. A small dead-zone around 0 keeps near-equal scores
 * classified as Stable.
 */
export function generateHealthTrend(currentScore, futureScore, commitmentLevel) {
  const delta = futureScore - currentScore
  const commitment = clamp(Number(commitmentLevel) || 5, 1, 10)

  let trend
  if (delta >= 4) {
    trend = 'Improving'
  } else if (delta <= -4) {
    trend = 'Declining'
  } else {
    trend = 'Stable'
  }

  return {
    trend,
    delta,
    commitment,
  }
}

// ----------------------------------------------------------------
// Simulated Health Age
// ----------------------------------------------------------------

/**
 * Produces an educational "biological health age" — a simplified,
 * illustrative figure showing how lifestyle choices might shift a
 * person's age perception relative to their actual age.
 *
 * This is NOT a medical or biological age assessment. It is a
 * motivational simulation only.
 *
 * Rules of thumb:
 *  - healthScore 90+   -> up to 3 years "younger"
 *  - healthScore ~70   -> roughly actual age
 *  - healthScore < 50  -> up to ~6 years "older"
 */
export function calculateHealthAge(age, healthScore) {
  const actualAge = Math.round(Number(age) || 0)
  const score = clamp(Number(healthScore) || 0)

  // Map score (0-100) to an age delta (-6 .. +6), centered around 70
  const deviation = (70 - score) / 100 * 12 // score 70 -> 0, score 100 -> -3.6, score 0 -> +8.4
  const cappedDeviation = clamp(deviation, -6, 8)

  const healthAge = Math.max(1, Math.round(actualAge + cappedDeviation))

  return { actualAge, healthAge }
}



const STRENGTH_MESSAGES = {
  sleep: 'Durasi tidur Anda sudah berada pada rentang yang ideal, menjadi salah satu kekuatan utama dalam profil kesehatan Anda.',
  water: 'Konsumsi air putih Anda tergolong baik dan mendukung fungsi tubuh secara optimal.',
  exercise: 'Kebiasaan olahraga yang konsisten menjadi salah satu kekuatan utama dalam profil kesehatan Anda.',
  screenTime: 'Screen time harian Anda relatif terjaga, memberi ruang lebih untuk aktivitas fisik dan istirahat.',
  stress: 'Tingkat stres Anda tergolong rendah, mendukung kestabilan emosi dan kualitas hidup.',
  diet: 'Kualitas pola makan Anda tergolong sehat dan menjadi fondasi yang kuat untuk kesehatan jangka panjang.',
}

const WEAKNESS_MESSAGES = {
  sleep: 'Durasi tidur yang rendah dapat memengaruhi kualitas hidup dalam jangka panjang.',
  water: 'Konsumsi air putih yang masih kurang dapat memengaruhi energi dan konsentrasi harian Anda.',
  exercise: 'Frekuensi olahraga yang masih rendah membatasi potensi peningkatan kebugaran Anda.',
  screenTime: 'Screen time harian yang tinggi dapat mengurangi waktu untuk istirahat dan aktivitas fisik.',
  stress: 'Tingkat stres yang cukup tinggi berpotensi memengaruhi kualitas tidur dan kesehatan secara keseluruhan.',
  diet: 'Kualitas pola makan yang belum optimal dapat menjadi penghambat utama pencapaian target kesehatan.',
}

/**
 * Analyzes lifestyle inputs and returns structured insights about
 * the user's main strengths, weaknesses, and the dominant factor
 * driving their current health score.
 */
export function generateInsights(inputs) {
  const factors = getFactorScores(inputs)
  const weights = getWeights(inputs.target)

  const entries = Object.entries(factors)

  const strengths = entries
    .filter(([, score]) => score >= 80)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => STRENGTH_MESSAGES[key])

  const weaknesses = entries
    .filter(([, score]) => score < 60)
    .sort((a, b) => a[1] - b[1])
    .map(([key]) => WEAKNESS_MESSAGES[key])

  // Dominant factor = the factor whose (weight * score-gap-from-ideal)
  // contributes most to pulling the overall score away from 100.
  const dominant = entries
    .map(([key, score]) => ({
      key,
      impact: (weights[key] ?? DEFAULT_WEIGHTS[key]) * (100 - score),
    }))
    .sort((a, b) => b.impact - a.impact)[0]

  return {
    strengths: strengths.length
      ? strengths
      : ['Profil gaya hidup Anda cukup seimbang di seluruh aspek yang diukur.'],
    weaknesses: weaknesses.length
      ? weaknesses
      : ['Tidak ada kelemahan signifikan yang terdeteksi pada profil Anda saat ini.'],
    dominantFactor: {
      key: dominant.key,
      label: FACTOR_LABELS[dominant.key],
      message: `${FACTOR_LABELS[dominant.key]} merupakan faktor yang paling berpengaruh terhadap skor kesehatan Anda saat ini, terutama untuk target "${inputs.target}".`,
    },
  }
}

// ----------------------------------------------------------------
// 2. Personalized Recommendations
// ----------------------------------------------------------------

const RECOMMENDATION_MESSAGES = {
  sleep: 'Tingkatkan durasi tidur menjadi 7-8 jam per hari untuk mendukung pemulihan tubuh secara optimal.',
  water: 'Tingkatkan konsumsi air putih harian Anda menuju kategori "Baik" untuk menjaga energi dan fokus.',
  exercise: 'Tambahkan frekuensi olahraga secara bertahap, idealnya menuju 3-4 kali per minggu atau lebih.',
  screenTime: 'Kurangi screen time harian menjadi kurang dari 5 jam untuk memberi ruang pada istirahat dan aktivitas fisik.',
  stress: 'Luangkan waktu untuk relaksasi atau teknik manajemen stres guna menurunkan tingkat stres harian Anda.',
  diet: 'Perbaiki kualitas pola makan dengan menambah porsi makanan bergizi seimbang secara konsisten.',
}

/**
 * Returns a prioritized list of actionable recommendations based
 * on the user's weakest lifestyle factors, weighted by relevance
 * to their chosen health target.
 */
export function generateRecommendations(inputs) {
  const factors = getFactorScores(inputs)
  const weights = getWeights(inputs.target)

  const ranked = Object.entries(factors)
    .map(([key, score]) => ({
      key,
      score,
      priority: (100 - score) * (weights[key] ?? DEFAULT_WEIGHTS[key]),
    }))
    .filter((item) => item.score < 80)
    .sort((a, b) => b.priority - a.priority)

  if (ranked.length === 0) {
    return [
      'Pertahankan kebiasaan sehat yang sudah Anda jalani saat ini secara konsisten.',
    ]
  }

  return ranked.slice(0, 3).map((item) => RECOMMENDATION_MESSAGES[item.key])
}

// ----------------------------------------------------------------
// 3. Risk Detection
// ----------------------------------------------------------------

/**
 * Identifies risk levels ("Rendah", "Sedang", "Tinggi") for the
 * five core lifestyle factors most associated with long-term
 * health outcomes.
 *
 * Returns an array of { level, factor } objects.
 */
export function detectRisks(inputs) {
  const factors = getFactorScores(inputs)

  const riskLevel = (score) => {
    if (score < 45) return 'Tinggi'
    if (score < 70) return 'Sedang'
    return 'Rendah'
  }

  return [
    { factor: 'Tidur', level: riskLevel(factors.sleep) },
    { factor: 'Stres', level: riskLevel(factors.stress) },
    { factor: 'Screen Time', level: riskLevel(factors.screenTime) },
    { factor: 'Olahraga', level: riskLevel(factors.exercise) },
    { factor: 'Pola Makan', level: riskLevel(factors.diet) },
  ]
}

// ----------------------------------------------------------------
// 4. Strongest & Weakest Factors
// ----------------------------------------------------------------

/**
 * Returns the strongest and weakest lifestyle factors based on
 * raw factor scores.
 */
export function identifyHealthFactors(inputs) {
  const factors = getFactorScores(inputs)
  const entries = Object.entries(factors)

  const strongest = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
  const weakest = entries.reduce((a, b) => (b[1] < a[1] ? b : a))

  return {
    strongestFactor: FACTOR_LABELS[strongest[0]],
    weakestFactor: FACTOR_LABELS[weakest[0]],
  }
}

// ----------------------------------------------------------------
// 5. Narrative Report (rule-based, AI-like experience)
// ----------------------------------------------------------------

/**
 * Estimates the score improvement (in points, over 6 months)
 * achievable if the user's weakest factor were improved to a
 * "good" baseline (score of 85). Used to make the narrative
 * feel quantitatively grounded.
 */
function estimatePotentialGain(inputs, weakestKey) {
  const factors = getFactorScores(inputs)
  const weights = getWeights(inputs.target)
  const improvedFactors = { ...factors, [weakestKey]: 85 }

  const currentWeighted = Object.keys(factors).reduce(
    (t, k) => t + factors[k] * (weights[k] ?? DEFAULT_WEIGHTS[k]),
    0
  )
  const improvedWeighted = Object.keys(improvedFactors).reduce(
    (t, k) => t + improvedFactors[k] * (weights[k] ?? DEFAULT_WEIGHTS[k]),
    0
  )

  // 6-month projection only realizes part of the full potential gain
  const fullGain = improvedWeighted - currentWeighted
  return Math.max(1, Math.round(fullGain * 0.6))
}

const WEAKEST_FACTOR_NARRATIVE = {
  sleep: 'durasi tidur yang masih berada di bawah rekomendasi dapat menghambat peningkatan kualitas hidup dalam jangka panjang',
  water: 'konsumsi air putih yang masih kurang dapat memengaruhi energi dan fokus harian Anda',
  exercise: 'frekuensi olahraga yang masih rendah membatasi laju peningkatan kebugaran Anda',
  screenTime: 'screen time harian yang cukup tinggi dapat mengurangi waktu istirahat dan aktivitas produktif',
  stress: 'tingkat stres yang masih tinggi dapat memengaruhi kualitas tidur dan kestabilan emosi Anda',
  diet: 'kualitas pola makan yang belum optimal dapat menjadi penghambat utama pencapaian target kesehatan Anda',
}

const WEAKEST_FACTOR_IMPROVEMENT = {
  sleep: 'peningkatan durasi tidur menjadi 7-8 jam per hari',
  water: 'peningkatan konsumsi air putih ke kategori "Baik"',
  exercise: 'peningkatan frekuensi olahraga secara bertahap',
  screenTime: 'pengurangan screen time harian menjadi kurang dari 5 jam',
  stress: 'penerapan strategi manajemen stres secara rutin',
  diet: 'perbaikan kualitas pola makan menjadi lebih sehat',
}

const STRENGTH_NARRATIVE = {
  sleep: 'durasi tidur yang sudah ideal memberikan kontribusi positif terhadap kesehatan Anda',
  water: 'konsumsi air putih yang baik memberikan kontribusi positif terhadap kesehatan Anda',
  exercise: 'kebiasaan olahraga yang cukup konsisten memberikan kontribusi positif terhadap kesehatan Anda',
  screenTime: 'pengelolaan screen time yang baik memberikan kontribusi positif terhadap kesehatan Anda',
  stress: 'tingkat stres yang terjaga memberikan kontribusi positif terhadap kesehatan Anda',
  diet: 'kualitas pola makan yang sehat memberikan kontribusi positif terhadap kesehatan Anda',
}

/**
 * Generates a deterministic, rule-based narrative report that
 * reads like a personalized analysis from a smart health
 * assistant — without using any AI APIs or models.
 */
export function generateNarrative(inputs, result) {
  const factors = getFactorScores(inputs)
  const { strongestFactor, weakestFactor } = identifyHealthFactors(inputs)

  const strongestKey = Object.keys(FACTOR_LABELS).find(
    (key) => FACTOR_LABELS[key] === strongestFactor
  )
  const weakestKey = Object.keys(FACTOR_LABELS).find(
    (key) => FACTOR_LABELS[key] === weakestFactor
  )

  const intro = `Kondisi kesehatan Anda saat ini berada pada kategori ${result.category}.`

  const strengthLine = factors[strongestKey] >= 70
    ? capitalize(STRENGTH_NARRATIVE[strongestKey] + '.')
    : 'Belum ada faktor yang menonjol secara signifikan sebagai kekuatan utama, namun fondasi Anda cukup seimbang.'

  const weaknessLine =
    `Namun, ${WEAKEST_FACTOR_NARRATIVE[weakestKey]}.`

  const potentialGain = estimatePotentialGain(inputs, weakestKey)
  const projectionLine =
    `Berdasarkan simulasi, ${WEAKEST_FACTOR_IMPROVEMENT[weakestKey]} berpotensi meningkatkan skor kesehatan ` +
    `hingga ${potentialGain} poin dalam 6 bulan.`

  const goalLine = `Dengan target "${inputs.target}" dan tingkat komitmen ${inputs.commitmentLevel ?? 5}/10, ` +
    `estimasi waktu untuk mencapai kategori kesehatan yang lebih baik adalah ${result.timeToGoal}.`

  return {
    title: 'FutureHealth Analysis',
    paragraphs: [intro, strengthLine, weaknessLine, projectionLine, goalLine],
  }
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ----------------------------------------------------------------
// 7. Scenario Comparison
// ----------------------------------------------------------------

function timeToGoalInMonths(timeToGoalStr) {
  if (!timeToGoalStr) return 12
  if (timeToGoalStr.includes('sudah tercapai')) return 0
  if (timeToGoalStr.includes('Lebih dari')) return 12
  const match = timeToGoalStr.match(/\d+/)
  return match ? Number(match[0]) : 12
}

/**
 * Compares two simulation scenarios (e.g. "Scenario A" vs
 * "Scenario B") and summarizes which one performs better and by
 * how much.
 *
 * Returns { scoreDifference, timeDifference, betterScenario, summary }.
 */
export function compareScenarios(baseInputs, alternativeInputs) {
  const resultA = runSimulation(baseInputs)
  const resultB = runSimulation(alternativeInputs)

  const scoreDifference = resultB.healthScore - resultA.healthScore
  const monthsA = timeToGoalInMonths(resultA.timeToGoal)
  const monthsB = timeToGoalInMonths(resultB.timeToGoal)
  const monthDelta = monthsA - monthsB

  const betterScenario =
    resultB.healthScore === resultA.healthScore
      ? 'Setara'
      : resultB.healthScore > resultA.healthScore
      ? 'Scenario B'
      : 'Scenario A'

  let timeDifference = 'Estimasi waktu pencapaian setara'
  if (monthDelta > 0) {
    timeDifference = `Scenario B ${monthDelta} bulan lebih cepat`
  } else if (monthDelta < 0) {
    timeDifference = `Scenario A ${Math.abs(monthDelta)} bulan lebih cepat`
  }

  const summary =
    betterScenario === 'Setara'
      ? 'Kedua skenario menghasilkan proyeksi kesehatan yang setara.'
      : `${betterScenario} menghasilkan proyeksi skor kesehatan ${Math.abs(
          scoreDifference
        )} poin lebih tinggi dibandingkan skenario lainnya, dengan ${timeDifference.toLowerCase()}.`

  return {
    resultA,
    resultB,
    scoreDifference: Math.abs(scoreDifference),
    timeDifference,
    betterScenario,
    summary,
  }
}

// ----------------------------------------------------------------
// 8. Main Simulation Pipeline
// ----------------------------------------------------------------

/**
 * Runs the full simulation pipeline and returns a structured
 * results object consumed by the Results page.
 */
export function runSimulation(inputs) {
  const currentScore = calculateCurrentScore(inputs)
  const timeline = projectTimeline(currentScore, inputs.commitmentLevel, inputs.target)
  const futureScore = timeline[timeline.length - 1].score

  const { bmi, category: bmiCategory } = calculateBMI(inputs.height, inputs.weight)
  const healthTrend = generateHealthTrend(currentScore, futureScore, inputs.commitmentLevel)
  const { healthAge } = calculateHealthAge(inputs.age, futureScore)

  const futureSelf = buildFutureSelf(inputs, futureScore, { currentScore })
  const timeToGoal = estimateTimeToGoal(currentScore, inputs.commitmentLevel)

  const insights = generateInsights(inputs)
  const recommendations = generateRecommendations(inputs)
  const risks = detectRisks(inputs)
  const { strongestFactor, weakestFactor } = identifyHealthFactors(inputs)

  const baseResult = {
    healthScore: futureScore,
    currentScore,
    category: getCategory(futureScore),
    timeline,
    futureSelf,
    timeToGoal,
    bmi,
    bmiCategory,
    healthAge,
    healthTrend: healthTrend.trend,
    insights,
    recommendations,
    risks,
    strongestFactor,
    weakestFactor,
    disclaimer: DISCLAIMER,
  }

  return {
    ...baseResult,
    narrative: generateNarrative(inputs, baseResult),
  }
}

/**
 * Re-runs the simulation with a partial override of inputs — used
 * by the What-If simulator to instantly compare scenarios.
 */
export function runWhatIf(baseInputs, overrides) {
  return runSimulation({ ...baseInputs, ...overrides })
}

export const SIMULATION_OPTIONS = {
  sleepHours: Object.keys(SLEEP_SCORES),
  waterIntake: Object.keys(WATER_SCORES),
  exerciseFrequency: Object.keys(EXERCISE_SCORES),
  screenTime: Object.keys(SCREEN_TIME_SCORES),
  dietQuality: Object.keys(DIET_SCORES),
  targets: Object.keys(GOAL_WEIGHTS),
}