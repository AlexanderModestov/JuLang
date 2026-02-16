import type { VocabularyCard } from '@/types'
import { useSpeech } from '@/hooks/useSpeech'
import { getCardWord, getWordWithArticle, getExampleText } from '@/modules/VocabularyEngine'
import { Volume2, HelpCircle, BookOpen, CheckCircle2, Star, Image } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export type LearningStatus = 'new' | 'learning' | 'learned'

interface WordCardProps {
  word: VocabularyCard
  learningStatus: LearningStatus
  onNext?: () => void
  onPractice?: () => void
}

// Status display configuration - using lucide-react icons
const statusConfig: Record<LearningStatus, { icon: React.ReactNode; label: string; color: string }> = {
  new: { icon: <HelpCircle size={16} />, label: 'Новое', color: 'text-accent' },
  learning: { icon: <BookOpen size={16} />, label: 'Изучается', color: 'text-warm' },
  learned: { icon: <CheckCircle2 size={16} />, label: 'Выучено', color: 'text-success' },
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
    <span className="inline-flex items-center gap-0.5 text-warm" title={`Сложность: ${difficulty}`}>
      {Array.from({ length: difficulty }).map((_, i) => (
        <Star key={i} size={14} fill="currentColor" />
      ))}
    </span>
  )
}

// Frequency scale component - visual bars
function FrequencyScale({ frequency }: { frequency: 1 | 2 | 3 | 4 | 5 }) {
  const label = frequencyLabels[frequency]

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-0.5" title={`Частотность: ${label}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-3 rounded-sm ${
              i < frequency ? 'bg-accent' : 'bg-surface-3'
            }`}
          />
        ))}
      </div>
      <span className="text-text-muted">{label}</span>
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
        <div className="w-full h-40 bg-surface-2 rounded-lg overflow-hidden flex items-center justify-center">
          {word.imageUrl ? (
            <img
              src={word.imageUrl}
              alt={getCardWord(word)}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image size={40} className="text-text-muted" />
          )}
        </div>

        {/* Word with article and TTS button */}
        <div className="text-center">
          <button
            onClick={() => handleSpeak(getWordWithArticle(word))}
            className="text-3xl font-bold text-text-primary hover:text-accent transition-colors inline-flex items-center gap-2"
          >
            {word.article && (
              <span className="text-accent">
                {word.article}
                {word.article !== "l'" && ' '}
              </span>
            )}
            {getCardWord(word)}
            <Volume2 size={24} className="text-accent" />
          </button>
        </div>

        {/* Translation */}
        <div className="text-center border-t border-border-subtle pt-4">
          <p className="text-xl text-text-primary">{word.russian}</p>
        </div>

        {/* Status, Difficulty, Frequency row */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          {/* Learning status */}
          <div className={`flex items-center gap-1 ${status.color}`}>
            {status.icon}
            <span>{status.label}</span>
          </div>

          {/* Difficulty stars */}
          <div className="flex items-center gap-1">
            <span className="text-text-muted">Сложность:</span>
            <DifficultyStars difficulty={word.difficulty} />
          </div>
        </div>

        {/* Frequency scale */}
        <div className="flex justify-center">
          <FrequencyScale frequency={word.frequency} />
        </div>

        {/* Examples with TTS (up to 3) */}
        <div className="bg-surface-2 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-text-secondary">Примеры:</p>
          {word.examples.map((example, index) => (
            <div key={index} className="border-l-2 border-accent-muted pl-3">
              <button
                onClick={() => handleSpeak(getExampleText(example))}
                className="text-text-primary hover:text-accent transition-colors text-left w-full"
              >
                <span className="inline-flex items-center gap-2">
                  <Volume2 size={16} className="text-accent flex-shrink-0" />
                  <span className="italic">{getExampleText(example)}</span>
                </span>
              </button>
              <p className="text-sm text-text-muted mt-1 ml-6">
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
