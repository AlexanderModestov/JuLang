import type { VocabularyCard, VocabularyProgress } from '@/types'
import Card from '@/components/ui/Card'
import VocabularyListItem from './VocabularyListItem'
import type { LearningStatus } from './WordCard'

interface VocabularyListProps {
  words: VocabularyCard[]
  progress: VocabularyProgress[]
  onWordClick: (word: VocabularyCard) => void
}

/**
 * Calculate learning status based on progress data.
 * - 'new': no record in vocabularyProgress
 * - 'learning': repetitions < 3
 * - 'learned': repetitions >= 3
 */
function getLearningStatus(
  cardId: string,
  progress: VocabularyProgress[]
): LearningStatus {
  const progressRecord = progress.find((p) => p.cardId === cardId)

  if (!progressRecord) {
    return 'new'
  }

  if (progressRecord.repetitions >= 3) {
    return 'learned'
  }

  return 'learning'
}

export default function VocabularyList({
  words,
  progress,
  onWordClick,
}: VocabularyListProps) {
  if (words.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Нет слов для отображения.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card padding="none">
      <div className="max-h-[60vh] overflow-y-auto">
        {words.map((word) => (
          <VocabularyListItem
            key={word.id}
            word={word}
            status={getLearningStatus(word.id, progress)}
            onClick={() => onWordClick(word)}
          />
        ))}
      </div>
    </Card>
  )
}

// Export the helper function for external use
export { getLearningStatus }
