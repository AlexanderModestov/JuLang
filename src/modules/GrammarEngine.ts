import type { GrammarCard, FrenchLevel, GrammarExample, GrammarTopicContent } from '@/types'
import type { Database } from '@/types/supabase'
import { userDataService } from '@/services/userDataService'
import { generateGrammarExplanation } from './AIService'
import { getDefaultPracticeStats } from './PracticeEngine'
import grammarTopics from '@/data/grammar-topics.json'

type SupabaseGrammarCard = Database['public']['Tables']['grammar_cards']['Row']
type SupabaseGrammarCardInsert = Database['public']['Tables']['grammar_cards']['Insert']

const generateId = () => crypto.randomUUID()

// Convert Supabase grammar card to local GrammarCard type
function toLocalGrammarCard(card: SupabaseGrammarCard): GrammarCard {
  return {
    id: card.id,
    userId: card.user_id,
    topicId: card.topic_id,
    topic: card.topic,
    level: card.level as FrenchLevel,
    explanation: card.explanation || '',
    examples: card.examples.map((e) => ({
      french: e.fr,
      russian: e.ru,
    })),
    commonMistakes: card.common_mistakes,
    isEnhanced: card.is_enhanced,
    enhancedExplanation: card.enhanced_explanation || undefined,
    nextReview: new Date(card.next_review),
    easeFactor: card.ease_factor,
    interval: card.interval,
    repetitions: card.repetitions,
    createdAt: new Date(card.created_at),
    lastReviewed: card.last_reviewed ? new Date(card.last_reviewed) : undefined,
    practiceStats: {
      written_translation: {
        attempts: card.practice_stats.written_translation.attempts,
        correct: card.practice_stats.written_translation.correct,
        lastAttempt: card.practice_stats.written_translation.lastAttempt
          ? new Date(card.practice_stats.written_translation.lastAttempt)
          : undefined,
      },
      repeat_aloud: {
        attempts: card.practice_stats.repeat_aloud.attempts,
        avgPronunciationScore: card.practice_stats.repeat_aloud.avgPronunciationScore,
        lastAttempt: card.practice_stats.repeat_aloud.lastAttempt
          ? new Date(card.practice_stats.repeat_aloud.lastAttempt)
          : undefined,
      },
      oral_translation: {
        attempts: card.practice_stats.oral_translation.attempts,
        correct: card.practice_stats.oral_translation.correct,
        avgPronunciationScore: card.practice_stats.oral_translation.avgPronunciationScore,
        lastAttempt: card.practice_stats.oral_translation.lastAttempt
          ? new Date(card.practice_stats.oral_translation.lastAttempt)
          : undefined,
      },
      grammar_dialog: {
        sessions: card.practice_stats.grammar_dialog.sessions,
        totalMessages: card.practice_stats.grammar_dialog.totalMessages,
        grammarUsageRate: card.practice_stats.grammar_dialog.grammarUsageRate,
        lastSession: card.practice_stats.grammar_dialog.lastSession
          ? new Date(card.practice_stats.grammar_dialog.lastSession)
          : undefined,
      },
    },
  }
}

// Convert local GrammarCard to Supabase insert format
function toSupabaseGrammarCardInsert(card: GrammarCard): SupabaseGrammarCardInsert {
  return {
    id: card.id,
    user_id: card.userId,
    topic_id: card.topicId,
    topic: card.topic,
    level: card.level,
    explanation: card.explanation,
    examples: card.examples.map((e) => ({
      fr: e.french,
      ru: e.russian,
    })),
    common_mistakes: card.commonMistakes,
    is_enhanced: card.isEnhanced,
    enhanced_explanation: card.enhancedExplanation || null,
    next_review: card.nextReview.toISOString(),
    ease_factor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
    last_reviewed: card.lastReviewed?.toISOString() || null,
    practice_stats: {
      written_translation: {
        attempts: card.practiceStats.written_translation.attempts,
        correct: card.practiceStats.written_translation.correct,
        lastAttempt: card.practiceStats.written_translation.lastAttempt?.toISOString(),
      },
      repeat_aloud: {
        attempts: card.practiceStats.repeat_aloud.attempts,
        avgPronunciationScore: card.practiceStats.repeat_aloud.avgPronunciationScore,
        lastAttempt: card.practiceStats.repeat_aloud.lastAttempt?.toISOString(),
      },
      oral_translation: {
        attempts: card.practiceStats.oral_translation.attempts,
        correct: card.practiceStats.oral_translation.correct,
        avgPronunciationScore: card.practiceStats.oral_translation.avgPronunciationScore,
        lastAttempt: card.practiceStats.oral_translation.lastAttempt?.toISOString(),
      },
      grammar_dialog: {
        sessions: card.practiceStats.grammar_dialog.sessions,
        totalMessages: card.practiceStats.grammar_dialog.totalMessages,
        grammarUsageRate: card.practiceStats.grammar_dialog.grammarUsageRate,
        lastSession: card.practiceStats.grammar_dialog.lastSession?.toISOString(),
      },
    },
  }
}

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

  const supabaseCard = toSupabaseGrammarCardInsert(card)
  const savedCard = await userDataService.createGrammarCard(supabaseCard)
  return toLocalGrammarCard(savedCard)
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

  const supabaseCard = toSupabaseGrammarCardInsert(card)
  const savedCard = await userDataService.createGrammarCard(supabaseCard)
  return toLocalGrammarCard(savedCard)
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
  const cards = await userDataService.getGrammarCards(userId)
  return cards.map(toLocalGrammarCard)
}

export async function getCardById(cardId: string): Promise<GrammarCard | undefined> {
  const card = await userDataService.getGrammarCard(cardId)
  return card ? toLocalGrammarCard(card) : undefined
}

export async function updateCardExamples(
  cardId: string,
  examples: GrammarExample[]
): Promise<void> {
  const supabaseExamples = examples.map((e) => ({
    fr: e.french,
    ru: e.russian,
  }))
  await userDataService.updateGrammarCard(cardId, { examples: supabaseExamples })
}

export async function deleteGrammarCard(cardId: string): Promise<void> {
  await userDataService.deleteGrammarCard(cardId)
}

// Get cards that haven't been practiced with a specific type
export async function getCardsForPractice(
  userId: string,
  practiceType: keyof GrammarCard['practiceStats']
): Promise<GrammarCard[]> {
  const supabaseCards = await userDataService.getGrammarCards(userId)
  const cards = supabaseCards.map(toLocalGrammarCard)

  return cards.sort((a, b) => {
    const aStats = a.practiceStats[practiceType]
    const bStats = b.practiceStats[practiceType]

    // Sort by least practiced first
    const aAttempts = 'attempts' in aStats ? aStats.attempts : aStats.sessions
    const bAttempts = 'attempts' in bStats ? bStats.attempts : bStats.sessions

    return aAttempts - bAttempts
  })
}
