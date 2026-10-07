import { useState } from 'react'
import {
  User,
  Activity,
  Heart,
  Target,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import {
  SIMULATION_OPTIONS,
  screenTimeLabel,
  calculateStressScore,
  calculateCommitmentScore,
} from '../../services/simulationEngine.js'
import Select from '../ui/Select.jsx'
import Input from '../ui/Input.jsx'
import Slider from '../ui/Slider.jsx'

// ----------------------------------------------------------------
// Static option lists
// ----------------------------------------------------------------
// gender, smokingStatus, alcoholConsumption, and checkupFrequency
// have no equivalent in simulationEngine.SIMULATION_OPTIONS — they
// are not currently consumed by runSimulation(). They are collected
// here for completeness and future engine enhancement (see
// Architecture Adjustments).
// ----------------------------------------------------------------

const GENDER_OPTIONS = ['Perempuan', 'Laki-laki']
const AGE_OPTIONS = Array.from({ length: 91 }, (_, index) => index + 10)
const SMOKING_STATUS_OPTIONS = ['Tidak Merokok', 'Mantan Perokok', 'Perokok Aktif']
const ALCOHOL_CONSUMPTION_OPTIONS = ['Tidak Pernah', 'Jarang', 'Sering']
const CHECKUP_FREQUENCY_OPTIONS = ['Rutin', 'Jarang', 'Tidak Pernah']
const SCREEN_TIME_MAX_HOURS = 15

/**
 * Clamps a value into the [min, max] range.
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Coerces a raw age to a safe integer within [10, 100], falling back
 * to 25 for invalid values.
 */
function clampAge(value) {
  const age = Number(value)
  if (!Number.isFinite(age)) return 25
  return Math.min(100, Math.max(10, Math.round(age)))
}

/**
 * Default values for every field the form collects. `stressLevel`
 * and `commitmentLevel` are excluded on purpose — they are derived
 * automatically at submit time (calculateStressScore /
 * calculateCommitmentScore), and `screenTime` is re-labeled from the
 * numeric `screenTimeHours`. `height`/`weight` (not `height_cm`/
 * `weight_kg`) match simulationEngine.js's existing field names
 * exactly — see Architecture Adjustments.
 */
const DEFAULT_FORM_DATA = {
  age: 25,
  gender: GENDER_OPTIONS[0],
  height: 165,
  weight: 60,
  sleepHours: SIMULATION_OPTIONS.sleepHours[1],
  waterIntake: SIMULATION_OPTIONS.waterIntake[1],
  exerciseFrequency: SIMULATION_OPTIONS.exerciseFrequency[1],
  dietQuality: SIMULATION_OPTIONS.dietQuality[1],
  screenTimeHours: 5,
  smokingStatus: SMOKING_STATUS_OPTIONS[0],
  alcoholConsumption: ALCOHOL_CONSUMPTION_OPTIONS[0],
  checkupFrequency: CHECKUP_FREQUENCY_OPTIONS[1],
  target: SIMULATION_OPTIONS.targets[0],
}

// ----------------------------------------------------------------
// Field wrappers over components/ui primitives
// ----------------------------------------------------------------
// Thin adapters that keep this form's `label + field + onChange`
// calling convention while delegating rendering to the shared
// ui/Select, ui/Input, and ui/Slider primitives.
// ----------------------------------------------------------------

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="mt-1.5">
        <Select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          options={options.map((option) => ({ value: option, label: option }))}
        />
      </div>
    </div>
  )
}

function NumberField({ label, value, onChange, min, max, suffix }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="mt-1.5">
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(event) =>
            onChange(event.target.value === '' ? '' : Number(event.target.value))
          }
          rightIcon={
            suffix ? (
              <span className="text-sm font-medium text-slate-400">{suffix}</span>
            ) : null
          }
        />
      </div>
    </div>
  )
}

/**
 * AgeField — dropdown of ages 10-100 plus ▲/▼ stepper buttons so the
 * value can be nudged without opening the list. `ui/Select` requires
 * string option values, so the numeric age is stringified on the way
 * in and parsed back on change.
 */
