// User types
export type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type AIProvider = 'openai' | 'claude' | 'random'

export interface User {
  id: string
  name: string
  email?: string
  nativeLanguage: string
  frenchLevel: FrenchLevel
  preferredAiProvider: AIProvider
  createdAt: Date
  updatedAt: Date
}

export interface UserProgress {
  userId: string
  totalConversations: number
  totalMessagesSent: number
  topicsCovered: string[]
  grammarCardsMastered: number
  currentStreak: number
  lastActivityDate: Date
}

// Topic types
export interface Topic {
  id: string
  userId?: string
  title: string
  category: TopicCategory
  level: FrenchLevel
  isSystem: boolean
  createdAt: Date
}

export type TopicCategory =
  | 'food'
  | 'travel'
  | 'work'
  | 'hobbies'
  | 'culture'
  | 'daily_life'
  | 'news'

// Conversation types
export type ConversationMode = 'text' | 'voice' | 'mixed'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
}

export interface Conversation {
  id: string
  userId: string
  topicId: string
  aiProvider: AIProvider
  mode: ConversationMode
  startedAt: Date
  endedAt?: Date
  messages: Message[]
  qualityScore?: number
}

// Grammar types
export interface GrammarCard {
  id: string
  userId: string
  topic: string
  level: FrenchLevel
  explanation: string
  examples: GrammarExample[]
  nextReview: Date
  easeFactor: number
  interval: number
  repetitions: number
  createdAt: Date
  lastReviewed?: Date
  practiceStats: PracticeStats
}

export interface GrammarExample {
  french: string
  russian: string
  highlight?: string
}

// Practice types
export type PracticeType =
  | 'written_translation'
  | 'repeat_aloud'
  | 'oral_translation'
  | 'grammar_dialog'

export interface PracticeStats {
  written_translation: {
    attempts: number
    correct: number
    lastAttempt?: Date
  }
  repeat_aloud: {
    attempts: number
    avgPronunciationScore: number
    lastAttempt?: Date
  }
  oral_translation: {
    attempts: number
    correct: number
    avgPronunciationScore: number
    lastAttempt?: Date
  }
  grammar_dialog: {
    sessions: number
    totalMessages: number
    grammarUsageRate: number
    lastSession?: Date
  }
}

export interface PracticeExercise {
  id: string
  type: PracticeType
  grammarTopic: string
  sourceText?: string
  targetText?: string
  audioUrl?: string
  hints?: string[]
}

export interface PracticeResult {
  isCorrect: boolean
  userAnswer: string
  pronunciationScore?: number
  feedback: string
  grammarNotes?: string
  correctAnswer?: string
}

export interface PracticeSession {
  id: string
  userId: string
  cardId: string
  practiceType: PracticeType
  startedAt: Date
  endedAt?: Date
  exercisesCompleted: number
  correctAnswers: number
  avgPronunciationScore?: number
  finalQuality: number
}

export interface PronunciationAnalysis {
  transcription: string
  expectedText: string
  overallScore: number
  wordScores: {
    word: string
    score: number
    issues?: string[]
  }[]
  suggestions: string[]
}

// SRS types
export type SRSQuality = 0 | 1 | 2 | 3 | 4 | 5

// Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  voiceSpeed: number
  selectedVoice?: string
  notificationsEnabled: boolean
  notificationTime?: string
  openaiApiKey?: string
}

// Default values
export const DEFAULT_PRACTICE_STATS: PracticeStats = {
  written_translation: { attempts: 0, correct: 0 },
  repeat_aloud: { attempts: 0, avgPronunciationScore: 0 },
  oral_translation: { attempts: 0, correct: 0, avgPronunciationScore: 0 },
  grammar_dialog: { sessions: 0, totalMessages: 0, grammarUsageRate: 0 },
}
