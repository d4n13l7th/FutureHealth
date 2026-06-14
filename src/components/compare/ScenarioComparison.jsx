const FALLBACK_VALUE = '-'

/**
 * Formats a health score for display, falling back to "-" if the
 * value is missing, not a number, or NaN.
 */
function formatScore(value) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : FALLBACK_VALUE
}

/**
 * ScenarioComparison
 * ----------------------------------------------------------------
 * Side-by-side comparison board for CompareFuturesPage, displaying
 * Scenario A (current baseline) and Scenario B (tweaked
 * alternative) results — health score and category for each.
 *
 * Reads from simulationEngine.runSimulation() result objects
 * (resultA/resultB), as produced by
 * simulationEngine.compareScenarios().
 *
 * Defensive: missing `resultA`/`resultB` or missing
 * `healthScore`/`category` render fallback "-" rather than crashing
 * or showing "undefined".
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no hooks, no context, no API calls.
 * ----------------------------------------------------------------
 */
export default function ScenarioComparison({ resultA, resultB }) {
  const cards = [
    {
      key: 'scenario-a',
      label: 'Skenario A (Saat Ini)',
      result: resultA,
      accentClassName: 'border-slate-100',
    },
    {
      key: 'scenario-b',
      label: 'Skenario B (Alternatif)',
      result: resultB,
      accentClassName: 'border-emerald-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <div key={card.key} className={`card border-2 ${card.accentClassName}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {card.label}
          </p>
          <p className="mt-3 text-4xl font-bold text-emerald-500">
            {formatScore(card.result?.healthScore)}
            <span className="text-base font-medium text-slate-400"> / 100</span>
          </p>
          <span className="pill mt-3">{card.result?.category ?? FALLBACK_VALUE}</span>
        </div>
      ))}
    </div>
  )
}