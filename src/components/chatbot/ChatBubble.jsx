import { Bot, User } from 'lucide-react'

/**
 * ChatBubble
 * ----------------------------------------------------------------
 * Individual chat message bubble for the AI Assistant interface
 * (ChatWidget). Renders one entry from useChatbot()'s `messages`
 * array.
 *
 * - sender === 'user': right-aligned (flex-row-reverse), emerald
 *   bubble, User avatar icon.
 * - sender === 'ai' (or any other value): left-aligned, slate
 *   bubble, Bot avatar icon.
 *
 * Bubble width is capped at 75% of the container so long messages
 * wrap neatly, with relaxed line height for readability.
 *
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function ChatBubble({ message }) {
  const isUser = message?.sender === 'user'

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
        }`}
      >
        {message?.text}
      </div>
    </div>
  )
}