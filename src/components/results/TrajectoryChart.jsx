import { motion } from 'framer-motion'
import { Calendar, TrendingUp } from 'lucide-react'

const PAD = { top: 26, right: 24, bottom: 40, left: 24 }

function formatLabel(label) {
  return label
}

function buildSmoothPath(points) {
  if (points.length < 2) {
    return ''
  }

  const n = points.length
  const d = []
  d.push(`M ${points[0].x} ${points[0].y}`)

  for (let i = 0; i < n - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[0]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = i + 2 < n ? points[i + 2] : points[i + 1]

    const tension = 0.5
    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6

    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`)
  }

  return d.join(' ')
}

export default function TrajectoryChart({ timeline, whatIfTimeline, compact = false }) {
  const hasTimeline = Array.isArray(timeline) && timeline.length > 0
  const hasWhatIf = Array.isArray(whatIfTimeline) && whatIfTimeline.length > 0

  const viewWidth = 600
  const viewHeight = 260
  const w = viewWidth - PAD.left - PAD.right
  const h = viewHeight - PAD.top - PAD.bottom

  if (!hasTimeline) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <Calendar size={20} className="text-emerald-600" />
        </div>
        <p className="text-sm text-slate-500">
          Data perjalanan kesehatan belum tersedia.
        </p>
      </div>
    )
  }

  const items = timeline
  const count = items.length
  const stepX = count > 1 ? w / (count - 1) : 0

  const toX = (idx) => PAD.left + idx * stepX
  const toY = (score) => {
    const s = Math.max(0, Math.min(100, Number(score) || 0))
    return PAD.top + h - (s / 100) * h
  }

  const points = items.map((m, idx) => ({
    x: toX(idx),
    y: toY(m.score),
    label: m.label,
    score: Math.max(0, Math.min(100, Math.round(Number(m.score) || 0))),
  }))

  const smoothPath = buildSmoothPath(points)
  const lastPoint = points[points.length - 1]

  const areaPath = smoothPath
    ? `${smoothPath} L ${lastPoint.x} ${viewHeight - PAD.bottom} L ${points[0].x} ${viewHeight - PAD.bottom} Z`
    : ''

  const whatIfPoints = hasWhatIf
      ? whatIfTimeline.map((m, idx) => ({
          x: idx < count ? (count > 1 ? (idx / (count - 1)) * w + PAD.left : toX(idx)) : toX(Math.min(idx, count - 1)),
          y: toY(m.score),
        }))
      : []
  const whatIfSmoothPath = buildSmoothPath(whatIfPoints.filter((_, i) => i < count))

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Perjalanan Skor Kesehatan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Visualisasi lintasan dari hari ini menuju tujuan Anda
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
          <TrendingUp size={14} />
          Prediksi berbasis simulasi
        </div>
      </div>

      <div className={`relative mt-6 ${compact ? 'h-[200px]' : 'h-[260px]'}`}>
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="trajectoryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E7D5B" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2E7D5B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((tick) => {
            const y = PAD.top + h - (tick / 100) * h
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={viewWidth - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="#E6DFD3"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={PAD.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-xs"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {count > 1 && areaPath && (
            <path d={areaPath} fill="url(#trajectoryFill)" />
          )}

          {smoothPath && (
            <motion.path
              d={smoothPath}
              fill="none"
              stroke="#2E7D5B"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          )}

          {hasWhatIf && whatIfSmoothPath && (
            <motion.path
              d={whatIfSmoothPath}
              fill="none"
              stroke="#3D736D"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 6"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
            />
          )}

          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={idx === points.length - 1 ? 6 : 4}
              fill="#FAF8F4"
              stroke={idx === points.length - 1 ? '#2E7D5B' : '#C0DDCB'}
              strokeWidth={idx === points.length - 1 ? 3 : 2}
            />
          ))}
        </svg>

        <div className="absolute inset-0">
          {points.map((p, idx) => {
            const xPct = ((p.x - PAD.left) / Math.max(1, w)) * 100
            const yPct = ((p.y - PAD.top) / Math.max(1, h)) * 100
            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  marginTop: idx === points.length - 1 ? '-6px' : '-4px',
                }}
              >
                <div className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-100">
                  {p.score}
                </div>
                <div className="mt-1 text-center text-xs text-slate-500">
                  {formatLabel(p.label)}
                </div>
              </div>
            )
          })}
        </div>

        {hasWhatIf && (
          <div className="absolute bottom-0 left-4 flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-block h-0.5 w-6 border-b-2 border-dashed border-[#3D736D]" />
            <span>Skenario What-If</span>
          </div>
        )}
      </div>
    </div>
  )
}
