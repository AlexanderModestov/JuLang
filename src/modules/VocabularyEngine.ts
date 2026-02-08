import type { VocabularyCard, VocabularyProgress, FrenchLevel, SRSQuality, VocabularyExerciseType, Language } from '@/types'
import type { Database } from '@/types/supabase'
import { userDataService } from '@/services/userDataService'
import { supabase } from '@/lib/supabase'
import vocabularyData from '@/data/vocabulary.json'

type SupabaseVocabularyProgress = Database['public']['Tables']['vocabulary_progress']['Row']
type SupabaseVocabularyProgressInsert = Database['public']['Tables']['vocabulary_progress']['Insert']

// Convert Supabase vocabulary progress to local VocabularyProgress type
function toLocalVocabularyProgress(progress: SupabaseVocabularyProgress): VocabularyProgress {
  return {
    id: progress.id,
    userId: progress.user_id,
    cardId: progress.card_id,
    language: (progress as any).language || 'fr', // Default to French until DB migrated
    nextReview: new Date(progress.next_review),
    easeFactor: progress.ease_factor,
    interval: progress.interval,
    repetitions: progress.repetitions,
    createdAt: new Date(progress.created_at),
    lastReviewed: progress.last_reviewed ? new Date(progress.last_reviewed) : undefined,
  }
}

// Convert local VocabularyProgress to Supabase insert format
function toSupabaseVocabularyProgressInsert(progress: VocabularyProgress): SupabaseVocabularyProgressInsert {
  return {
    id: progress.id,
    user_id: progress.userId,
    card_id: progress.cardId,
    next_review: progress.nextReview.toISOString(),
    ease_factor: progress.easeFactor,
    interval: progress.interval,
    repetitions: progress.repetitions,
    last_reviewed: progress.lastReviewed?.toISOString() || null,
  }
}

const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3
const NEW_CARDS_PER_SESSION = 5

export function getAllVocabularyCards(): VocabularyCard[] {
  return vocabularyData.cards as VocabularyCard[]
}

export function getCardsByLevel(level: FrenchLevel): VocabularyCard[] {
  return getAllVocabularyCards().filter((c) => c.level === level)
}

export function getCardsUpToLevel(level: FrenchLevel): VocabularyCard[] {
  const levelOrder: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const maxIndex = levelOrder.indexOf(level)
  const levels = levelOrder.slice(0, maxIndex + 1)
  return getAllVocabularyCards().filter((c) => levels.includes(c.level as FrenchLevel))
}

export function getVocabularyCardById(cardId: string): VocabularyCard | undefined {
  return getAllVocabularyCards().find((c) => c.id === cardId)
}

/** Get cards not yet in user's progress (new cards to learn) */
export async function getNewCards(
  userId: string,
  level: FrenchLevel,
  language: Language = 'fr'
): Promise<VocabularyCard[]> {
  // For now, vocabulary data is French only - when we add other languages,
  // we'll need to load language-specific vocabulary files
  if (language !== 'fr') {
    return [] // No vocabulary data for other languages yet
  }
  const supabaseProgress = await userDataService.getVocabularyProgress(userId)
  const knownIds = new Set(supabaseProgress.map((p) => p.card_id))
  const available = getCardsUpToLevel(level)
  return available.filter((c) => !knownIds.has(c.id)).slice(0, NEW_CARDS_PER_SESSION)
}

/** Get cards due for review */
export async function getReviewQueue(userId: string, language: Language = 'fr'): Promise<VocabularyProgress[]> {
  const supabaseProgress = await userDataService.getVocabularyDue(userId)
  // Filter by language (until userDataService supports language filtering)
  return supabaseProgress
    .map(toLocalVocabularyProgress)
    .filter((p) => p.language === language)
}

