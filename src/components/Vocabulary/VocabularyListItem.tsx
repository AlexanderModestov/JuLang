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
      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/[0.06] transition-colors border-b border-white/[0.04] last:border-b-0"
    >
      {/* Status icon */}
      <span className="text-lg flex-shrink-0" title={statusInfo.label}>
        {statusInfo.icon}
      </span>

      {/* Word with article and translation */}
      <div className="flex-1 min-w-0">
        {word.article && (
          <span className="font-medium text-primary-400">
            {word.article}
            {word.article !== "l'" && ' '}
          </span>
        )}
        <span className="font-medium text-white/90">
          {getCardWord(word)}
        </span>
        <span className="text-white/30 mx-2">—</span>
        <span className="text-white/50 truncate">
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
