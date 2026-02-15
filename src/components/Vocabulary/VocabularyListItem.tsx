import type { VocabularyCard } from '@/types'
import { getCardWord } from '@/modules/VocabularyEngine'
import { DifficultyStars, statusConfig, type LearningStatus } from './WordCard'

interface VocabularyListItemProps {
  word: VocabularyCard
  status: LearningStatus
  onClick: () => void
}

export default function VocabularyListItem({
  word,
  status,
  onClick,
}: VocabularyListItemProps) {
  const statusInfo = statusConfig[status]

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-3.5 flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-smooth"
    >
      {/* Status dot */}
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          status === 'learned' ? 'bg-success-500' :
          status === 'learning' ? 'bg-warning-500' :
          'bg-stone-300 dark:bg-stone-600'
        }`}
        title={statusInfo.label}
      />

      {/* Word with article and translation */}
      <div className="flex-1 min-w-0">
        <span className="text-sm">
          {word.article && (
            <span className="text-accent-500 dark:text-accent-400 font-medium">
              {word.article}
              {word.article !== "l'" && ' '}
            </span>
          )}
          <span className="font-medium text-stone-900 dark:text-stone-50">
            {getCardWord(word)}
          </span>
          <span className="text-stone-300 dark:text-stone-600 mx-2">&mdash;</span>
          <span className="text-stone-500 dark:text-stone-400 truncate">
            {word.russian}
          </span>
        </span>
      </div>

      {/* Difficulty */}
      <div className="flex-shrink-0">
        <DifficultyStars difficulty={word.difficulty} />
      </div>
    </button>
  )
}
