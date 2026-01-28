import type { GrammarCard, FrenchLevel, GrammarExample, GrammarTopicContent } from '@/types'
import { db, saveCard, getAllCards } from '@/db'
import { generateGrammarExplanation } from './AIService'
import { getDefaultPracticeStats } from './PracticeEngine'
import grammarTopics from '@/data/grammar-topics.json'

const generateId = () => crypto.randomUUID()

export interface GrammarTopic {
  id: string
  title: string
  titleRu: string
  level: FrenchLevel
  category: string
  content?: GrammarTopicContent
}

export function getGrammarTopicsByLevel(level: FrenchLevel): GrammarTopic[] {
  return grammarTopics.topics.filter((t) => t.level === level) as GrammarTopic[]
}

export function getAllGrammarTopics(): GrammarTopic[] {
  return grammarTopics.topics as GrammarTopic[]
}

export function getGrammarTopicsByCategory(category: string): GrammarTopic[] {
  return grammarTopics.topics.filter((t) => t.category === category) as GrammarTopic[]
}

export function getGrammarCategories(): string[] {
  return grammarTopics.categories
}

export function getGrammarTopicById(topicId: string): GrammarTopic | undefined {
  return grammarTopics.topics.find((t) => t.id === topicId) as GrammarTopic | undefined
}

// Create a grammar card from static JSON content (no AI needed)
export async function createCardFromStatic(
  userId: string,
  topic: GrammarTopic
): Promise<GrammarCard> {
  const content = topic.content

  const card: GrammarCard = {
    id: generateId(),
    userId,
    topicId: topic.id,
    topic: topic.title,
    level: topic.level,
    explanation: content?.rule || '',
    examples: content?.examples.map((e) => ({
      french: e.fr,
      russian: e.ru,
    })) || [],
    commonMistakes: content?.commonMistakes || [],
    isEnhanced: false,
    nextReview: new Date(),
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    createdAt: new Date(),
    practiceStats: getDefaultPracticeStats(),
  }

  await saveCard(card)
  return card
}

// Ensure cards exist for user's level and all previous levels
export async function ensureCardsForLevel(
  userId: string,
  level: FrenchLevel
): Promise<void> {
  const existingCards = await getUserCards(userId)
  const existingTopicIds = new Set(existingCards.map((c) => c.topicId))

  const levelOrder: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const targetLevels = levelOrder.slice(0, levelOrder.indexOf(level) + 1)

  const topicsToCreate = (grammarTopics.topics as GrammarTopic[])
    .filter((t) => targetLevels.includes(t.level as FrenchLevel))
    .filter((t) => !existingTopicIds.has(t.id))

  for (const topic of topicsToCreate) {
    await createCardFromStatic(userId, topic)
  }
}

export async function createGrammarCard(
  userId: string,
  topicId: string
): Promise<GrammarCard> {
  const topic = grammarTopics.topics.find((t) => t.id === topicId) as GrammarTopic | undefined
  if (!topic) {
    throw new Error(`Grammar topic not found: ${topicId}`)
  }

  // If topic has static content, use it
  if (topic.content) {
    return createCardFromStatic(userId, topic)
  }

  // Otherwise, generate explanation using AI (fallback)
  const { explanation, examples } = await generateGrammarExplanation(
    topic.title,
    topic.level as FrenchLevel
  )

  const card: GrammarCard = {
    id: generateId(),
    userId,
    topicId: topic.id,
    topic: topic.title,
    level: topic.level as FrenchLevel,
    explanation,
    examples: examples.map((e) => ({
      french: e.french,
      russian: e.russian,
    })),
    commonMistakes: [],
    isEnhanced: false,
    nextReview: new Date(),
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    createdAt: new Date(),
    practiceStats: getDefaultPracticeStats(),
  }

  await saveCard(card)
  return card
}

export async function createInitialCards(
  userId: string,
  level: FrenchLevel,
  count: number = 5
): Promise<GrammarCard[]> {
  const topics = getGrammarTopicsByLevel(level).slice(0, count)
  const cards: GrammarCard[] = []

  for (const topic of topics) {
    try {
      const card = await createGrammarCard(userId, topic.id)
      cards.push(card)
    } catch (error) {
      console.error(`Failed to create card for ${topic.title}:`, error)
    }
  }

  return cards
}

export async function getUserCards(userId: string): Promise<GrammarCard[]> {
  return getAllCards(userId)
}

export async function getCardById(cardId: string): Promise<GrammarCard | undefined> {
  return db.grammarCards.get(cardId)
}

export async function updateCardExamples(
  cardId: string,
  examples: GrammarExample[]
): Promise<void> {
  await db.grammarCards.update(cardId, { examples })
}

export async function deleteGrammarCard(cardId: string): Promise<void> {
  await db.grammarCards.delete(cardId)
}

// Get cards that haven't been practiced with a specific type
export async function getCardsForPractice(
  userId: string,
  practiceType: keyof GrammarCard['practiceStats']
): Promise<GrammarCard[]> {
  const cards = await getAllCards(userId)

  return cards.sort((a, b) => {
    const aStats = a.practiceStats[practiceType]
    const bStats = b.practiceStats[practiceType]

    // Sort by least practiced first
    const aAttempts = 'attempts' in aStats ? aStats.attempts : aStats.sessions
    const bAttempts = 'attempts' in bStats ? bStats.attempts : bStats.sessions

    return aAttempts - bAttempts
  })
}
