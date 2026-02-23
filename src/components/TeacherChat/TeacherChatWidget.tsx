import { useState, useEffect, useRef, useCallback } from 'react'
import { GraduationCap, X, Loader2, HelpCircle, Send } from 'lucide-react'
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
  const { user, profile, currentLevel } = useAuthContext()

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
      const teacherLanguage =
        settings.teacherLanguage || getDefaultTeacherLanguage(currentLevel)

      await TeacherChatService.sendMessage({
        content: messageContent,
        context: currentContext,
        userLevel: currentLevel,
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
      className="fixed bottom-24 right-6 z-50 w-[350px] h-[450px] flex flex-col bg-primary-800/95 backdrop-blur-xl rounded-xl shadow-glass-lg border border-white/[0.08] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-800 border-b border-white/[0.06] text-white">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          <h3 className="font-semibold">Учитель</h3>
        </div>
        <button
          onClick={closeChat}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-600 transition-colors"
          aria-label="Закрыть чат"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context badge */}
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <ContextBadge context={currentContext} />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-primary-400/60">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Загрузка...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-primary-400" />
            </div>
            <p className="text-primary-300 font-medium mb-1">
              Задайте вопрос учителю
            </p>
            <p className="text-sm text-primary-400/60">
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
            <div className="px-3 py-2 rounded-xl rounded-bl-sm bg-white/5 text-sm text-primary-300">
              <div className="flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
        <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-red-400 truncate">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="flex-shrink-0 text-sm text-red-400 hover:text-red-300 font-medium"
            >
              Повторить
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите вопрос..."
            className="flex-1 px-3 py-2 text-sm border border-white/[0.08] rounded-lg bg-white/[0.04] text-primary-50 placeholder-primary-400/40 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-transparent"
            disabled={isSending}
            autoComplete="off"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="px-3 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 focus:ring-offset-primary-900"
            aria-label="Отправить"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
