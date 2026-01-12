import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { startConversation, continueConversation } from '@/modules/AIService'
import {
  startListening,
  stopListening,
  speak,
  isSpeechRecognitionSupported,
} from '@/modules/SpeechService'
import { saveConversation } from '@/db'
import type { Message, Conversation } from '@/types'
import Button from '@/components/ui/Button'

export default function ConversationScreen() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, updateProgress, progress } = useAppStore()

  const topic = searchParams.get('topic') || 'conversation libre'
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [mode, setMode] = useState<'text' | 'voice'>('text')
  const [conversationId] = useState(() => crypto.randomUUID())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initConversation()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initConversation = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const greeting = await startConversation(topic, user.frenchLevel)
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }
      setMessages([aiMessage])

      // Speak the greeting
      if (mode === 'voice') {
        speak(greeting)
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user || isLoading) return

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
      const response = await continueConversation(allMessages, user.frenchLevel, topic)

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
          totalMessagesSent: progress.totalMessagesSent + 1,
        })
      }

      // Speak the response
      if (mode === 'voice') {
        speak(response)
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
      'fr-FR'
    )
  }

  const handleEndConversation = async () => {
    if (!user || messages.length === 0) {
      navigate('/')
      return
    }

    // Save conversation
    const conversation: Conversation = {
      id: conversationId,
      userId: user.id,
      topicId: topic,
      aiProvider: 'openai',
      mode: mode,
      startedAt: messages[0].timestamp,
      endedAt: new Date(),
      messages,
    }

    await saveConversation(conversation)

    // Update progress
    if (progress) {
      updateProgress({
        totalConversations: progress.totalConversations + 1,
        topicsCovered: [...new Set([...progress.topicsCovered, topic])],
      })
    }

    navigate('/')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">{topic}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {messages.length} сообщений
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'text' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('text')}
          >
            ⌨️
          </Button>
          <Button
            variant={mode === 'voice' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('voice')}
          >
            🎤
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
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <p className={message.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'}>
                {message.content}
              </p>
              {message.role === 'assistant' && (
                <button
                  onClick={() => speak(message.content)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Прослушать
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
              <div className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          {mode === 'text' ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Écrivez en français..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
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
              {isListening ? '🔴 Запись...' : '🎤 Нажмите и говорите'}
            </Button>
          )}
        </div>
        {input && mode === 'voice' && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Распознано: {input}
          </p>
        )}
      </div>
    </div>
  )
}
