import { useState, useCallback } from 'react'
import { useSimulationContext } from '../context/SimulationContext.jsx'
import { generateChatbotResponse } from '../services/chatbotEngine.js'

const INITIAL_GREETING = {
  id: 'initial-greeting',
  text: 'Halo! Saya Asisten AI FutureHealth. Ada yang bisa saya bantu hari ini?',
  sender: 'ai',
}

/**
 * useChatbot
 * ----------------------------------------------------------------
 * State manager for FutureHealth's AI Assistant (ChatWidget).
 *
 * Bridges:
 *   1. The chat UI       — messages[], isTyping
 *   2. SimulationContext  — currentInputs/currentResult, used to
 *                            build `contextData` for personalization
 *   3. chatbotEngine.js   — generateChatbotResponse(text, contextData)
 *
 * Usage (in ChatWidget):
 *   const { messages, isTyping, sendMessage } = useChatbot()
 *
 *   <ChatInput onSend={sendMessage} disabled={isTyping} />
 *   {messages.map(m => <ChatBubble key={m.id} message={m} />)}
 *   {isTyping && <TypingIndicator />}
 * ----------------------------------------------------------------
 */
export function useChatbot() {
  const { currentInputs, currentResult } = useSimulationContext()

  const [messages, setMessages] = useState([INITIAL_GREETING])
  const [isTyping, setIsTyping] = useState(false)

  /**
   * Sends a user message, generates a (simulated) AI response via
   * chatbotEngine.generateChatbotResponse(), and appends both to
   * the conversation.
   *
   * No-ops if `text` is empty/whitespace-only, or if the assistant
   * is already generating a response (`isTyping`).
   *
   * @param {string} text - The user's message text.
   */
  const sendMessage = useCallback(
    async (text) => {
      const trimmedText = text?.trim()

      if (!trimmedText || isTyping) {
        return
      }

      const userMessage = {
        id: Date.now().toString(),
        text: trimmedText,
        sender: 'user',
      }

      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)

      const contextData = currentInputs
        ? { inputs: currentInputs, results: currentResult }
        : null

      try {
        const responseText = await generateChatbotResponse(trimmedText, contextData)

        const aiMessage = {
          id: `${Date.now().toString()}-ai`,
          text: responseText,
          sender: 'ai',
        }

        setMessages((prev) => [...prev, aiMessage])
      } finally {
        setIsTyping(false)
      }
    },
    [isTyping, currentInputs, currentResult]
  )

  return {
    messages,
    isTyping,
    sendMessage,
  }
}