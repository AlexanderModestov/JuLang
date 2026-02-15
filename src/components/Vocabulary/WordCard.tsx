import type { VocabularyCard } from '@/types'
import { speak } from '@/modules/SpeechService'
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
  new: { icon: '?', label: 'Новое', color: 'text-accent-500 dark:text-accent-400' },
  learning: { icon: '~', label: 'Изучается', color: 'text-warning-500 dark:text-warning-400' },
  learned: { icon: '\u2713', label: 'Выучено', color: 'text-success-500 dark:text-success-400' },
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
    <span className="flex items-center gap-0.5" title={`Сложность: ${difficulty}`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < difficulty ? 'text-amber-400' : 'text-stone-200 dark:text-stone-700'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

// Frequency scale component
function FrequencyScale({ frequency }: { frequency: 1 | 2 | 3 | 4 | 5 }) {
  const label = frequencyLabels[frequency]

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-sm ${
              i < frequency
                ? 'bg-accent-400 dark:bg-accent-500'
                : 'bg-stone-200 dark:bg-stone-700'
            }`}
          />
        ))}
      </div>
      <span className="text-stone-500 dark:text-stone-400">{label}</span>
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
      <div className="space-y-5">
        {/* Image placeholder or actual image */}
        <div className="w-full h-40 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden flex items-center justify-center">
          {word.imageUrl ? (
            <img
              src={word.imageUrl}
              alt={getCardWord(word)}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-10 h-10 text-stone-300 dark:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
            </svg>
          )}
        </div>

        {/* Word with article and TTS button */}
        <div className="text-center">
          <button
            onClick={() => handleSpeak(getWordWithArticle(word))}
            className="font-display text-display-sm font-semibold text-stone-900 dark:text-stone-50 hover:text-accent-600 dark:hover:text-accent-400 transition-smooth inline-flex items-center gap-2"
          >
            {word.article && (
              <span className="text-accent-500 dark:text-accent-400">
                {word.article}
                {word.article !== "l'" && ' '}
              </span>
            )}
            {getCardWord(word)}
            <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </button>
        </div>

        {/* Translation */}
        <div className="text-center border-t border-stone-200/60 dark:border-stone-800/60 pt-4">
          <p className="text-lg text-stone-700 dark:text-stone-300">{word.russian}</p>
        </div>

        {/* Status, Difficulty, Frequency row */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          {/* Learning status */}
          <div className={`flex items-center gap-1.5 ${status.color}`}>
            <span className="font-medium">{status.icon}</span>
            <span>{status.label}</span>
          </div>

          {/* Difficulty stars */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 dark:text-stone-400">Сложность:</span>
            <DifficultyStars difficulty={word.difficulty} />
          </div>
        </div>

        {/* Frequency scale */}
        <div className="flex justify-center">
          <FrequencyScale frequency={word.frequency} />
        </div>

        {/* Examples with TTS (up to 3) */}
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Примеры</p>
          {word.examples.map((example, index) => (
            <div key={index} className="border-l-2 border-accent-300 dark:border-accent-700 pl-3">
              <button
                onClick={() => handleSpeak(getExampleText(example))}
                className="text-stone-800 dark:text-stone-200 hover:text-accent-600 dark:hover:text-accent-400 transition-smooth text-left w-full"
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                  <span className="italic">{getExampleText(example)}</span>
                </span>
              </button>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 ml-6">
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
