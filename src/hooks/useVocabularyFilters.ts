import { useState, useCallback, useMemo } from 'react'
import type { VocabularyCard, VocabularyProgress, VocabularyTopic, FrenchLevel } from '@/types'

export interface VocabularyFilters {
  topic: VocabularyTopic | null
  status: 'new' | 'learning' | 'learned' | null
  difficulty: 1 | 2 | 3 | null
  level: FrenchLevel | null
}

export interface UseVocabularyFiltersReturn {
  filters: VocabularyFilters
  setFilter: <K extends keyof VocabularyFilters>(key: K, value: VocabularyFilters[K]) => void
  clearFilters: () => void
  applyFilters: (words: VocabularyCard[], progress: VocabularyProgress[]) => VocabularyCard[]
  activeFilterCount: number
}

const DEFAULT_FILTERS: VocabularyFilters = {
  topic: null,
  status: null,
  difficulty: null,
  level: null,
}

/**
 * Determines the learning status of a vocabulary card based on progress.
 * - 'new': no record in vocabularyProgress for this cardId
 * - 'learning': has record, repetitions < 3
 * - 'learned': repetitions >= 3
 */
function getCardStatus(
  cardId: string,
  progressMap: Map<string, VocabularyProgress>
): 'new' | 'learning' | 'learned' {
  const progress = progressMap.get(cardId)
  if (!progress) return 'new'
  if (progress.repetitions < 3) return 'learning'
  return 'learned'
}

export function useVocabularyFilters(): UseVocabularyFiltersReturn {
  const [filters, setFilters] = useState<VocabularyFilters>(DEFAULT_FILTERS)

  const setFilter = useCallback(<K extends keyof VocabularyFilters>(
    key: K,
    value: VocabularyFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const applyFilters = useCallback(
    (words: VocabularyCard[], progress: VocabularyProgress[]): VocabularyCard[] => {
      // Create a map for O(1) progress lookup
      const progressMap = new Map(progress.map((p) => [p.cardId, p]))

      return words.filter((card) => {
        // Filter by topic
        if (filters.topic !== null && card.topic !== filters.topic) {
          return false
        }

        // Filter by difficulty
        if (filters.difficulty !== null && card.difficulty !== filters.difficulty) {
          return false
        }

        // Filter by level
        if (filters.level !== null && card.level !== filters.level) {
          return false
        }

        // Filter by learning status
        if (filters.status !== null) {
          const cardStatus = getCardStatus(card.id, progressMap)
          if (cardStatus !== filters.status) {
            return false
          }
        }

        return true
      })
    },
    [filters]
  )

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.topic !== null) count++
    if (filters.status !== null) count++
    if (filters.difficulty !== null) count++
    if (filters.level !== null) count++
    return count
  }, [filters])

  return {
    filters,
    setFilter,
    clearFilters,
    applyFilters,
    activeFilterCount,
  }
}
