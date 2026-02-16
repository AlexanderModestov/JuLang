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
      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors border-b border-border-subtle last:border-b-0"
    >
      {/* Status icon */}
      <span className={`flex-shrink-0 ${statusInfo.color}`} title={statusInfo.label}>
        {statusInfo.icon}
      </span>

      {/* Word with article and translation */}
      <div className="flex-1 min-w-0">
        {word.article && (
          <span className="font-medium text-accent">
            {word.article}
            {word.article !== "l'" && ' '}
          </span>
        )}
        <span className="font-medium text-text-primary">
          {getCardWord(word)}
        </span>
        <span className="text-text-muted mx-2">&mdash;</span>
        <span className="text-text-secondary truncate">
          {word.russian}
        </span>
      </div>

      {/* Difficulty stars */}
      <div className="flex-shrink-0">
        <DifficultyStars difficulty={word.difficulty} />
      </div>
    </button>
  )
}
