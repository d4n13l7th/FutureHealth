import { Send } from 'lucide-react'

/**
 * ChatInput
 * ----------------------------------------------------------------
 * Presentational input form for the AI Assistant interface
 * (ChatWidget). Fully controlled — text state lives in the parent
 * and is passed in via `inputText`/`setInputText`.
 *
 * - Input: bound to `inputText`, updates via `setInputText`,
 *   triggers `handleSendMessage` on Enter, disabled while
 *   `isLoading`.
 * - Button: triggers `handleSendMessage` on click, disabled if
 *   `inputText` is empty/whitespace-only or `isLoading` is true,
 *   with a dimmed visual state when disabled.
 *
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function ChatInput({ inputText, setInputText, handleSendMessage, isLoading }) {
  const isSendDisabled = isLoading || !inputText.trim()

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={inputText}
        onChange={(event) => setInputText(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder="Tulis pertanyaan Anda..."
        className="input-field"
      />
      <button
        type="button"
        onClick={handleSendMessage}
        disabled={isSendDisabled}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Kirim pesan"
      >
        <Send size={18} />
      </button>
    </div>
  )
}