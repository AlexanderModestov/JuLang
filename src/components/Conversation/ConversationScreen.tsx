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
import { Keyboard, Mic, MicOff } from 'lucide-react'

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
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="font-semibold text-white">{topic}</h2>
          <p className="text-sm text-primary-400/60">
            {messages.length} сообщений
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'text' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('text')}
          >
            <Keyboard className="w-4 h-4" />
          </Button>
          <Button
            variant={mode === 'voice' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('voice')}
          >
            <Mic className="w-4 h-4" />
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
              className={`max-w-[80%] p-3 rounded-xl ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white shadow-glow-cyan'
                  : 'bg-white/[0.04]'
              }`}
            >
              <p className={message.role === 'user' ? 'text-white' : 'text-primary-100'}>
                {message.role === 'assistant'
                  ? message.content.split(/(\s+)/).map((part, i) => {
                      const trimmed = part.replace(/[.,!?;:'"()«»\-—]/g, '')
                      if (!trimmed || /^\s+$/.test(part)) return part
                      return (
                        <span
                          key={i}
                          className="cursor-pointer text-primary-500 underline decoration-primary-500/30 rounded px-0.5 transition-colors"
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
                  className="mt-2 text-xs text-primary-400/60 hover:text-primary-300"
                >
                  Прослушать
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl bg-white/[0.04]">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
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
                  fr: 'Ecrivez en francais...',
                  en: 'Write in English...',
                  es: 'Escribe en espanol...',
                  de: 'Schreiben Sie auf Deutsch...',
                  pt: 'Escreva em portugues...',
                }[currentLanguage] || 'Write here...'}
                className="flex-1 px-4 py-2 border border-white/[0.08] rounded-lg bg-white/[0.04] text-primary-50 placeholder-primary-400/40 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                disabled={isLoading}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
              />
              <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}>
                Отправить
              </Button>
            </>
          ) : (
            <Button
              onClick={handleVoiceInput}
              className={`flex-1 ${isListening ? 'bg-red-600 hover:bg-red-700' : ''}`}
              size="lg"
            >
              {isListening ? (
                <span className="inline-flex items-center gap-2">
                  <MicOff className="w-4 h-4" /> Запись...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Mic className="w-5 h-5" /> Нажмите и говорите
                </span>
              )}
            </Button>
          )}
        </div>
        {input && mode === 'voice' && (
          <p className="mt-2 text-sm text-primary-400/60">
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
