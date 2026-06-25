/**
 * WhatIfControl
 * ----------------------------------------------------------------
 * Single variable control for the What-If simulator. Renders a
 * select dropdown or slider for one lifestyle variable.
 *
 * Props:
 * - label:    string — display label for the control
 * - field:    string — the input field key (e.g. 'sleepHours')
 * - type:     'select' | 'range' — control type
 * - options:  string[] — for select type, the available options
 * - value:    string | number — current value
 * - onChange: (field: string, value: string | number) => void
 * - min:      number — for range type
 * - max:      number — for range type
 * ----------------------------------------------------------------
 */
export default function WhatIfControl({
  label,
  field,
  type = 'select',
  options = [],
  value,
  onChange,
  min = 1,
  max = 10,
}) {
  if (type === 'range') {
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm font-semibold text-emerald-600">
            {value}/{max}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value ?? min}
          onChange={(e) => onChange(field, Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
        />
      </div>
    )
  }

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(field, e.target.value)}
        className="input-field mt-1.5"
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
