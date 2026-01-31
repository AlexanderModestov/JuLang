// User types
export type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type AIProvider = 'openai' | 'claude' | 'random'

// Speech synthesis settings
export interface SpeechSettings {
  voiceName: string | null  // null = auto-select best voice
  rate: number              // 0.5 - 1.5, speech rate
  pitch: number             // 0.5 - 1.5, voice pitch
}

export const DEFAULT_SPEECH_SETTINGS: SpeechSettings = {
  voiceName: null,  // auto-select
  rate: 0.9,        // slightly slower than normal
  pitch: 1.0,       // normal pitch
}

export interface User {
  id: string
  name: string
  email?: string
  nativeLanguage: string
  frenchLevel: FrenchLevel
  preferredAiProvider: AIProvider
  speechPauseTimeout: number  // seconds (1-15), silence duration before auto-stop
  speechSettings: SpeechSettings  // TTS voice settings
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
  durationMs?: number
  messages: Message[]
  qualityScore?: number
}

// Grammar types
export interface GrammarCard {
  id: string
  userId: string
  topicId: string              // reference to topic in grammar-topics.json
  topic: string
  level: FrenchLevel
  explanation: string
  examples: GrammarExample[]
  commonMistakes: string[]     // common errors for this topic
  isEnhanced: boolean          // whether AI enhancement was applied
  enhancedExplanation?: string // AI-generated detailed explanation
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

// Static content for a grammar topic
export interface GrammarTopicContent {
  rule: string
  examples: { fr: string; ru: string }[]
  commonMistakes: string[]
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

// Vocabulary types
export interface VocabularyCard {
  id: string
  french: string
  russian: string
  example: string
  exampleTranslation: string
  level: FrenchLevel
  type: 'word' | 'expression'
  gender?: 'masculine' | 'feminine'
}

export interface VocabularyProgress {
  id: string          // same as VocabularyCard.id
  userId: string
  cardId: string
  nextReview: Date
  easeFactor: number
  interval: number
  repetitions: number
  createdAt: Date
  lastReviewed?: Date
}

export type VocabularyExerciseType = 'fr_to_ru' | 'ru_to_fr' | 'multiple_choice'

// SRS types
export type SRSQuality = 0 | 1 | 2 | 3 | 4 | 5

// Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  voiceSpeed: number
  selectedVoice?: string
  notificationsEnabled: boolean
  notificationTime?: string
}

// Default values
export const DEFAULT_PRACTICE_STATS: PracticeStats = {
  written_translation: { attempts: 0, correct: 0 },
  repeat_aloud: { attempts: 0, avgPronunciationScore: 0 },
  oral_translation: { attempts: 0, correct: 0, avgPronunciationScore: 0 },
  grammar_dialog: { sessions: 0, totalMessages: 0, grammarUsageRate: 0 },
}

/**
 * Returns default speech pause timeout based on French level.
 * Beginners get more time to think (5s), advanced less (2s).
 */
export function getDefaultPauseTimeout(level: FrenchLevel): number {
  switch (level) {
    case 'A1':
    case 'A2':
      return 5
    case 'B1':
    case 'B2':
      return 3
    case 'C1':
    case 'C2':
      return 2
  }
}
