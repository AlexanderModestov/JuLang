import type { VocabularyCard } from '@/types'
import { useSpeech } from '@/hooks/useSpeech'
import { getCardWord, getWordWithArticle, getExampleText } from '@/modules/VocabularyEngine'
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
  new: { icon: '❓', label: 'Новое', color: 'text-primary-400' },
  learning: { icon: '📖', label: 'Изучается', color: 'text-warning-400' },
  learned: { icon: '✅', label: 'Выучено', color: 'text-success-500' },
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
    <span className="text-warning-400" title={`Сложность: ${difficulty}`}>
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
        className="font-mono text-white/50"
        title={`Частотность: ${label}`}
      >
        {scale}
      </span>
      <span className="text-white/40">{label}</span>
    </div>
  )
}

export default function WordCard({
  word,
  learningStatus,
  onNext,
  onPractice,
}: WordCardProps) {
  const { speak } = useSpeech()
  const handleSpeak = (text: string) => {
    speak(text)
  }

  const status = statusConfig[learningStatus]

  return (
    <Card>
      <div className="space-y-4">
        {/* Image placeholder or actual image */}
        <div className="w-full h-40 bg-white/[0.06] rounded-xl overflow-hidden flex items-center justify-center">
          {word.imageUrl ? (
            <img
              src={word.imageUrl}
              alt={getCardWord(word)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white/30 text-4xl">🖼️</div>
          )}
        </div>

        {/* Word with article and TTS button */}
        <div className="text-center">
          <button
            onClick={() => handleSpeak(getWordWithArticle(word))}
            className="text-3xl font-bold text-white/90 hover:text-primary-400 transition-colors inline-flex items-center gap-2"
          >
            {word.article && (
              <span className="text-primary-400">
                {word.article}
                {word.article !== "l'" && ' '}
              </span>
            )}
            {getCardWord(word)}
            <span className="text-2xl">🔊</span>
          </button>
        </div>

        {/* Translation */}
        <div className="text-center border-t border-white/[0.08] pt-4">
          <p className="text-xl text-white/90">{word.russian}</p>
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
            <span className="text-white/40">Сложность:</span>
            <DifficultyStars difficulty={word.difficulty} />
          </div>
        </div>

        {/* Frequency scale */}
        <div className="flex justify-center">
          <FrequencyScale frequency={word.frequency} />
        </div>

        {/* Examples with TTS (up to 3) */}
        <div className="bg-white/[0.03] rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-white/50">Примеры:</p>
          {word.examples.map((example, index) => (
            <div key={index} className="border-l-2 border-primary-500 pl-3">
              <button
                onClick={() => handleSpeak(getExampleText(example))}
                className="text-white/90 hover:text-primary-400 transition-colors text-left w-full"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">🔊</span>
                  <span className="italic">{getExampleText(example)}</span>
                </span>
              </button>
              <p className="text-sm text-white/40 mt-1 ml-7">
                {example.ru}
              </p>
            </div>
          ))}
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