/** Add a card to user's SRS progress */
export async function addCardToProgress(
  userId: string,
  cardId: string,
  language: Language = 'fr'
): Promise<VocabularyProgress> {
  const existing = await userDataService.getVocabularyProgressByCardId(userId, cardId)
  if (existing) return toLocalVocabularyProgress(existing)

  const entry: VocabularyProgress = {
    id: crypto.randomUUID(),
    userId,
    cardId,
    language,
    nextReview: new Date(),
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    createdAt: new Date(),
  }
  const supabaseInsert = toSupabaseVocabularyProgressInsert(entry)
  const savedProgress = await userDataService.createVocabularyProgress(supabaseInsert)
  return toLocalVocabularyProgress(savedProgress)
}

/** Schedule card after review using SM-2 */
export async function scheduleVocabularyCard(
  progressId: string,
  quality: SRSQuality
): Promise<VocabularyProgress | null> {
  // Get the current progress entry by ID
  const { data: entry, error } = await supabase
    .from('vocabulary_progress')
    .select('*')
    .eq('id', progressId)
    .single()

  if (error || !entry) return null

  let interval = entry.interval
  let easeFactor = entry.ease_factor
  let repetitions = entry.repetitions

  if (quality < 3) {
    interval = 0
    repetitions = 0
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  }

  const qFactor = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + qFactor)

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  const updatedProgress = await userDataService.updateVocabularyProgress(progressId, {
    interval,
    ease_factor: easeFactor,
    repetitions,
    next_review: nextReview.toISOString(),
    last_reviewed: new Date().toISOString(),
  })
  return toLocalVocabularyProgress(updatedProgress)
}

/** Generate multiple choice options: correct + 3 distractors from same level */
export function getMultipleChoiceOptions(
  card: VocabularyCard,
  field: 'french' | 'russian'
): string[] {
  const sameLevel = getCardsByLevel(card.level as FrenchLevel)
    .filter((c) => c.id !== card.id)

  // Shuffle and pick 3
  const shuffled = sameLevel.sort(() => Math.random() - 0.5)
  const distractors = shuffled.slice(0, 3).map((c) => c[field])

  // Add correct answer and shuffle
  const options = [card[field], ...distractors]
  return options.sort(() => Math.random() - 0.5)
}

/** Check if a card already exists in user's vocabulary progress */
export async function isCardInProgress(
  userId: string,
  cardId: string
): Promise<boolean> {
  const entry = await userDataService.getVocabularyProgressByCardId(userId, cardId)
  return !!entry
}

/** Check if a lemma already exists in vocabulary by French word */
export async function isLemmaInProgress(
  userId: string,
  lemma: string
): Promise<boolean> {
  const allCards = getAllVocabularyCards()
  const match = allCards.find(
    (c) => c.french.toLowerCase() === lemma.toLowerCase()
  )
  if (match) {
    return isCardInProgress(userId, match.id)
  }
  // Check custom cards by iterating progress
  const supabaseProgress = await userDataService.getVocabularyProgress(userId)
  return supabaseProgress.some((p) => p.card_id.startsWith('v-custom-') && p.card_id.includes(lemma.toLowerCase()))
}

/** Add a vocabulary card from a conversation word tap */
export async function addCardFromConversation(
  userId: string,
  lemma: string,
  russian: string,
  article: 'le' | 'la' | "l'" | null,
  type: 'word' | 'expression',
  example: string,
  exampleTranslation: string,
  language: Language = 'fr'
): Promise<VocabularyProgress> {
  // Check if static card exists
  const allCards = getAllVocabularyCards()
  const existing = allCards.find(
    (c) => c.french.toLowerCase() === lemma.toLowerCase()
  )
  if (existing) {
    return addCardToProgress(userId, existing.id, language)
  }

  // For custom words, we store a custom card in the DB
  // The VocabularyCard data is embedded via a separate Dexie table or localStorage
  const cardId = `v-custom-${crypto.randomUUID()}`

  // Store custom card data in localStorage for lookup
  const customCards = JSON.parse(localStorage.getItem('customVocabularyCards') || '{}')
  customCards[cardId] = {
    id: cardId,
    french: lemma,
    russian,
    examples: [{ fr: example, ru: exampleTranslation }],
    level: 'A1' as const,
    type,
    ...(article ? { article } : {}),
    topic: 'daily' as const,
    difficulty: 2 as const,
    frequency: 3 as const,
    imageUrl: '/images/vocab/default.jpg',
  }
  localStorage.setItem('customVocabularyCards', JSON.stringify(customCards))

  return addCardToProgress(userId, cardId, language)
}

