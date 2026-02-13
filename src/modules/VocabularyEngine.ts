import type { VocabularyCard, VocabularyProgress, FrenchLevel, SRSQuality, VocabularyExerciseType, Language } from '@/types'
import type { Database } from '@/types/supabase'
import { userDataService } from '@/services/userDataService'
import { supabase } from '@/lib/supabase'
import vocabularyDataFr from '@/data/vocabulary.json'
import vocabularyDataEn from '@/data/vocabulary-en.json'

// Vocabulary data by language
const vocabularyByLanguage: Record<Language, { cards: any[] }> = {
  fr: vocabularyDataFr,
  en: vocabularyDataEn,
  es: { cards: [] }, // Not implemented yet
  de: { cards: [] }, // Not implemented yet
  pt: { cards: [] }, // Not implemented yet
}

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

/** Read custom vocabulary cards from localStorage, filtered by language */
function getCustomVocabularyCards(language: Language): VocabularyCard[] {
  try {
    const raw = localStorage.getItem('customVocabularyCards')
    if (!raw) return []
    const customCards = JSON.parse(raw) as Record<string, any>
    return Object.values(customCards).filter((card) => {
      if (language === 'fr') return !!card.french
      if (language === 'en') return !!card.english
      return false
    }) as VocabularyCard[]
  } catch {
    return []
  }
}

export function getAllVocabularyCards(language: Language = 'fr'): VocabularyCard[] {
  const data = vocabularyByLanguage[language]
  const staticCards = (!data || !data.cards || data.cards.length === 0)
    ? []
    : data.cards.map((card: any) => ({
        ...card,
        // Keep 'french' field for French cards, 'english' for English, etc.
        // The card structure varies by language (french vs english field)
      })) as VocabularyCard[]

  const customCards = getCustomVocabularyCards(language)
  return [...staticCards, ...customCards]
}

export function getCardsByLevel(level: FrenchLevel, language: Language = 'fr'): VocabularyCard[] {
  return getAllVocabularyCards(language).filter((c) => c.level === level)
}

export function getCardsUpToLevel(level: FrenchLevel, language: Language = 'fr'): VocabularyCard[] {
  const levelOrder: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const maxIndex = levelOrder.indexOf(level)
  const levels = levelOrder.slice(0, maxIndex + 1)
  return getAllVocabularyCards(language).filter((c) => levels.includes(c.level as FrenchLevel))
}

export function getVocabularyCardById(cardId: string, language?: Language): VocabularyCard | undefined {
  // If language is specified, search in that language's cards
  if (language) {
    return getAllVocabularyCards(language).find((c) => c.id === cardId)
  }
  // Otherwise, search all languages
  for (const lang of ['fr', 'en', 'es', 'de', 'pt'] as Language[]) {
    const card = getAllVocabularyCards(lang).find((c) => c.id === cardId)
    if (card) return card
  }
  // Direct lookup for custom cards not matched above
  if (cardId.startsWith('v-custom-')) {
    try {
      const raw = localStorage.getItem('customVocabularyCards')
      if (raw) {
        const customCards = JSON.parse(raw) as Record<string, any>
        if (customCards[cardId]) return customCards[cardId] as VocabularyCard
      }
    } catch { /* ignore parse errors */ }
  }
  return undefined
}

