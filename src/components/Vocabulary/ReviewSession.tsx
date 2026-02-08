import { useState, useCallback } from 'react'
import type { VocabularyProgress, VocabularyExerciseType } from '@/types'
import {
  getVocabularyCardById,
  scheduleVocabularyCardAuto,
  pickRandomExerciseType,
} from '@/modules/VocabularyEngine'
import ExerciseCard from './ExerciseCard'
import Card from '@/components/ui/Card'

interface ReviewSessionProps {
  queue: VocabularyProgress[]
  onComplete: () => void
}

export default function ReviewSession({ queue, onComplete }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exerciseType, setExerciseType] = useState<VocabularyExerciseType>(pickRandomExerciseType)
  const [showResult, setShowResult] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  const currentProgress = queue[currentIndex]
  const card = currentProgress ? getVocabularyCardById(currentProgress.cardId) : undefined

  // Auto-SRS: schedule based on correct/incorrect, then auto-advance
  const handleResult = useCallback(async (correct: boolean) => {
    setLastCorrect(correct)
    setShowResult(true)
    setStats((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))

    // Schedule with auto quality (correct=4, incorrect=0)
    await scheduleVocabularyCardAuto(currentProgress.id, correct)

    // Auto-transition after brief feedback
    setTimeout(() => {
      setShowResult(false)
      if (currentIndex >= queue.length - 1) {
        onComplete()
      } else {
        setCurrentIndex((i) => i + 1)
        setExerciseType(pickRandomExerciseType())
      }
    }, 1200)
  }, [currentProgress, currentIndex, queue.length, onComplete])

  if (!card) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Нет карточек для повторения.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{currentIndex + 1} / {queue.length}</span>
        <span>{stats.correct}/{stats.total} правильно</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
        />
      </div>

      {!showResult ? (
        <ExerciseCard
          key={`${currentProgress.id}-${exerciseType}`}
          card={card}
          exerciseType={exerciseType}
          onResult={handleResult}
        />
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className={`text-2xl font-bold ${lastCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {lastCorrect ? '✓ Правильно!' : '✗ Неправильно'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {currentIndex < queue.length - 1 ? 'Следующее слово...' : 'Завершение...'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
