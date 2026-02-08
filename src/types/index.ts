// Language types
export type Language = 'fr' | 'en' | 'es' | 'de' | 'pt'

export const languageLabels: Record<Language, string> = {
  fr: 'Французский',
  en: 'Английский',
  es: 'Испанский',
  de: 'Немецкий',
  pt: 'Португальский',
}

export const languageFlags: Record<Language, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
  pt: '🇧🇷',
}

export const languageTTSCodes: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  pt: 'pt-BR',
}

// Article types per language
export type FrenchArticle = 'le' | 'la' | "l'" | null
export type GermanArticle = 'der' | 'die' | 'das' | null
export type SpanishArticle = 'el' | 'la' | null
export type PortugueseArticle = 'o' | 'a' | null
export type Article = FrenchArticle | GermanArticle | SpanishArticle | PortugueseArticle

// User types
export type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type LanguageLevel = FrenchLevel // Alias for multilingual support
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
  activeLanguage: Language      // Currently selected learning language
  languages: Language[]         // All languages user is learning
  createdAt: Date
  updatedAt: Date
}

// Level per language
export interface UserLanguageLevel {
  language: Language
  level: LanguageLevel
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
  language: Language    // Language of this conversation
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
  language: Language           // Language this card belongs to
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

// Grammar group for categorization
export type GrammarGroup =
  | 'articles'      // Артикли
  | 'tenses'        // Времена
  | 'pronouns'      // Местоимения
  | 'prepositions'  // Предлоги
  | 'adjectives'    // Прилагательные
  | 'negation'      // Отрицание
  | 'questions'     // Вопросы

// Static grammar topic from grammar-topics.json
export interface GrammarTopic {
  id: string
  title: string
  titleRu: string
  level: FrenchLevel
  category: string
  group: GrammarGroup
  content: GrammarTopicContent
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
export type VocabularyTopic =
  | 'daily' | 'food' | 'travel' | 'work'
  | 'home' | 'nature' | 'emotions' | 'communication'
  | 'health' | 'education' | 'shopping' | 'culture'

export const vocabularyTopicLabels: Record<VocabularyTopic, string> = {
  daily: 'Повседневное',
  food: 'Еда',
  travel: 'Путешествия',
  work: 'Работа',
  home: 'Дом',
  nature: 'Природа',
  emotions: 'Эмоции',
  communication: 'Общение',
  health: 'Здоровье',
  education: 'Образование',
  shopping: 'Покупки',
  culture: 'Культура',
}

export interface VocabularyExample {
  fr: string
  ru: string
}

export interface VocabularyCard {
  id: string
  french: string
  russian: string
  examples: VocabularyExample[]  // up to 3 examples per word
  level: FrenchLevel
  type: 'word' | 'expression'
  article?: 'le' | 'la' | "l'" | null  // noun article (null for verbs, adjectives, expressions)
  topic: VocabularyTopic
  difficulty: 1 | 2 | 3
  frequency: 1 | 2 | 3 | 4 | 5
  imageUrl: string
}

export interface VocabularyProgress {
  id: string          // same as VocabularyCard.id
  userId: string
  cardId: string
  language: Language  // Language this progress belongs to
  nextReview: Date
  easeFactor: number
  interval: number
  repetitions: number
  createdAt: Date
  lastReviewed?: Date
}

export type VocabularyExerciseType =
  | 'fr_to_ru'        // French word → select Russian translation
  | 'ru_to_fr'        // Russian word → select French translation
  | 'multiple_choice' // French word → select correct translation from 4 options
  | 'listening'       // TTS pronounces word → select what was said
  | 'fill_blank'      // Sentence with blank → select missing word
  | 'write_word'      // Russian shown → type French word

// SRS types
export type SRSQuality = 0 | 1 | 2 | 3 | 4 | 5

// Teacher chat types
export type TeacherLanguage = 'ru' | 'fr' | 'adaptive'

export interface TeacherMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  context: {
    screen: string
    itemId?: string
    itemPreview?: string
  }
}

/**
 * Returns default teacher language based on French level.
 * A1-A2: Russian (easier to understand)
 * B1+: Adaptive (mix of French and Russian based on context)
 */
export function getDefaultTeacherLanguage(level: FrenchLevel): TeacherLanguage {
  switch (level) {
    case 'A1':
    case 'A2':
      return 'ru'
    default:
      return 'adaptive'
  }
}

// Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  voiceSpeed: number
  selectedVoice?: string
  notificationsEnabled: boolean
  notificationTime?: string
  teacherLanguage?: TeacherLanguage
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
