import Select from '../ui/Select.jsx'
import Slider from '../ui/Slider.jsx'

const SLEEP_HOURS_OPTIONS = [
    { value: '<5', label: 'Kurang dari 5 jam' },
    { value: '5-6', label: '5-6 jam' },
    { value: '7-8', label: '7-8 jam' },
    { value: '>8', label: 'Lebih dari 8 jam' },
]

const WATER_INTAKE_OPTIONS = [
    { value: '<1L', label: 'Kurang dari 1 Liter' },
    { value: '1-2L', label: '1-2 Liter' },
    { value: '2-3L', label: '2-3 Liter' },
    { value: '>3L', label: 'Lebih dari 3 Liter' },
]

const EXERCISE_FREQUENCY_OPTIONS = [
    { value: 'jarang', label: 'Jarang / Tidak pernah' },
    { value: '1-2x', label: '1-2 kali seminggu' },
    { value: '3-4x', label: '3-4 kali seminggu' },
    { value: 'setiap_hari', label: 'Hampir setiap hari' },
]

const DIET_QUALITY_OPTIONS = [
    { value: 'buruk', label: 'Sering fast food / tinggi gula' },
    { value: 'sedang', label: 'Campur (kadang sehat, kadang tidak)' },
    { value: 'baik', label: 'Sehat & seimbang (kaya serat/protein)' },
]

/**
 * LifestyleStep
 * ----------------------------------------------------------------
 * Step 2 of 3 in the SimulationForm wizard. Collects lifestyle
 * inputs: sleep hours, water intake, exercise frequency, diet
 * quality, and stress level.
 *
 * Fully controlled by the parent SimulationForm via `formData` and
 * the generic `onChange(field, value)` updater — no internal state.
 *
 * NOTE: the option value codes used here ('<5', '<1L', 'jarang',
 * 'buruk', etc.) do not currently match simulationEngine.js's
 * scoring table keys (SLEEP_SCORES, WATER_SCORES,
 * EXERCISE_SCORES, DIET_SCORES). See Architecture Adjustments for
 * the required follow-up to simulationEngine.js.
 *
 * Props:
 * - formData: { sleepHours, waterIntake, exerciseFrequency, dietQuality, stressLevel, ... }
 * - onChange: (field: string, value: string | number) => void
 * ----------------------------------------------------------------
 */
export default function LifestyleStep({ formData, onChange }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <label htmlFor="sleepHours" className="label-text mb-2 block">
                    Jam Tidur
                </label>
                <Select
                    id="sleepHours"
                    value={formData.sleepHours}
                    onChange={(e) => onChange('sleepHours', e.target.value)}
                    options={SLEEP_HOURS_OPTIONS}
                />
            </div>

            <div>
                <label htmlFor="waterIntake" className="label-text mb-2 block">
                    Konsumsi Air
                </label>
                <Select
                    id="waterIntake"
                    value={formData.waterIntake}
                    onChange={(e) => onChange('waterIntake', e.target.value)}
                    options={WATER_INTAKE_OPTIONS}
                />
            </div>

            <div>
                <label htmlFor="exerciseFrequency" className="label-text mb-2 block">
                    Frekuensi Olahraga
                </label>
                <Select
                    id="exerciseFrequency"
                    value={formData.exerciseFrequency}
                    onChange={(e) => onChange('exerciseFrequency', e.target.value)}
                    options={EXERCISE_FREQUENCY_OPTIONS}
                />
            </div>

            <div>
                <label htmlFor="dietQuality" className="label-text mb-2 block">
                    Pola Makan
                </label>
                <Select
                    id="dietQuality"
                    value={formData.dietQuality}
                    onChange={(e) => onChange('dietQuality', e.target.value)}
                    options={DIET_QUALITY_OPTIONS}
                />
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="stressLevel" className="label-text mb-0">
                        Tingkat Stres
                    </label>
                    <span className="text-sm font-bold text-emerald-600">
                        {formData.stressLevel}/10
                    </span>
                </div>
                <Slider
                    id="stressLevel"
                    min={1}
                    max={10}
                    step={1}
                    value={formData.stressLevel}
                    onChange={(e) => onChange('stressLevel', Number(e.target.value))}
                />
            </div>
        </div>
    )
}