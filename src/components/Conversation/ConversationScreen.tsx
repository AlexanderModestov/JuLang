import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTeacherContext } from '@/store/teacherChatStore'
import { startConversation, continueConversation } from '@/modules/AIService'
import {
  startListening,
  stopListening,
  isSpeechRecognitionSupported,
} from '@/modules/SpeechService'
import { useSpeech } from '@/hooks/useSpeech'
import { saveConversation } from '@/db'
import { userDataService } from '@/services/userDataService'
import type { Message, Conversation } from '@/types'
import { languageTTSCodes } from '@/types'
import Button from '@/components/ui/Button'
import WordPopup from './WordPopup'

export default function ConversationScreen() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile, progress, updateProgress, currentLanguage, currentLevel, incrementLanguageStats } = useAuthContext()
  const { speak } = useSpeech()

  const topic = searchParams.get('topic') || 'conversation libre'
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [mode, setMode] = useState<'text' | 'voice'>('text')
  const [conversationId] = useState(() => crypto.randomUUID())
  const [popupWord, setPopupWord] = useState<{ word: string; sentence: string } | null>(null)

  // Set teacher chat context for conversation screen
  useTeacherContext({
    screen: 'conversation',
    itemId: conversationId,
    itemPreview: topic,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [conversationStartedAt] = useState(() => new Date())

  useEffect(() => {
    initConversation()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initConversation = async () => {
    if (!profile) return

    setIsLoading(true)
    try {
      const greeting = await startConversation(topic, currentLevel, currentLanguage)
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }
      setMessages([aiMessage])

      // Speak the greeting
      if (mode === 'voice') {
        speak(greeting, { language: currentLanguage })
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || !profile || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const allMessages = [...messages, userMessage]
      const response = await continueConversation(allMessages, currentLevel, topic, currentLanguage)

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Update progress
      if (progress) {
        updateProgress({
          total_messages_sent: progress.total_messages_sent + 1,
        })
      }

      // Speak the response
      if (mode === 'voice') {
        speak(response, { language: currentLanguage })
      }
    } catch (error) {
      console.error('Failed to get response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
      return
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Распознавание речи не поддерживается в вашем браузере')
      return
    }

    setIsListening(true)
    const ttsCode = languageTTSCodes[currentLanguage] || 'en-US'
    startListening(
      (result) => {
        setInput(result.transcript)
        if (result.isFinal) {
          setIsListening(false)
          sendMessage(result.transcript)
        }
      },
      (error) => {
        console.error('Speech recognition error:', error)
        setIsListening(false)
      },
      ttsCode
    )
  }

  const handleEndConversation = async () => {
    if (!user || messages.length === 0) {
      navigate('/')
      return
    }

    // Save conversation with duration tracking
    const endedAt = new Date()
    const durationMs = endedAt.getTime() - conversationStartedAt.getTime()

    const conversation: Conversation = {
      id: conversationId,
      userId: user.id,
      language: currentLanguage,
      topicId: topic,
      aiProvider: 'openai',
      mode: mode,
      startedAt: conversationStartedAt,
      endedAt,
      durationMs,
      messages,
    }

    await saveConversation(conversation)

    // Save conversation to Supabase so dashboard stats work
    try {
      await userDataService.createConversation({
        id: conversationId,
        user_id: user.id,
        language: currentLanguage,
        topic_id: topic,
        ai_provider: 'openai',
        mode,
        started_at: conversationStartedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_ms: durationMs,
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
        })),
      })
      incrementLanguageStats({ conversationsCount: 1 })
    } catch (err) {
      console.error('Failed to save conversation to Supabase:', err)
    }

    // Update progress and streak
    if (progress) {
      const today = new Date().toISOString().split('T')[0]
      const lastActivity = progress.last_activity_date
        ? progress.last_activity_date.split('T')[0]
        : null

      let newStreak = progress.current_streak
      if (lastActivity !== today) {
        // Check if last activity was yesterday (continue streak) or earlier (reset)
        if (lastActivity) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          newStreak = lastActivity === yesterdayStr ? newStreak + 1 : 1
        } else {
          newStreak = 1
        }
      }

      updateProgress({
        total_conversations: progress.total_conversations + 1,
        topics_covered: [...new Set([...progress.topics_covered, topic])],
        current_streak: newStreak,
        last_activity_date: today,
      })
    }

    navigate('/')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="font-semibold text-white/90 tracking-wide">{topic}</h2>
          <p className="text-sm text-white/30">
            {messages.length} сообщений
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'text' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('text')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12" />
            </svg>
          </Button>
          <Button
            variant={mode === 'voice' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('voice')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0014 0M12 18v4M8 22h8" />
            </svg>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleEndConversation}>
            Завершить
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3.5 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-surface-900'
                  : 'bg-white/[0.06] border border-white/[0.08]'
              }`}
            >
              <p className={message.role === 'user' ? 'text-surface-900 font-medium' : 'text-white/90'}>
                {message.role === 'assistant'
                  ? message.content.split(/(\s+)/).map((part, i) => {
                      const trimmed = part.replace(/[.,!?;:'"()«»\-—]/g, '')
                      if (!trimmed || /^\s+$/.test(part)) return part
                      return (
                        <span
                          key={i}
                          className="cursor-pointer hover:bg-primary-500/15 hover:text-primary-300 rounded px-0.5 transition-colors"
                          onClick={() => setPopupWord({ word: trimmed, sentence: message.content })}
                        >
                          {part}
                        </span>
                      )
                    })
                  : message.content}
              </p>
              {message.role === 'assistant' && (
                <button
                  onClick={() => speak(message.content, { language: currentLanguage })}
                  className="mt-2 text-xs text-white/30 hover:text-primary-400 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Прослушать
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.08]">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-primary-400/60 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-primary-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-white/[0.06]">
        <div className="flex gap-2">
          {mode === 'text' ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder={{
                  fr: 'Ecrivez en fran\u00e7ais...',
                  en: 'Write in English...',
                  es: 'Escribe en espa\u00f1ol...',
                  de: 'Schreiben Sie auf Deutsch...',
                  pt: 'Escreva em portugu\u00eas...',
                }[currentLanguage] || 'Write here...'}
                className="flex-1 px-4 py-2.5 border border-white/[0.10] rounded-xl bg-white/[0.05] backdrop-blur-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 hover:bg-white/[0.07] hover:border-white/[0.15] transition-all placeholder-white/25"
                disabled={isLoading}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
              />
              <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </Button>
            </>
          ) : (
            <Button
              onClick={handleVoiceInput}
              className={`flex-1 ${isListening ? 'bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-400 hover:to-danger-500 shadow-[0_0_20px_rgba(255,51,102,0.3)]' : ''}`}
              size="lg"
            >
              {isListening ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  Запись...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0014 0M12 18v4M8 22h8" />
                  </svg>
                  Нажмите и говорите
                </span>
              )}
            </Button>
          )}
        </div>
        {input && mode === 'voice' && (
          <p className="mt-2 text-sm text-white/30">
            Распознано: {input}
          </p>
        )}
      </div>

      {/* Word translation popup */}
      {popupWord && (
        <WordPopup
          word={popupWord.word}
          sentence={popupWord.sentence}
          onClose={() => setPopupWord(null)}
        />
      )}
    </div>
  )
}
