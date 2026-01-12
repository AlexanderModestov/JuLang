import type { GrammarCard, FrenchLevel, GrammarExample } from '@/types'
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

export async function createGrammarCard(
  userId: string,
  topicId: string
): Promise<GrammarCard> {
  const topic = grammarTopics.topics.find((t) => t.id === topicId)
  if (!topic) {
    throw new Error(`Grammar topic not found: ${topicId}`)
  }

  // Generate explanation using AI
  const { explanation, examples } = await generateGrammarExplanation(
    topic.title,
    topic.level as FrenchLevel
  )

  const card: GrammarCard = {
    id: generateId(),
    userId,
    topic: topic.title,
    level: topic.level as FrenchLevel,
    explanation,
    examples: examples.map((e) => ({
      french: e.french,
      russian: e.russian,
    })),
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
