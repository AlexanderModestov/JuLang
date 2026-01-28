import { useState, useCallback } from 'react'
import type { VocabularyProgress, VocabularyExerciseType, SRSQuality } from '@/types'
import { getVocabularyCardById, scheduleVocabularyCard } from '@/modules/VocabularyEngine'
import { getQualityLabel } from '@/modules/SRSEngine'
import ExerciseCard from './ExerciseCard'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface ReviewSessionProps {
  queue: VocabularyProgress[]
  onComplete: () => void
}

const EXERCISE_TYPES: VocabularyExerciseType[] = ['fr_to_ru', 'ru_to_fr', 'multiple_choice']

function pickExerciseType(): VocabularyExerciseType {
  return EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)]
}

export default function ReviewSession({ queue, onComplete }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exerciseType, setExerciseType] = useState<VocabularyExerciseType>(pickExerciseType)
  const [showRating, setShowRating] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  const currentProgress = queue[currentIndex]
  const card = currentProgress ? getVocabularyCardById(currentProgress.cardId) : undefined

  const handleResult = useCallback((correct: boolean) => {
    setLastCorrect(correct)
    setShowRating(true)
    setStats((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }, [])

  const handleRate = async (quality: SRSQuality) => {
    await scheduleVocabularyCard(currentProgress.id, quality)
    setShowRating(false)

    if (currentIndex >= queue.length - 1) {
      onComplete()
    } else {
      setCurrentIndex((i) => i + 1)
      setExerciseType(pickExerciseType())
    }
  }

  if (!card) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Нет карточек для повторения.</p>
        </div>
      </Card>
    )
  }

  const ratingButtons: { quality: SRSQuality; label: string; color: string }[] = [
    { quality: 0, ...getQualityLabel(0) },
    { quality: 3, ...getQualityLabel(3) },
    { quality: 4, ...getQualityLabel(4) },
    { quality: 5, ...getQualityLabel(5) },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {currentIndex + 1} / {queue.length} · {stats.correct}/{stats.total} правильно
      </p>

      {!showRating ? (
        <ExerciseCard
          key={`${currentProgress.id}-${exerciseType}`}
          card={card}
          exerciseType={exerciseType}
          onResult={handleResult}
        />
      ) : (
        <Card>
          <div className="space-y-4 text-center">
            <p className={`text-lg font-medium ${lastCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {lastCorrect ? 'Правильно!' : 'Неправильно'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Оцените, насколько легко было вспомнить:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {ratingButtons.map(({ quality, label }) => (
                <Button
                  key={quality}
                  variant={quality === 0 ? 'danger' : quality >= 4 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleRate(quality)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
