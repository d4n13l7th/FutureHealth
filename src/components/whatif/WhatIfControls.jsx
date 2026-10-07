import WhatIfControl from './WhatIfControl.jsx'
import { SIMULATION_OPTIONS } from '../../services/simulationEngine.js'

const SELECT_FIELDS = [
  { field: 'sleepHours', label: 'Jam Tidur' },
  { field: 'waterIntake', label: 'Air Putih' },
  { field: 'exerciseFrequency', label: 'Frekuensi Olahraga' },
  { field: 'dietQuality', label: 'Kualitas Pola Makan' },
]

const RANGE_FIELDS = [
  { field: 'stressLevel', label: 'Tingkat Stres', min: 1, max: 10 },
  { field: 'commitmentLevel', label: 'Tingkat Komitmen', min: 1, max: 10 },
  { field: 'screenTimeHours', label: 'Screen Time Harian', min: 0, max: 15, step: 0.5, unit: ' jam' },
]

/**
 * WhatIfControls
 * ----------------------------------------------------------------
 * Editable set of lifestyle variables for the What-If simulator.
 * Renders a select per categorical variable (from
 * SIMULATION_OPTIONS) and a slider per 1-10 variable.
 *
 * Props:
 * - baseInputs:  object — the current simulation inputs (displayed
 *                as the value until an override exists)
 * - overrides:   object — active overrides, keyed by field
 * - onChange:    (field, value) => void — called with a single
 *                field change; WhatIfPanel wraps it into
 *                calculateWhatIf({ [field]: value })
 * ----------------------------------------------------------------
 */
export default function WhatIfControls({ baseInputs = {}, overrides = {}, onChange }) {
  const valueOf = (field) => overrides[field] ?? baseInputs[field]

  function handleChange(field, value) {
    onChange(field, value)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SELECT_FIELDS.map(({ field, label }) => (
          <WhatIfControl
            key={field}
            label={label}
            field={field}
            type="select"
            options={SIMULATION_OPTIONS[field] ?? []}
            value={valueOf(field)}
            onChange={handleChange}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {RANGE_FIELDS.map(({ field, label, min, max, step, unit }) => (
          <WhatIfControl
            key={field}
            label={label}
            field={field}
            type="range"
            min={min}
            max={max}
            step={step}
            unit={unit}
            value={valueOf(field)}
            onChange={handleChange}
          />
        ))}
      </div>
    </div>
  )
}
