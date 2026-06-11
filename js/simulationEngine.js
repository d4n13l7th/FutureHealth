/**
 * FutureHealth Simulation Engine
 * ----------------------------------------------------------------
 * PENTING: Ini adalah model edukatif yang disederhanakan untuk
 * tujuan visualisasi dan motivasi. BUKAN alat diagnosis medis dan
 * tidak menghasilkan prediksi kesehatan yang akurat secara klinis.
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

// Weighting of each lifestyle factor toward the overall health score
const WEIGHTS = {
  sleep: 0.18,
  water: 0.12,
  exercise: 0.25,
  screenTime: 0.1,
  stress: 0.15,
  diet: 0.2,
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

/**
 * Calculates the current baseline health score (0-100) from raw
 * lifestyle inputs.
 */
export function calculateCurrentScore(inputs) {
  const sleep = SLEEP_SCORES[inputs.sleepHours] ?? 50
  const water = WATER_SCORES[inputs.waterIntake] ?? 50
  const exercise = EXERCISE_SCORES[inputs.exerciseFrequency] ?? 50
  const screenTime = SCREEN_TIME_SCORES[inputs.screenTime] ?? 50
  const diet = DIET_SCORES[inputs.dietQuality] ?? 50
  // Stress is 1-10 where 10 = very stressed -> invert to a 0-100 "wellness" score
  const stress = clamp(100 - (Number(inputs.stressLevel) || 5) * 10)

  const weighted =
    sleep * WEIGHTS.sleep +
    water * WEIGHTS.water +
    exercise * WEIGHTS.exercise +
    screenTime * WEIGHTS.screenTime +
    stress * WEIGHTS.stress +
    diet * WEIGHTS.diet

  return Math.round(clamp(weighted))
}

function getCategory(score) {
  return CATEGORY_THRESHOLDS.find((c) => score >= c.min)?.label ?? 'Sedang'
}

/**
 * Projects how the health score evolves over a 12-month horizon
 * given the current score, target health goal, and commitment level.
 *
 * Returns an array of { month, score } points used for charts/timelines.
 */
export function projectTimeline(currentScore, commitmentLevel, targetGoal) {
  const months = [0, 1, 3, 6, 12]
  const commitment = clamp(Number(commitmentLevel) || 5, 1, 10)

  // Maximum realistic improvement achievable over 12 months at full
  // (10/10) commitment. Lower commitment scales this down, and can
  // even slightly regress the score if commitment is very low.
  const maxImprovement = (100 - currentScore) * 0.7
  const commitmentFactor = (commitment - 5) / 5 // -0.8 .. +1
  const totalChange = maxImprovement * Math.max(commitmentFactor, -0.3)

  return months.map((month) => {
    const progressRatio = month === 0 ? 0 : Math.min(1, month / 12)
    // ease-out curve: faster early gains, leveling off later
    const eased = 1 - Math.pow(1 - progressRatio, 1.6)
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
export function buildFutureSelf(inputs, futureScore) {
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

  return {
    projectedWeight,
    fitness,
    sleepQuality,
    stressTrend,
    overallWellbeing: getCategory(futureScore),
  }
}

/**
 * Runs the full simulation pipeline and returns a structured
 * results object consumed by the Results page.
 */
export function runSimulation(inputs) {
  const currentScore = calculateCurrentScore(inputs)
  const timeline = projectTimeline(currentScore, inputs.commitmentLevel, inputs.target)
  const futureScore = timeline[timeline.length - 1].score
  const futureSelf = buildFutureSelf(inputs, futureScore)

  return {
    healthScore: futureScore,
    currentScore,
    category: getCategory(futureScore),
    timeline,
    futureSelf,
    timeToGoal: estimateTimeToGoal(currentScore, inputs.commitmentLevel),
    disclaimer: DISCLAIMER,
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
  targets: [
    'Menurunkan berat badan',
    'Menambah berat badan',
    'Meningkatkan kebugaran',
    'Memperbaiki kualitas tidur',
    'Mengurangi stres',
    'Mempertahankan gaya hidup sehat',
  ],
}