import { useEffect } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'framer-motion'

const SIZE = 180
const STROKE_WIDTH = 14
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Derives the color theme (stroke + text color classes) from a raw
 * 0-100 score. Intentionally based on the numeric score only — not
 * on the `category` label — so this component stays a generic,
 * reusable "scored ring" primitive decoupled from FutureHealth's
 * category taxonomy (simulationEngine.js).
 */
function getScoreTheme(score) {
  if (score >= 80) {
    return { stroke: '#10B981', text: 'text-emerald-500' } // emerald
  }
  if (score >= 60) {
    return { stroke: '#FBBF24', text: 'text-amber-500' } // amber
  }
  return { stroke: '#EF4444', text: 'text-red-500' } // red
}

/**
 * HealthScoreCircle
 * ----------------------------------------------------------------
 * Large animated circular progress indicator showing the user's
 * projected future health score (0-100) and its category label.
 *
 * Animation:
 * - A single `useMotionValue` (0 -> 1) is animated on mount via
 *   `animate()` with an ease-out curve.
 * - The SVG progress circle's `strokeDashoffset` is derived from
 *   this value via `useTransform`, so the ring fills smoothly.
 * - The displayed number is derived from the SAME value via a
 *   second `useTransform` (0 -> score, rounded), so the ring and
 *   the counter are perfectly synchronized off one driver.
 *
 * Color coding (stroke + number) is based purely on the numeric
 * `score`:
 *   - score >= 80 -> emerald
 *   - score >= 60 -> amber
 *   - score <  60 -> red
 *
 * Purely presentational — no context, no API calls.
 * ----------------------------------------------------------------
 */
export default function HealthScoreCircle({ score, category }) {
  const clampedScore = Math.min(100, Math.max(0, score))
  const theme = getScoreTheme(clampedScore)

  // Single animation driver: 0 -> 1
  const progress = useMotionValue(0)

  // Ring fill: full circumference (hidden) -> offset for `score`%
  const strokeDashoffset = useTransform(
    progress,
    [0, 1],
    [CIRCUMFERENCE, CIRCUMFERENCE * (1 - clampedScore / 100)]
  )

  // Count-up number: 0 -> score, rounded to an integer for display
  const roundedScore = useTransform(progress, (value) =>
    Math.round(value * clampedScore)
  )

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1], // ease-out-expo: fast start, gentle landing
    })

    return () => controls.stop()
  }, [progress, clampedScore])

  return (
    <div className="card flex flex-col items-center justify-center gap-1 px-8 py-6">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Skor Kesehatan
      </span>

      <div className="relative my-2 h-[180px] w-[180px]">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Animated progress ring */}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={theme.stroke}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset }}
          />
        </svg>

        {/* Centered score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className={`text-5xl font-bold ${theme.text}`}>
            {roundedScore}
          </motion.span>
          <span className="text-sm text-slate-400">/ 100</span>
        </div>
      </div>

      <span className="pill">{category}</span>
    </div>
  )
}