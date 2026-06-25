import { CHATBOT_SUGGESTIONS } from '../../utils/constants.js'

/**
 * ChatSuggestions
 * ----------------------------------------------------------------
 * Quick-reply suggestion chips for the ChatWidget. Renders a row
 * of tappable buttons that pre-fill the chat input with common
 * user intents.
 *
 * Props:
 * - onSelect:  (text: string) => void — called when a chip is tapped
 * - disabled:  boolean — disables chips when the bot is "typing"
 * ----------------------------------------------------------------
 */
export default function ChatSuggestions({ onSelect, disabled = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHATBOT_SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
