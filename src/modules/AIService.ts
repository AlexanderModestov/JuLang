import type { FrenchLevel, Message, PracticeType } from '@/types'

// API base URL - empty for same-origin requests on Vercel
const API_BASE = ''

// Conversation functions
export async function startConversation(
  topic: string,
  level: FrenchLevel
): Promise<string> {
  const response = await fetch(`${API_BASE}/api/conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'start', topic, level }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to start conversation')
  }

  const data = await response.json()
  return data.content
}

export async function continueConversation(
  messages: Message[],
  level: FrenchLevel,
  topic: string
): Promise<string> {
  const response = await fetch(`${API_BASE}/api/conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'continue',
      topic,
      level,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to continue conversation')
  }

  const data = await response.json()
  return data.content
}

// Grammar practice functions
export async function generateExercise(
  grammarTopic: string,
  level: FrenchLevel,
  practiceType: PracticeType
): Promise<{
  sourceText?: string
  targetText: string
  hint?: string
  translation?: string
}> {
  const response = await fetch(`${API_BASE}/api/exercise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'generate',
      grammarTopic,
      level,
      practiceType,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to generate exercise')
  }

  return response.json()
}

export async function checkTranslation(
  userAnswer: string,
  correctAnswer: string,
  grammarTopic: string,
  level: FrenchLevel
): Promise<{
  isCorrect: boolean
  feedback: string
  grammarNotes?: string
}> {
  const response = await fetch(`${API_BASE}/api/exercise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'check',
      grammarTopic,
      level,
      userAnswer,
      correctAnswer,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to check translation')
  }

  return response.json()
}

export async function analyzeGrammarUsage(
  userMessage: string,
  grammarTopic: string
): Promise<{
  usedCorrectly: boolean
  feedback: string
}> {
  const response = await fetch(`${API_BASE}/api/exercise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'analyze',
      grammarTopic,
      userAnswer: userMessage,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to analyze grammar')
  }

  return response.json()
}

// Grammar explanation generation
export async function generateGrammarExplanation(
  topic: string,
  level: FrenchLevel
): Promise<{
  explanation: string
  examples: { french: string; russian: string }[]
}> {
  const response = await fetch(`${API_BASE}/api/grammar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, level }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to generate grammar explanation')
  }

  return response.json()
}

// Enhance a grammar card explanation with AI
export async function enhanceCardExplanation(
  topic: string,
  level: FrenchLevel,
  currentExplanation: string,
  commonMistakes: string[]
): Promise<string> {
  const response = await fetch(`${API_BASE}/api/grammar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'enhance',
      topic,
      level,
      currentExplanation,
      commonMistakes,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to enhance grammar explanation')
  }

  const data = await response.json()
  return data.enhancedExplanation
}

export interface WordTranslation {
  lemma: string
  russian: string
  article: 'le' | 'la' | "l'" | null
  type: 'word' | 'expression'
}

export async function translateWord(
  word: string,
  sentence: string
): Promise<WordTranslation> {
  const response = await fetch(`${API_BASE}/api/translate-word`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, sentence }),
  })

  if (!response.ok) {
    throw new Error('Failed to translate word')
  }

  return response.json()
}
