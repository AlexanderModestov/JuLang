import { useState, useEffect, useRef, useCallback } from 'react'
import { useTeacherChatStore } from '@/store/teacherChatStore'
import { useAppStore } from '@/store/useAppStore'
import { useAuthContext } from '@/contexts/AuthContext'
import * as TeacherChatService from '@/services/TeacherChatService'
import type { TeacherMessage as TeacherMessageType } from '@/types'
import { getDefaultTeacherLanguage } from '@/types'
import TeacherMessage from './TeacherMessage'
import ContextBadge from './ContextBadge'

/**
 * Teacher chat widget positioned in the bottom-right corner.
 * Displays conversation history with the AI teacher.
 */
export default function TeacherChatWidget() {
  const {
    isOpen,
    isMinimized,
    closeChat,
    minimizeChat,
    currentContext,
    clearUnread,
  } = useTeacherChatStore()
  const { settings } = useAppStore()
  const { user, profile } = useAuthContext()

  const [messages, setMessages] = useState<TeacherMessageType[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Load message history on mount and when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      loadHistory()
      clearUnread()
    }
  }, [isOpen, isMinimized, clearUnread])

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle click outside to minimize
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node) &&
        isOpen &&
        !isMinimized
      ) {
        minimizeChat()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, isMinimized, minimizeChat])

  const loadHistory = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const history = await TeacherChatService.getHistory(user.id, 50, 0)
      setMessages(history)
    } catch (err) {
      console.error('Failed to load chat history:', err)
      setError('Не удалось загрузить историю чата')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const handleSend = async () => {
    if (!input.trim() || isSending || !user || !profile) return

    const messageContent = input.trim()
    setInput('')
    setIsSending(true)
    setError(null)

    // Optimistically add user message to UI
    const tempUserMessage: TeacherMessageType = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      context: currentContext,
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const frenchLevel = profile.french_level || 'A1'
      const teacherLanguage =
        settings.teacherLanguage || getDefaultTeacherLanguage(frenchLevel)

      await TeacherChatService.sendMessage({
        content: messageContent,
        context: currentContext,
        userLevel: frenchLevel,
        teacherLanguage,
        userId: user.id,
      })

      // Reload messages to get proper IDs from database
      const updatedHistory = await TeacherChatService.getHistory(user.id, 50, 0)
      setMessages(updatedHistory)

      // Scroll to bottom after response
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось отправить сообщение'
      )
      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter((m) => m.id !== tempUserMessage.id)
      )
      // Restore input
      setInput(messageContent)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRetry = () => {
    setError(null)
    if (input.trim()) {
      handleSend()
    } else {
      loadHistory()
    }
  }

  // Don't render if not open
  if (!isOpen || isMinimized) {
    return null
  }

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-24 right-6 z-50 w-[350px] h-[450px] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
            />
          </svg>
          <h3 className="font-semibold">Учитель</h3>
        </div>
        <button
          onClick={closeChat}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-500 transition-colors"
          aria-label="Закрыть чат"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Context badge */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <ContextBadge context={currentContext} />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <svg
                className="animate-spin w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Загрузка...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-primary-600 dark:text-primary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
              Задайте вопрос учителю
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Спросите о грамматике, лексике или попросите объяснить что-либо
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <TeacherMessage key={message.id} message={message} />
            ))}
          </>
        )}

        {/* Loading indicator when sending */}
        {isSending && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl rounded-bl-sm bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>Учитель печатает...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message with retry */}
      {error && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-red-600 dark:text-red-400 truncate">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="flex-shrink-0 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              Повторить
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите вопрос..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isSending}
            autoComplete="off"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label="Отправить"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