/** Get cards not yet in user's progress (new cards to learn) */
export async function getNewCards(
  userId: string,
  level: FrenchLevel,
  language: Language = 'fr'
): Promise<VocabularyCard[]> {
  // Check if vocabulary data exists for this language
  const available = getCardsUpToLevel(level, language)
  if (available.length === 0) {
    return [] // No vocabulary data for this language yet
  }
  const supabaseProgress = await userDataService.getVocabularyProgress(userId)
  const knownIds = new Set(supabaseProgress.map((p) => p.card_id))
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

/** Get the target language word from a card (french, english, etc.) */
export function getCardWord(card: VocabularyCard | any): string {
  // Support both legacy 'french' field and new 'english' field
  return card.french || card.english || ''
}

/** Get example sentence text in the target language (fr, en, etc.) */
export function getExampleText(example: any): string {
  return example?.fr || example?.en || ''
}

/** Generate multiple choice options: correct + 3 distractors from same level */
export function getMultipleChoiceOptions(
  card: VocabularyCard,
  field: 'word' | 'russian',
  language: Language = 'fr'
): string[] {
  const sameLevel = getCardsByLevel(card.level as FrenchLevel, language)
    .filter((c) => c.id !== card.id)

  // Shuffle and pick 3
  const shuffled = sameLevel.sort(() => Math.random() - 0.5)
  const distractors = shuffled.slice(0, 3).map((c) =>
    field === 'russian' ? c.russian : getCardWord(c)
  )

  // Add correct answer and shuffle
  const correctAnswer = field === 'russian' ? card.russian : getCardWord(card)
  const options = [correctAnswer, ...distractors]
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

/** Check if a lemma already exists in vocabulary by word */
export async function isLemmaInProgress(
  userId: string,
  lemma: string,
  language: Language = 'fr'
): Promise<boolean> {
  const allCards = getAllVocabularyCards(language)
  const match = allCards.find(
    (c) => getCardWord(c).toLowerCase() === lemma.toLowerCase()
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
  const allCards = getAllVocabularyCards(language)
  const existing = allCards.find(
    (c) => getCardWord(c).toLowerCase() === lemma.toLowerCase()
  )
  if (existing) {
    return addCardToProgress(userId, existing.id, language)
  }

  // For custom words, we store a custom card in the DB
  // The VocabularyCard data is embedded via a separate Dexie table or localStorage
  const cardId = `v-custom-${crypto.randomUUID()}`

  // Store custom card data in localStorage for lookup
  // Use language-specific field name
  const customCards = JSON.parse(localStorage.getItem('customVocabularyCards') || '{}')
  const exampleKey = language === 'en' ? 'en' : language === 'fr' ? 'fr' : language
  customCards[cardId] = {
    id: cardId,
    // Store with language-specific field
    ...(language === 'fr' ? { french: lemma } : { english: lemma }),
    russian,
    examples: [{ [exampleKey]: example, ru: exampleTranslation }],
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
export function getWordWithArticle(card: VocabularyCard | any): string {
  const word = getCardWord(card)
  if (!card.article) return word
  if (card.article === "l'") return `l'${word}`
  return `${card.article} ${word}`
}

/**
 * Generate fill-in-the-blank exercise data
 * Returns sentence with blank and the correct word
 */
export function generateFillBlankExercise(card: VocabularyCard | any, language: Language = 'fr'): {
  sentence: string
  blankWord: string
  options: string[]
} | null {
  // Need at least one example
  if (!card.examples || card.examples.length === 0) return null

  const example = card.examples[0]
  const word = getCardWord(card).toLowerCase()

  // Get the example sentence in the target language
  const exampleSentence = example.fr || example.en || ''

  // Try to find the word in the example sentence
  const regex = new RegExp(`\\b${word}\\b`, 'i')
  if (!regex.test(exampleSentence)) {
    // Word not found in example, use a simple format
    const prompt = language === 'en' ? `___ means "${card.russian}"` : `___ signifie "${card.russian}"`
    return {
      sentence: prompt,
      blankWord: getCardWord(card),
      options: getMultipleChoiceOptions(card, 'word', language),
    }
  }

  // Replace the word with blank
  const sentence = exampleSentence.replace(regex, '___')

  return {
    sentence,
    blankWord: getCardWord(card),
    options: getMultipleChoiceOptions(card, 'word', language),
  }
}

/**
 * Generate listening exercise data
 * Returns the word to speak and options for user to choose
 */
export function generateListeningExercise(card: VocabularyCard | any, language: Language = 'fr'): {
  wordToSpeak: string
  correctAnswer: string
  options: string[]
} {
  return {
    wordToSpeak: getWordWithArticle(card),
    correctAnswer: card.russian,
    options: getMultipleChoiceOptions(card, 'russian', language),
  }
}

/**
 * Check if user's written answer is correct
 * Handles common variations and accents
 */
export function checkWrittenAnswer(
  userAnswer: string,
  card: VocabularyCard | any
): boolean {
  const normalize = (s: string) => s
    .toLowerCase()
    .trim()
    // Normalize common accent variations
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const normalizedAnswer = normalize(userAnswer)
  const normalizedCorrect = normalize(getCardWord(card))

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
