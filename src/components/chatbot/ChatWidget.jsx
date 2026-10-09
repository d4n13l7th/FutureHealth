import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Bot } from 'lucide-react'
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
      <div className="fixed bottom-24 right-6 z-50 sm:bottom-6">
        <div className="relative">
          <span
            className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
            aria-label="Buka Asisten AI FutureHealth"
          >
            <MessageSquare size={24} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex h-full w-full flex-col overflow-hidden border border-slate-100 bg-white shadow-2xl animate-slide-in-right sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[500px] sm:max-h-[80vh] sm:w-96 sm:rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-emerald-700 px-4 py-3 text-white">
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
            <div key={message.id} className="animate-bubble-in">
              <ChatBubble message={message} />
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Bot size={16} />
              </div>
              <div
                className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-4 py-3"
                role="status"
                aria-label="Asisten sedang mengetik"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-typing-dot" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-typing-dot" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-typing-dot" />
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