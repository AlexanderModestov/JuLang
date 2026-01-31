import type { VocabularyCard } from '@/types'
import { speak } from '@/modules/SpeechService'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export type LearningStatus = 'new' | 'learning' | 'learned'

interface WordCardProps {
  word: VocabularyCard
  learningStatus: LearningStatus
  onNext?: () => void
  onPractice?: () => void
}

// Status display configuration
const statusConfig: Record<LearningStatus, { icon: string; label: string; color: string }> = {
  new: { icon: '❓', label: 'Новое', color: 'text-blue-600 dark:text-blue-400' },
  learning: { icon: '📖', label: 'Изучается', color: 'text-yellow-600 dark:text-yellow-400' },
  learned: { icon: '✅', label: 'Выучено', color: 'text-green-600 dark:text-green-400' },
}

// Frequency labels in Russian
const frequencyLabels: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Редкое',
  2: 'Нечастое',
  3: 'Обычное',
  4: 'Частое',
  5: 'Очень частое',
}

// Difficulty stars display
function DifficultyStars({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  return (
    <span className="text-yellow-500" title={`Сложность: ${difficulty}`}>
      {'⭐'.repeat(difficulty)}
    </span>
  )
}

// Frequency scale component - visual bars (▓▓▓░░ for value 3)
function FrequencyScale({ frequency }: { frequency: 1 | 2 | 3 | 4 | 5 }) {
  const filled = '▓'
  const empty = '░'
  const scale = filled.repeat(frequency) + empty.repeat(5 - frequency)
  const label = frequencyLabels[frequency]

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="font-mono text-gray-600 dark:text-gray-400"
        title={`Частотность: ${label}`}
      >
        {scale}
      </span>
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  )
}

export default function WordCard({
  word,
  learningStatus,
  onNext,
  onPractice,
}: WordCardProps) {
  const handleSpeak = (text: string) => {
    speak(text)
  }

  const status = statusConfig[learningStatus]

  return (
    <Card>
      <div className="space-y-4">
        {/* Image placeholder or actual image */}
        <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
          {word.imageUrl ? (
            <img
              src={word.imageUrl}
              alt={word.french}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-4xl">🖼️</div>
          )}
        </div>

        {/* Word with TTS button */}
        <div className="text-center">
          <button
            onClick={() => handleSpeak(word.french)}
            className="text-3xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-2"
          >
            {word.french}
            <span className="text-2xl">🔊</span>
          </button>
          {word.gender && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {word.gender === 'masculine' ? '(masculin)' : '(féminin)'}
            </p>
          )}
        </div>

        {/* Translation */}
        <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-xl text-gray-800 dark:text-gray-200">{word.russian}</p>
        </div>

        {/* Status, Difficulty, Frequency row */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          {/* Learning status */}
          <div className={`flex items-center gap-1 ${status.color}`}>
            <span>{status.icon}</span>
            <span>{status.label}</span>
          </div>

          {/* Difficulty stars */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-gray-400">Сложность:</span>
            <DifficultyStars difficulty={word.difficulty} />
          </div>
        </div>

        {/* Frequency scale */}
        <div className="flex justify-center">
          <FrequencyScale frequency={word.frequency} />
        </div>

        {/* Example with TTS */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <button
            onClick={() => handleSpeak(word.example)}
            className="text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left w-full"
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-lg">🔊</span>
              <span className="italic">{word.example}</span>
            </span>
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-7">
            {word.exampleTranslation}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          {onPractice && (
            <Button variant="secondary" onClick={onPractice} className="flex-1">
              Практика
            </Button>
          )}
          {onNext && (
            <Button onClick={onNext} className="flex-1">
              Следующее
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// Export sub-components for reuse
export { DifficultyStars, FrequencyScale, frequencyLabels, statusConfig }