// ============================================
// Exercise Types
// ============================================

/** All available exercise types */
export const ALL_EXERCISE_TYPES: VocabularyExerciseType[] = [
  'fr_to_ru',
  'ru_to_fr',
  'multiple_choice',
  'listening',
  'fill_blank',
  'write_word',
]

/** Easy exercise types (for first round in mini-session) */
export const EASY_EXERCISE_TYPES: VocabularyExerciseType[] = [
  'fr_to_ru',
  'multiple_choice',
  'listening',
]

/** Hard exercise types (for second round in mini-session) */
export const HARD_EXERCISE_TYPES: VocabularyExerciseType[] = [
  'write_word',
  'fill_blank',
  'ru_to_fr',
]

/** Pick a random exercise type from all types */
export function pickRandomExerciseType(): VocabularyExerciseType {
  return ALL_EXERCISE_TYPES[Math.floor(Math.random() * ALL_EXERCISE_TYPES.length)]
}

/** Pick a random easy exercise type */
export function pickEasyExerciseType(): VocabularyExerciseType {
  return EASY_EXERCISE_TYPES[Math.floor(Math.random() * EASY_EXERCISE_TYPES.length)]
}

/** Pick a random hard exercise type */
export function pickHardExerciseType(): VocabularyExerciseType {
  return HARD_EXERCISE_TYPES[Math.floor(Math.random() * HARD_EXERCISE_TYPES.length)]
}

/** Get word with article for display/TTS */
export function getWordWithArticle(card: VocabularyCard): string {
  if (!card.article) return card.french
  if (card.article === "l'") return `l'${card.french}`
  return `${card.article} ${card.french}`
}

/**
 * Generate fill-in-the-blank exercise data
 * Returns sentence with blank and the correct word
 */
export function generateFillBlankExercise(card: VocabularyCard): {
  sentence: string
  blankWord: string
  options: string[]
} | null {
  // Need at least one example
  if (!card.examples || card.examples.length === 0) return null

  const example = card.examples[0]
  const frenchWord = card.french.toLowerCase()

  // Try to find the word in the example sentence
  const regex = new RegExp(`\\b${frenchWord}\\b`, 'i')
  if (!regex.test(example.fr)) {
    // Word not found in example, use a simple format
    return {
      sentence: `___ signifie "${card.russian}"`,
      blankWord: card.french,
      options: getMultipleChoiceOptions(card, 'french'),
    }
  }

  // Replace the word with blank
  const sentence = example.fr.replace(regex, '___')

  return {
    sentence,
    blankWord: card.french,
    options: getMultipleChoiceOptions(card, 'french'),
  }
}

/**
 * Generate listening exercise data
 * Returns the word to speak and options for user to choose
 */
export function generateListeningExercise(card: VocabularyCard): {
  wordToSpeak: string
  correctAnswer: string
  options: string[]
} {
  return {
    wordToSpeak: getWordWithArticle(card),
    correctAnswer: card.russian,
    options: getMultipleChoiceOptions(card, 'russian'),
  }
}

/**
 * Check if user's written answer is correct
 * Handles common variations and accents
 */
