import type { GrammarCard, SRSQuality } from '@/types'
import { db, saveCard } from '@/db'

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Quality ratings:
 * 0 - Complete blackout
 * 1 - Incorrect, but upon seeing the correct answer, it felt familiar
 * 2 - Incorrect, but the correct answer seemed easy to recall
 * 3 - Correct, but required significant effort
 * 4 - Correct, after some hesitation
 * 5 - Correct, with perfect recall
 */

const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5

export function calculateNextReview(
  card: GrammarCard,
  quality: SRSQuality
): { interval: number; easeFactor: number; nextReview: Date } {
  let { interval, easeFactor, repetitions } = card

  // If quality < 3, reset the card
  if (quality < 3) {
    interval = 0
    repetitions = 0
  } else {
    // Calculate new interval
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  }

  // Update ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const qFactor = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + qFactor)

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return { interval, easeFactor, nextReview }
}

export async function scheduleCard(
  cardId: string,
  quality: SRSQuality
): Promise<GrammarCard | null> {
  const card = await db.grammarCards.get(cardId)
  if (!card) return null

  const { interval, easeFactor, nextReview } = calculateNextReview(card, quality)

  const updatedCard: GrammarCard = {
    ...card,
    interval,
    easeFactor,
    nextReview,
    repetitions: quality < 3 ? 0 : card.repetitions + 1,
    lastReviewed: new Date(),
  }

  await saveCard(updatedCard)
  return updatedCard
}

export async function resetCard(cardId: string): Promise<GrammarCard | null> {
  const card = await db.grammarCards.get(cardId)
  if (!card) return null

  const updatedCard: GrammarCard = {
    ...card,
    interval: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    nextReview: new Date(),
    repetitions: 0,
    lastReviewed: new Date(),
  }

  await saveCard(updatedCard)
  return updatedCard
}

export async function getReviewQueue(userId: string): Promise<GrammarCard[]> {
  const now = new Date()
  const cards = await db.grammarCards
    .where('userId')
    .equals(userId)
    .toArray()

  return cards
    .filter((card) => new Date(card.nextReview) <= now)
    .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
}

export function getQualityLabel(quality: SRSQuality): {
  label: string
  color: string
  description: string
} {
  switch (quality) {
    case 0:
      return {
        label: 'Снова',
        color: 'red',
        description: 'Полный провал',
      }
    case 1:
      return {
        label: 'Плохо',
        color: 'orange',
        description: 'Неправильно, но знакомо',
      }
    case 2:
      return {
        label: 'Сложно',
        color: 'yellow',
        description: 'Неправильно, но легко вспомнить',
      }
    case 3:
      return {
        label: 'Нормально',
        color: 'lime',
        description: 'Правильно с усилием',
      }
    case 4:
      return {
        label: 'Хорошо',
        color: 'green',
        description: 'Правильно после раздумий',
      }
    case 5:
      return {
        label: 'Легко',
        color: 'emerald',
        description: 'Идеально!',
      }
  }
}

export function formatInterval(days: number): string {
  if (days === 0) return 'сегодня'
  if (days === 1) return 'завтра'
  if (days < 7) return `через ${days} дн.`
  if (days < 30) return `через ${Math.round(days / 7)} нед.`
  if (days < 365) return `через ${Math.round(days / 30)} мес.`
  return `через ${Math.round(days / 365)} г.`
}
