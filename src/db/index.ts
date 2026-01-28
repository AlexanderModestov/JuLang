import Dexie, { type Table } from 'dexie'
import type {
  GrammarCard,
  Conversation,
  Topic,
  PracticeSession,
  VocabularyProgress,
} from '@/types'

export class JuLangDB extends Dexie {
  grammarCards!: Table<GrammarCard>
  conversations!: Table<Conversation>
  topics!: Table<Topic>
  practiceSessions!: Table<PracticeSession>
  vocabularyProgress!: Table<VocabularyProgress>

  constructor() {
    super('julang')

    this.version(1).stores({
      grammarCards: 'id, userId, topic, level, nextReview',
      conversations: 'id, userId, topicId, startedAt',
      topics: 'id, userId, category, level, isSystem',
      practiceSessions: 'id, userId, cardId, startedAt',
    })

    this.version(2).stores({
      grammarCards: 'id, userId, topic, level, nextReview',
      conversations: 'id, userId, topicId, startedAt',
      topics: 'id, userId, category, level, isSystem',
      practiceSessions: 'id, userId, cardId, startedAt',
      vocabularyProgress: 'id, userId, cardId, nextReview',
    })
  }
}

export const db = new JuLangDB()

// Helper functions
export async function getCardsDueToday(userId: string): Promise<GrammarCard[]> {
  const now = new Date()
  return db.grammarCards
    .where('userId')
    .equals(userId)
    .filter((card) => new Date(card.nextReview) <= now)
    .toArray()
}

export async function getAllCards(userId: string): Promise<GrammarCard[]> {
  return db.grammarCards.where('userId').equals(userId).toArray()
}

export async function getCard(cardId: string): Promise<GrammarCard | undefined> {
  return db.grammarCards.get(cardId)
}

export async function saveCard(card: GrammarCard): Promise<string> {
  return db.grammarCards.put(card)
}

export async function deleteCard(cardId: string): Promise<void> {
  return db.grammarCards.delete(cardId)
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  return db.conversations
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('startedAt')
}

export async function saveConversation(conversation: Conversation): Promise<string> {
  return db.conversations.put(conversation)
}

export async function getTopics(
  level?: string,
  category?: string
): Promise<Topic[]> {
  let query = db.topics.toCollection()

  if (level) {
    query = db.topics.where('level').equals(level)
  }

  const topics = await query.toArray()

  if (category) {
    return topics.filter((t) => t.category === category)
  }

  return topics
}

export async function savePracticeSession(
  session: PracticeSession
): Promise<string> {
  return db.practiceSessions.put(session)
}

export async function getPracticeSessions(
  userId: string,
  cardId?: string
): Promise<PracticeSession[]> {
  let query = db.practiceSessions.where('userId').equals(userId)

  const sessions = await query.toArray()

  if (cardId) {
    return sessions.filter((s) => s.cardId === cardId)
  }

  return sessions
}