export function checkWrittenAnswer(
  userAnswer: string,
  card: VocabularyCard
): boolean {
  const normalize = (s: string) => s
    .toLowerCase()
    .trim()
    // Normalize common accent variations
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const normalizedAnswer = normalize(userAnswer)
  const normalizedCorrect = normalize(card.french)

  // Exact match (ignoring accents)
  if (normalizedAnswer === normalizedCorrect) return true

  // Check with article if present
  if (card.article) {
    const withArticle = normalize(getWordWithArticle(card))
    if (normalizedAnswer === withArticle) return true
  }

  return false
}

// ============================================
// Auto-SRS (without manual quality rating)
// ============================================

/**
 * Schedule card automatically based on correct/incorrect answer
 * Correct → quality 4 (good recall)
 * Incorrect → quality 0 (complete failure)
 */
export async function scheduleVocabularyCardAuto(
  progressId: string,
  correct: boolean
): Promise<VocabularyProgress | null> {
  const quality: SRSQuality = correct ? 4 : 0
  return scheduleVocabularyCard(progressId, quality)
}

/**
 * Add card to progress and schedule with auto quality
 */
export async function addAndScheduleCard(
  userId: string,
  cardId: string,
  correct: boolean,
  language: Language = 'fr'
): Promise<VocabularyProgress> {
  const progress = await addCardToProgress(userId, cardId, language)
  await scheduleVocabularyCardAuto(progress.id, correct)
  return progress
}

// ============================================
// Mini-Session (reinforcement after new words)
// ============================================

export interface MiniSessionExercise {
  card: VocabularyCard
  exerciseType: VocabularyExerciseType
  isEasy: boolean // true for first round, false for second
}

/**
 * Generate mini-session exercises for newly learned words
 * Creates 2 exercises per word (1 easy, 1 hard) in shuffled order
 *
 * @param cards - Array of cards just learned (typically 5)
 * @returns Array of 10 exercises (2 per card, shuffled)
 */
export function generateMiniSessionExercises(cards: VocabularyCard[]): MiniSessionExercise[] {
  const exercises: MiniSessionExercise[] = []

  // Generate 2 exercises per card
  for (const card of cards) {
    // First exercise: easy type
    exercises.push({
      card,
      exerciseType: pickEasyExerciseType(),
      isEasy: true,
    })

    // Second exercise: hard type
    exercises.push({
      card,
      exerciseType: pickHardExerciseType(),
      isEasy: false,
    })
  }

  // Shuffle exercises but ensure same card doesn't appear consecutively
  return shuffleWithConstraint(exercises)
}

/**
 * Shuffle exercises ensuring no two consecutive exercises are for the same card
 */
function shuffleWithConstraint(exercises: MiniSessionExercise[]): MiniSessionExercise[] {
  const result: MiniSessionExercise[] = []
  const remaining = [...exercises]

  while (remaining.length > 0) {
    // Find valid candidates (not the same card as the last one)
    const lastCard = result.length > 0 ? result[result.length - 1].card.id : null
    const validIndices = remaining
      .map((ex, i) => (ex.card.id !== lastCard ? i : -1))
      .filter((i) => i !== -1)

    if (validIndices.length === 0) {
      // No valid options, just add remaining (shouldn't happen with 5+ cards)
      result.push(...remaining)
      break
    }

    // Pick random valid index
    const pickIndex = validIndices[Math.floor(Math.random() * validIndices.length)]
    result.push(remaining[pickIndex])
    remaining.splice(pickIndex, 1)
  }

  return result
}

/**
 * Calculate mini-session results
 */
export interface MiniSessionResult {
  totalExercises: number
  correctCount: number
  incorrectCount: number
  wordsLearned: number
  accuracy: number // 0-100
}

export function calculateMiniSessionResult(
  results: boolean[],
  wordCount: number
): MiniSessionResult {
  const correctCount = results.filter(Boolean).length
  return {
    totalExercises: results.length,
    correctCount,
    incorrectCount: results.length - correctCount,
    wordsLearned: wordCount,
    accuracy: Math.round((correctCount / results.length) * 100),
  }
}
