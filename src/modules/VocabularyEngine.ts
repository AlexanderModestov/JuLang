import type { VocabularyCard, VocabularyProgress, FrenchLevel, SRSQuality } from '@/types'
import { db } from '@/db'
import vocabularyData from '@/data/vocabulary.json'

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
  level: FrenchLevel
): Promise<VocabularyCard[]> {
  const progress = await db.vocabularyProgress
    .where('userId')
    .equals(userId)
    .toArray()
  const knownIds = new Set(progress.map((p) => p.cardId))
  const available = getCardsUpToLevel(level)
  return available.filter((c) => !knownIds.has(c.id)).slice(0, NEW_CARDS_PER_SESSION)
}

/** Get cards due for review */
export async function getReviewQueue(userId: string): Promise<VocabularyProgress[]> {
  const now = new Date()
  const all = await db.vocabularyProgress
    .where('userId')
    .equals(userId)
    .toArray()
  return all
    .filter((p) => new Date(p.nextReview) <= now)
    .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
}

/** Add a card to user's SRS progress */
export async function addCardToProgress(
  userId: string,
  cardId: string
): Promise<VocabularyProgress> {
  const existing = await db.vocabularyProgress
    .where('userId')
    .equals(userId)
    .filter((p) => p.cardId === cardId)
    .first()
  if (existing) return existing

  const entry: VocabularyProgress = {
    id: crypto.randomUUID(),
    userId,
    cardId,
    nextReview: new Date(),
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    createdAt: new Date(),
  }
  await db.vocabularyProgress.put(entry)
  return entry
}

/** Schedule card after review using SM-2 */
export async function scheduleVocabularyCard(
  progressId: string,
  quality: SRSQuality
): Promise<VocabularyProgress | null> {
  const entry = await db.vocabularyProgress.get(progressId)
  if (!entry) return null

  let { interval, easeFactor, repetitions } = entry

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

  const updated: VocabularyProgress = {
    ...entry,
    interval,
    easeFactor,
    repetitions,
    nextReview,
    lastReviewed: new Date(),
  }
  await db.vocabularyProgress.put(updated)
  return updated
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
  const entry = await db.vocabularyProgress
    .where('userId')
    .equals(userId)
    .filter((p) => p.cardId === cardId)
    .first()
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
  const progress = await db.vocabularyProgress
    .where('userId')
    .equals(userId)
    .toArray()
  return progress.some((p) => p.cardId.startsWith('v-custom-') && p.cardId.includes(lemma.toLowerCase()))
}

/** Add a vocabulary card from a conversation word tap */
export async function addCardFromConversation(
  userId: string,
  lemma: string,
  russian: string,
  gender: 'masculine' | 'feminine' | null,
  type: 'word' | 'expression',
  example: string,
  exampleTranslation: string
): Promise<VocabularyProgress> {
  // Check if static card exists
  const allCards = getAllVocabularyCards()
  const existing = allCards.find(
    (c) => c.french.toLowerCase() === lemma.toLowerCase()
  )
  if (existing) {
    return addCardToProgress(userId, existing.id)
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
    example,
    exampleTranslation,
    level: 'A1' as const,
    type,
    ...(gender ? { gender } : {}),
  }
  localStorage.setItem('customVocabularyCards', JSON.stringify(customCards))

  return addCardToProgress(userId, cardId)
}
