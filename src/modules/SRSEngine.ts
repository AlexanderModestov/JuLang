import type { GrammarCard, SRSQuality, FrenchLevel } from '@/types'
import type { Database } from '@/types/supabase'
import { userDataService } from '@/services/userDataService'

type SupabaseGrammarCard = Database['public']['Tables']['grammar_cards']['Row']

// Convert Supabase grammar card to local GrammarCard type
function toLocalGrammarCard(card: SupabaseGrammarCard): GrammarCard {
  return {
    id: card.id,
    userId: card.user_id,
    language: (card as any).language || 'fr', // Default to French until DB migrated
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
  const supabaseCard = await userDataService.getGrammarCard(cardId)
  if (!supabaseCard) return null

  const card = toLocalGrammarCard(supabaseCard)
  const { interval, easeFactor, nextReview } = calculateNextReview(card, quality)

  const updatedSupabaseCard = await userDataService.updateGrammarCard(cardId, {
    interval,
    ease_factor: easeFactor,
    next_review: nextReview.toISOString(),
    repetitions: quality < 3 ? 0 : card.repetitions + 1,
    last_reviewed: new Date().toISOString(),
  })

  return toLocalGrammarCard(updatedSupabaseCard)
}

export async function resetCard(cardId: string): Promise<GrammarCard | null> {
  const supabaseCard = await userDataService.getGrammarCard(cardId)
  if (!supabaseCard) return null

  const now = new Date()
  const updatedSupabaseCard = await userDataService.updateGrammarCard(cardId, {
    interval: 0,
    ease_factor: DEFAULT_EASE_FACTOR,
    next_review: now.toISOString(),
    repetitions: 0,
    last_reviewed: now.toISOString(),
  })

  return toLocalGrammarCard(updatedSupabaseCard)
}

export async function getReviewQueue(userId: string): Promise<GrammarCard[]> {
  // userDataService.getGrammarCardsDue already filters by due date and sorts by next_review
  const supabaseCards = await userDataService.getGrammarCardsDue(userId)
  return supabaseCards.map(toLocalGrammarCard)
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
