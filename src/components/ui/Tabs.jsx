/**
 * Tabs
 * ----------------------------------------------------------------
 * Generic tab navigation component. Used by ResultsPage for
 * Overview / Insights / What-If / Narrative tabs.
 *
 * Props:
 * - tabs:       Array<{ id: string, label: string, icon?: LucideIcon }>
 * - activeTab:  string — the currently active tab id
 * - onChange:   (tabId: string) => void
 * - className:  string — additional CSS classes on the container
 * ----------------------------------------------------------------
 */
export default function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`flex gap-2 overflow-x-auto border-b border-slate-100 pb-px ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
