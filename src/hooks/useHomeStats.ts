import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { userDataService } from '@/services/userDataService'
import { getCardsByLevel } from '@/modules/VocabularyEngine'
import type { FrenchLevel, Language } from '@/types'

export interface HomeStats {
  levelProgress: { current: FrenchLevel; next: FrenchLevel | null; percent: number }
  todayMinutes: number
  wordsLearned: number
  totalDialogueMinutes: number
  averageDialogueMinutes: number
  currentStreak: number
}

export interface LanguageStats {
  language: Language
  wordsLearned: number
  totalMinutes: number
  todayMinutes: number
  conversationCount: number
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

export function useHomeStats(): {
  stats: HomeStats | null
  languageStats: LanguageStats[]
  loading: boolean
} {
  const { user, profile, progress, currentLanguage } = useAuthContext()
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !profile || !progress) {
      setLoading(false)
      return
    }

    loadStats()
  }, [user?.id, profile, progress, currentLanguage])

  const loadStats = async () => {
    if (!user || !profile || !progress) return

    setLoading(true)

    try {
      const languages: Language[] = (profile.languages as Language[]) || [currentLanguage]

      // Fetch data for all user languages in parallel
      const [allVocabularyProgress, allConversations] = await Promise.all([
        userDataService.getVocabularyProgress(user.id),
        userDataService.getConversations(user.id),
      ])

      // Filter data for current language
      const vocabularyProgress = allVocabularyProgress.filter(
        (p) => (p as any).language === currentLanguage
      )
      const conversations = allConversations.filter(
        (c) => (c as any).language === currentLanguage
      )

      // Calculate level progress for current language
      const currentLevel = profile.french_level || 'A1'
      const nextLevel = getNextLevel(currentLevel)
      const cardsAtLevel = getCardsByLevel(currentLevel, currentLanguage)
      const cardIdsAtLevel = new Set(cardsAtLevel.map((c) => c.id))
      const totalCardsAtLevel = cardsAtLevel.length
      const learnedAtLevel = vocabularyProgress.filter(
        (p) => cardIdsAtLevel.has(p.card_id) && p.repetitions > 0
      ).length

      const levelPercent =
        totalCardsAtLevel > 0
          ? Math.round((learnedAtLevel / totalCardsAtLevel) * 100)
          : 0

      // Calculate today's minutes for current language
      const today = new Date()
      const todayConversations = conversations.filter(
        (c) => c.started_at && isSameDay(new Date(c.started_at), today)
      )
      const todayMs = todayConversations.reduce(
        (sum, c) => sum + (c.duration_ms || 0),
        0
      )
      const todayMinutes = Math.round(todayMs / 60000)

      // Calculate words learned for current language
      const wordsLearned = vocabularyProgress.filter(
        (p) => p.repetitions > 0
      ).length

      // Calculate total dialogue time for current language
      const totalMs = conversations.reduce(
        (sum, c) => sum + (c.duration_ms || 0),
        0
      )
      const totalDialogueMinutes = Math.round(totalMs / 60000)

      // Calculate average dialogue duration for current language
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
        currentStreak: progress.current_streak,
      })

      // Calculate per-language stats
      const perLanguageStats: LanguageStats[] = languages.map((lang) => {
        const langVocab = allVocabularyProgress.filter(
          (p) => (p as any).language === lang
        )
        const langConvos = allConversations.filter(
          (c) => (c as any).language === lang
        )
        const langTodayConvos = langConvos.filter(
          (c) => c.started_at && isSameDay(new Date(c.started_at), today)
        )

        const langTotalMs = langConvos.reduce(
          (sum, c) => sum + (c.duration_ms || 0),
          0
        )
        const langTodayMs = langTodayConvos.reduce(
          (sum, c) => sum + (c.duration_ms || 0),
          0
        )

        return {
          language: lang,
          wordsLearned: langVocab.filter((p) => p.repetitions > 0).length,
          totalMinutes: Math.round(langTotalMs / 60000),
          todayMinutes: Math.round(langTodayMs / 60000),
          conversationCount: langConvos.length,
        }
      })

      setLanguageStats(perLanguageStats)
    } catch (error) {
      console.error('Failed to load home stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return { stats, languageStats, loading }
}
