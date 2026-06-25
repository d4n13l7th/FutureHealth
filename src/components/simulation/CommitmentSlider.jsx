/**
 * CommitmentSlider
 * ----------------------------------------------------------------
 * Wraps ui/Slider for the commitment level input in the simulation
 * wizard. Shows descriptive labels for low/medium/high commitment.
 *
 * Props:
 * - value:    number (1-10)
 * - onChange: (value: number) => void
 * ----------------------------------------------------------------
 */
export default function CommitmentSlider({ value = 5, onChange }) {
  const commitmentLabel =
    value >= 8
      ? 'Sangat Tinggi'
      : value >= 6
      ? 'Tinggi'
      : value >= 4
      ? 'Sedang'
      : 'Rendah'

  const commitmentColor =
    value >= 8
      ? 'text-emerald-600'
      : value >= 6
      ? 'text-emerald-500'
      : value >= 4
      ? 'text-amber-500'
      : 'text-red-500'

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-text mb-0">Tingkat Komitmen</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${commitmentColor}`}>
            {value}/10
          </span>
          <span className={`text-xs font-medium ${commitmentColor}`}>
            ({commitmentLabel})
          </span>
        </div>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>Rendah</span>
        <span>Tinggi</span>
      </div>
    </div>
  )
}
