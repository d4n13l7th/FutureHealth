import { useState } from 'react'
import { User, Activity, Heart, Target, ChevronRight, Loader2 } from 'lucide-react'
import { SIMULATION_OPTIONS } from '../../services/simulationEngine.js'

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
const SMOKING_STATUS_OPTIONS = ['Tidak Merokok', 'Mantan Perokok', 'Perokok Aktif']
const ALCOHOL_CONSUMPTION_OPTIONS = ['Tidak Pernah', 'Jarang', 'Sering']
const CHECKUP_FREQUENCY_OPTIONS = ['Rutin', 'Jarang', 'Tidak Pernah']

/**
 * Default values for every field runSimulation() (and this form)
 * expects. `height`/`weight` (not `height_cm`/`weight_kg`) match
 * simulationEngine.js's existing field names exactly — see
 * Architecture Adjustments.
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
  stressLevel: 5,
  screenTime: SIMULATION_OPTIONS.screenTime[1],
  smokingStatus: SMOKING_STATUS_OPTIONS[0],
  alcoholConsumption: ALCOHOL_CONSUMPTION_OPTIONS[0],
  checkupFrequency: CHECKUP_FREQUENCY_OPTIONS[1],
  commitmentLevel: 5,
  target: SIMULATION_OPTIONS.targets[0],
}

// ----------------------------------------------------------------
// Local field primitives
// ----------------------------------------------------------------
// TODO: replace with components/ui/Select.jsx, Input.jsx, and
// Slider.jsx respectively once those UI primitives are generated.
// ----------------------------------------------------------------

/** TODO: replace with components/ui/Select.jsx */
function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-field"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

/** TODO: replace with components/ui/Input.jsx */
function NumberField({ label, value, onChange, min, max, suffix }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(event) =>
            onChange(event.target.value === '' ? '' : Number(event.target.value))
          }
          className={`input-field ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

/** TODO: replace with components/ui/Slider.jsx */
function RangeField({ label, value, onChange, min = 1, max = 10 }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-text mb-0">{label}</span>
        <span className="text-sm font-semibold text-emerald-600">
          {value}/{max}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
      />
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
 * 1. Data Diri        — age, gender, height (cm), weight (kg)
 * 2. Gaya Hidup        — sleepHours, waterIntake, exerciseFrequency,
 *                         dietQuality (all from SIMULATION_OPTIONS)
 * 3. Kebiasaan & Medis — stressLevel (1-10), screenTime,
 *                         smokingStatus, alcoholConsumption,
 *                         checkupFrequency
 * 4. Target & Komitmen — target (SIMULATION_OPTIONS.targets),
 *                         commitmentLevel (1-10)
 *
 * `formData` is initialized from DEFAULT_FORM_DATA merged with
 * `initialData`. On submit, calls onSubmit(formData) — the parent
 * (SimulationPage) passes this to useSimulation's
 * runAndSaveSimulation, so field names here must match
 * simulationEngine.js's expected `inputs` shape exactly (notably
 * `height`/`weight`, not `height_cm`/`weight_kg`).
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

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(formData)
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
          <NumberField
            label="Usia"
            value={formData.age}
            onChange={(value) => handleChange('age', value)}
            min={10}
            max={100}
            suffix="tahun"
          />
          <SelectField
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
          <RangeField
            label="Tingkat Stres"
            value={formData.stressLevel}
            onChange={(value) => handleChange('stressLevel', value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Screen Time Harian"
              value={formData.screenTime}
              onChange={(value) => handleChange('screenTime', value)}
              options={SIMULATION_OPTIONS.screenTime}
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

      {/* 4. Target & Komitmen */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Target size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Target &amp; Komitmen</h3>
        </div>

        <div className="flex flex-col gap-4">
          <SelectField
            label="Target Kesehatan"
            value={formData.target}
            onChange={(value) => handleChange('target', value)}
            options={SIMULATION_OPTIONS.targets}
          />
          <RangeField
            label="Tingkat Komitmen"
            value={formData.commitmentLevel}
            onChange={(value) => handleChange('commitmentLevel', value)}
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