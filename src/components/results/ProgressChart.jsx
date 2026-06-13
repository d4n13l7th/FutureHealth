import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Flag } from 'lucide-react'

const EMERALD = '#10b981'

/**
 * CustomTooltip
 * ----------------------------------------------------------------
 * Minimal, on-brand tooltip shown on hover over a data point.
 * Displays the milestone label and its score out of 100.
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null

  const score = payload[0]?.value

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-emerald-600">{score} / 100</p>
    </div>
  )
}

/**
 * ProgressChart
 * ----------------------------------------------------------------
 * Presentational line chart for the Overview tab of ResultsPage.
 * Plots the `timeline` array returned by
 * simulationEngine.projectTimeline() / runSimulation()
 * (e.g. Hari Ini -> Bulan 1 -> Bulan 3 -> Bulan 6 -> Bulan 12) as a
 * continuous health-score trajectory.
 *
 * - X-axis: milestone `label` (e.g. "Bulan 3")
 * - Y-axis: fixed domain [0, 100] since score is a strict percentage
 * - Line styled in emerald (#10b981), smooth, with visible dots
 * - Minimal CartesianGrid (horizontal only) for a clean look
 * - Custom tooltip matching the slate/emerald design system
 *
 * Gracefully falls back to an empty-state message (matching
 * Timeline.jsx's style) if `timeline` is missing, empty, or not an
 * array.
 *
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function ProgressChart({ timeline }) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 py-10 text-center">
        <Flag size={24} className="text-slate-300" />
        <p className="text-sm text-slate-400">
          Data grafik perkembangan belum tersedia.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900">Grafik Perkembangan Skor</h3>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#94A3B8' }}
              axisLine={{ stroke: '#F1F5F9' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0' }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke={EMERALD}
              strokeWidth={3}
              dot={{ r: 4, fill: EMERALD, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}