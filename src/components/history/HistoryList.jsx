import HistoryItemCard from './HistoryItemCard.jsx'

/**
 * HistoryList
 * ----------------------------------------------------------------
 * Grid/list wrapper component for HistoryItemCard items.
 * Provides the layout container for the history page's simulation
 * list.
 *
 * Props:
 * - history:  Array of simulation records from useSimulationHistory
 * - onSelect: (simulation) => void — optional callback when a card
 *             is clicked (e.g. navigate to /history/:id)
 * ----------------------------------------------------------------
 */
export default function HistoryList({ history = [], onSelect }) {
  if (history.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {history.map((simulation) => (
        <HistoryItemCard
          key={simulation?.id ?? simulation?.created_at}
          simulation={simulation}
          onClick={onSelect ? () => onSelect(simulation) : undefined}
        />
      ))}
    </div>
  )
}