function AgeField({ value, onChange }) {
  const current = clampAge(value)
  return (
    <div>
      <label className="label-text">Usia</label>
      <div className="mt-1.5 flex items-center gap-2">
        <Select
          value={String(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          options={AGE_OPTIONS.map((option) => ({
            value: String(option),
            label: String(option),
          }))}
        />
        <div className="flex flex-col">
          <button
            type="button"
            aria-label="Tambah usia"
            className="btn-secondary inline-flex h-6 w-9 items-center justify-center px-0"
            onClick={() => onChange(clampAge(current + 1))}
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            aria-label="Kurangi usia"
            className="btn-secondary inline-flex h-6 w-9 items-center justify-center px-0"
            onClick={() => onChange(clampAge(current - 1))}
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * RadioGroupField — segmented control rendered as buttons with
 * aria-pressed semantics, used for single-choice fields whose
 * options are short Indonesian labels (e.g. gender).
 */
function RadioGroupField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={[
              'rounded-md px-3 py-2 text-sm font-medium transition',
              value === option
                ? 'border border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border border-transparent text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * ScreenTimeField — slider over numeric hours (0-15, in 0.5 steps).
 * The current value is shown as hours plus the derived categorical
 * label so the chatbot's `screenTime` advice stays meaningful.
 */
function ScreenTimeField({ value, onChange }) {
  const current = Number.isFinite(Number(value)) ? Number(value) : 5
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-text mb-0">Screen Time Harian</span>
        <span className="text-sm font-semibold text-emerald-600">
          {current} jam ({screenTimeLabel(current)})
        </span>
      </div>
      <Slider
        min={0}
        max={SCREEN_TIME_MAX_HOURS}
        step={0.5}
        value={current}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

/**
 * ComputedScoreField — read-only display for an automatically
 * computed 1-10 score (stress / commitment). Live-updates from the
 * current form data via simulationEngine's derivation helpers.
 */
function ComputedScoreField({ label, value, note }) {
  const score = Number.isFinite(Number(value)) ? Number(value) : 0
  const max = 10
  const width = `${clamp((score / max) * 100, 0, 100)}%`
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className="text-2xl font-bold text-emerald-600">
          {score}
          <span className="ml-1 text-sm font-semibold text-slate-400">/{max}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-500" style={{ width }} />
      </div>
      {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}
    </div>
  )
}

// ----------------------------------------------------------------
// SimulationForm
// ----------------------------------------------------------------

/**
 * SimulationForm
 * ----------------------------------------------------------------
 * Multi-section input form for SimulationPage, collecting:
 *
 * 1. Data Diri        — age (dropdown + stepper), gender (segmented),
 *                         height (cm), weight (kg)
 * 2. Gaya Hidup        — sleepHours, waterIntake, exerciseFrequency,
 *                         dietQuality (all from SIMULATION_OPTIONS)
 * 3. Kebiasaan & Medis — computed stress, screenTimeHours (slider),
 *                         smokingStatus, alcoholConsumption,
 *                         checkupFrequency
 * 4. Target            — target (SIMULATION_OPTIONS.targets) and the
 *                         computed commitment score
 *
 * Stres dan komitmen TIDAK lagi diisi manual. Keduanya dihitung
 * otomatis dari kebiasaan (calculateStressScore /
 * calculateCommitmentScore) dan ditampilkan live sebagai
 * ComputedScoreField. `screenTime` disimpan sebagai angka
 * (screenTimeHours) dan diubah ke label kategorinya saat submit
 * agar tetap kompatibel dengan chatbot/insight engine.
 *
 * `formData` is initialized from DEFAULT_FORM_DATA merged with
 * `initialData`. On submit, calls onSubmit(inputs) where `inputs`
 * includes the derived stressLevel, commitmentLevel, screenTime, and
 * numeric screenTimeHours — the parent (SimulationPage) passes this
 * to useSimulation's runAndSaveSimulation, so field names here must
 * match simulationEngine.js's expected `inputs` shape exactly
 * (notably `height`/`weight`, not `height_cm`/`weight_kg`).
 *
 * `isSubmitting` (default false) disables the submit button and
 * shows a loading spinner — preserves SimulationPage's existing
 * <SimulationForm onSubmit={...} isSubmitting={isSimulating} />
 * usage.
 *
 * No outer margin — spacing is the parent's responsibility.
 * ----------------------------------------------------------------
 */
export default function SimulationForm({ initialData = {}, onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  }))

  function handleChange(field, value) {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  function resolveScreenTimeHours() {
    return Number.isFinite(Number(formData.screenTimeHours))
      ? Number(formData.screenTimeHours)
      : 5
  }

  const computedInputs = {
    ...formData,
    screenTimeHours: resolveScreenTimeHours(),
  }

  const liveStress = calculateStressScore(computedInputs)
  const liveCommitment = calculateCommitmentScore(computedInputs)

  function handleSubmit(event) {
    event.preventDefault()
    const screenTimeHours = resolveScreenTimeHours()
    onSubmit({
      ...formData,
      screenTimeHours,
      screenTime: screenTimeLabel(screenTimeHours),
      stressLevel: calculateStressScore({ ...formData, screenTimeHours }),
      commitmentLevel: calculateCommitmentScore({ ...formData, screenTimeHours }),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 1. Data Diri */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <User size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Data Diri</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AgeField
            value={formData.age}
            onChange={(value) => handleChange('age', value)}
          />
          <RadioGroupField
            label="Jenis Kelamin"
            value={formData.gender}
            onChange={(value) => handleChange('gender', value)}
            options={GENDER_OPTIONS}
          />
          <NumberField
            label="Tinggi Badan"
            value={formData.height}
            onChange={(value) => handleChange('height', value)}
            min={100}
            max={250}
            suffix="cm"
          />
          <NumberField
            label="Berat Badan"
            value={formData.weight}
            onChange={(value) => handleChange('weight', value)}
            min={20}
            max={250}
            suffix="kg"
          />
        </div>
      </div>

      {/* 2. Gaya Hidup */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Activity size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Gaya Hidup</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Jam Tidur Rata-rata"
            value={formData.sleepHours}
            onChange={(value) => handleChange('sleepHours', value)}
            options={SIMULATION_OPTIONS.sleepHours}
          />
          <SelectField
            label="Konsumsi Air Putih"
            value={formData.waterIntake}
            onChange={(value) => handleChange('waterIntake', value)}
            options={SIMULATION_OPTIONS.waterIntake}
          />
          <SelectField
            label="Frekuensi Olahraga"
            value={formData.exerciseFrequency}
            onChange={(value) => handleChange('exerciseFrequency', value)}
            options={SIMULATION_OPTIONS.exerciseFrequency}
          />
          <SelectField
            label="Kualitas Pola Makan"
            value={formData.dietQuality}
            onChange={(value) => handleChange('dietQuality', value)}
            options={SIMULATION_OPTIONS.dietQuality}
          />
        </div>
      </div>

      {/* 3. Kebiasaan & Medis */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Heart size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Kebiasaan &amp; Medis</h3>
        </div>

        <div className="flex flex-col gap-4">
          <ComputedScoreField
            label="Tingkat Stres"
            value={liveStress}
            note="Dihitung otomatis dari kebiasaan gaya hidup Anda — semakin sehat, semakin rendah stres."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ScreenTimeField
              value={formData.screenTimeHours}
              onChange={(value) => handleChange('screenTimeHours', value)}
            />
            <SelectField
              label="Status Merokok"
              value={formData.smokingStatus}
              onChange={(value) => handleChange('smokingStatus', value)}
              options={SMOKING_STATUS_OPTIONS}
            />
            <SelectField
              label="Konsumsi Alkohol"
              value={formData.alcoholConsumption}
              onChange={(value) => handleChange('alcoholConsumption', value)}
              options={ALCOHOL_CONSUMPTION_OPTIONS}
            />
            <SelectField
              label="Frekuensi Medical Check-up"
              value={formData.checkupFrequency}
              onChange={(value) => handleChange('checkupFrequency', value)}
              options={CHECKUP_FREQUENCY_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* 4. Target */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Target size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Target</h3>
        </div>

        <div className="flex flex-col gap-4">
          <SelectField
            label="Target Kesehatan"
            value={formData.target}
            onChange={(value) => handleChange('target', value)}
            options={SIMULATION_OPTIONS.targets}
          />
          <ComputedScoreField
            label="Tingkat Komitmen"
            value={liveCommitment}
            note="Dihitung otomatis dari konsistensi kebiasaan sehat Anda."
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
        Jalankan Simulasi
      </button>
    </form>
  )
}