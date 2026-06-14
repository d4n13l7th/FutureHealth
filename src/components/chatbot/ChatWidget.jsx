import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Bot, Loader2 } from 'lucide-react'
import { useChatbot } from '../../hooks/useChatbot.js'
import ChatBubble from './ChatBubble.jsx'
import ChatInput from './ChatInput.jsx'

// ----------------------------------------------------------------
// ChatWidget
// ----------------------------------------------------------------

/**
 * ChatWidget
 * ----------------------------------------------------------------
 * Floating AI Assistant interface, rendered globally for
 * authenticated users (see MainLayout.jsx).
 *
 * - Closed: a circular trigger button toggling `isOpen`.
 * - Open: a chat window with header (title + close), scrollable
 * message list (auto-scrolling to the latest message via
 * messagesEndRef), a typing indicator while the assistant is
 * "thinking", and a text input footer.
 *
 * State and response generation are delegated to useChatbot(),
 * which in turn uses chatbotEngine.generateChatbotResponse() with
 * context from SimulationContext for personalized answers.
 *
 * fixed bottom-6 right-6 z-50 — overlays all other page content.
 * ----------------------------------------------------------------
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const { messages, isTyping, sendMessage } = useChatbot()
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendMessage = () => {
    const trimmed = inputText.trim()
    if (!trimmed) return
    
    sendMessage(trimmed)
    setInputText('')
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
          aria-label="Buka Asisten AI FutureHealth"
        >
          <MessageSquare size={24} />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[500px] max-h-[80vh] w-80 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Bot size={18} />
          <span className="font-semibold">Asisten AI FutureHealth</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Tutup asisten"
          className="rounded-full p-1 transition-colors hover:bg-white/20"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                Mengetik...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3">
        <ChatInput 
          inputText={inputText}
          setInputText={setInputText}
          handleSendMessage={handleSendMessage}
          isLoading={isTyping}
        />
      </div>
    </div>
  )
}