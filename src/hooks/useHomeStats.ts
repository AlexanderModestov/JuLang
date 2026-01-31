import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { db } from '@/db'
import { getCardsByLevel } from '@/modules/VocabularyEngine'
import type { FrenchLevel } from '@/types'

export interface HomeStats {
  levelProgress: { current: FrenchLevel; next: FrenchLevel | null; percent: number }
  todayMinutes: number
  wordsLearned: number
  totalDialogueMinutes: number
  averageDialogueMinutes: number
  currentStreak: number
}

const LEVEL_ORDER: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function getNextLevel(current: FrenchLevel): FrenchLevel | null {
  const index = LEVEL_ORDER.indexOf(current)
  if (index === -1 || index >= LEVEL_ORDER.length - 1) return null
  return LEVEL_ORDER[index + 1]
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function useHomeStats(): { stats: HomeStats | null; loading: boolean } {
  const { user, progress } = useAppStore()
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !progress) {
      setLoading(false)
      return
    }

    loadStats()
  }, [user, progress])

  const loadStats = async () => {
    if (!user || !progress) return

    setLoading(true)

    try {
      // Fetch all data in parallel
      const [vocabularyProgress, conversations] = await Promise.all([
        db.vocabularyProgress.where('userId').equals(user.id).toArray(),
        db.conversations.where('userId').equals(user.id).toArray(),
      ])

      // Calculate level progress
      const currentLevel = user.frenchLevel
      const nextLevel = getNextLevel(currentLevel)
      const cardsAtLevel = getCardsByLevel(currentLevel)
      const cardIdsAtLevel = new Set(cardsAtLevel.map((c) => c.id))
      const totalCardsAtLevel = cardsAtLevel.length
      const learnedAtLevel = vocabularyProgress.filter(
        (p) => cardIdsAtLevel.has(p.cardId) && p.repetitions > 0
      ).length

      const levelPercent =
        totalCardsAtLevel > 0
          ? Math.round((learnedAtLevel / totalCardsAtLevel) * 100)
          : 0

      // Calculate today's minutes
      const today = new Date()
      const todayConversations = conversations.filter(
        (c) => c.startedAt && isSameDay(new Date(c.startedAt), today)
      )
      const todayMs = todayConversations.reduce(
        (sum, c) => sum + (c.durationMs || 0),
        0
      )
      const todayMinutes = Math.round(todayMs / 60000)

      // Calculate words learned (count of vocabulary progress with at least one review)
      const wordsLearned = vocabularyProgress.filter(
        (p) => p.repetitions > 0
      ).length

      // Calculate total dialogue time
      const totalMs = conversations.reduce(
        (sum, c) => sum + (c.durationMs || 0),
        0
      )
      const totalDialogueMinutes = Math.round(totalMs / 60000)

      // Calculate average dialogue duration
      const conversationCount = conversations.length
      const averageDialogueMinutes =
        conversationCount > 0
          ? Math.round(totalMs / conversationCount / 60000)
          : 0

      setStats({
        levelProgress: {
          current: currentLevel,
          next: nextLevel,
          percent: levelPercent,
        },
        todayMinutes,
        wordsLearned,
        totalDialogueMinutes,
        averageDialogueMinutes,
        currentStreak: progress.currentStreak,
      })
    } catch (error) {
      console.error('Failed to load home stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading }
}
