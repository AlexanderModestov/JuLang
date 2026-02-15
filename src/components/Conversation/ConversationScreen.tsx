import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTeacherContext } from '@/store/teacherChatStore'
import { startConversation, continueConversation } from '@/modules/AIService'
import {
  startListening,
  stopListening,
  speak,
  isSpeechRecognitionSupported,
} from '@/modules/SpeechService'
import { saveConversation } from '@/db'
import type { Message, Conversation } from '@/types'
import { languageTTSCodes } from '@/types'
import Button from '@/components/ui/Button'
import WordPopup from './WordPopup'

export default function ConversationScreen() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile, progress, updateProgress, currentLanguage } = useAuthContext()

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
      const greeting = await startConversation(topic, profile.french_level || 'A1', currentLanguage)
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
      const response = await continueConversation(allMessages, profile.french_level || 'A1', topic, currentLanguage)

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

    // Update progress
    if (progress) {
      updateProgress({
        total_conversations: progress.total_conversations + 1,
        topics_covered: [...new Set([...progress.topics_covered, topic])],
      })
    }

    navigate('/')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 dark:border-stone-800/60">
        <div>
          <h2 className="font-display text-display-sm text-stone-900 dark:text-stone-50">{topic}</h2>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
            {messages.length} сообщений
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'text' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('text')}
          >
            &#9000;
          </Button>
          <Button
            variant={mode === 'voice' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('voice')}
          >
            &#127908;
          </Button>
          <Button variant="secondary" size="sm" onClick={handleEndConversation}>
            Завершить
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-800 border border-stone-200/40 dark:border-stone-700/40'
              }`}
            >
              <p className={`leading-relaxed ${
                message.role === 'user'
                  ? 'text-white dark:text-stone-900'
                  : 'text-stone-900 dark:text-stone-50'
              }`}>
                {message.role === 'assistant'
                  ? message.content.split(/(\s+)/).map((part, i) => {
                      const trimmed = part.replace(/[.,!?;:'"()«»\-—]/g, '')
                      if (!trimmed || /^\s+$/.test(part)) return part
                      return (
                        <span
                          key={i}
                          className="cursor-pointer hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded px-0.5 transition-smooth"
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
                  className="mt-2.5 text-xs text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-smooth"
                >
                  Прослушать
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200/40 dark:border-stone-700/40">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500 animate-pulse-soft" />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500 animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500 animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800/60">
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
                  fr: 'Écrivez en français...',
                  en: 'Write in English...',
                  es: 'Escribe en español...',
                  de: 'Schreiben Sie auf Deutsch...',
                  pt: 'Escreva em português...',
                }[currentLanguage] || 'Write here...'}
                className="flex-1 px-4 py-2.5 text-sm border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-smooth hover:border-stone-300 dark:hover:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
              {isListening ? '\uD83D\uDD34 Запись...' : '\uD83C\uDFA4 Нажмите и говорите'}
            </Button>
          )}
        </div>
        {input && mode === 'voice' && (
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
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
