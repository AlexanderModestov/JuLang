import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import type { VocabularyCard, VocabularyProgress, GrammarCard, VocabularyExerciseType } from '@/types'
import {
  getReviewQueue as getVocabReviewQueue,
  getVocabularyCardById,
  scheduleVocabularyCardAuto,
  pickRandomExerciseType,
} from '@/modules/VocabularyEngine'
import { getReviewQueue as getGrammarReviewQueue } from '@/modules/SRSEngine'
import ExerciseCard from '@/components/Vocabulary/ExerciseCard'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type ExerciseSource = 'vocabulary' | 'grammar'

interface MixedExercise {
  source: ExerciseSource
  vocabProgress?: VocabularyProgress
  vocabCard?: VocabularyCard
  grammarCard?: GrammarCard
  exerciseType: VocabularyExerciseType
}

export default function ExercisesScreen() {
  const navigate = useNavigate()
  const { user, currentLanguage, incrementLanguageStats } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [exercises, setExercises] = useState<MixedExercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0, grammarCorrect: 0 })
  const [sessionComplete, setSessionComplete] = useState(false)

  useEffect(() => {
    if (user) loadExercises()
  }, [user])

  const loadExercises = async () => {
    if (!user) return
    setLoading(true)

    try {
      // Get vocabulary and grammar review queues
      const [vocabQueue, grammarQueue] = await Promise.all([
        getVocabReviewQueue(user.id, currentLanguage),
        getGrammarReviewQueue(user.id),
      ])

      // Build mixed exercises
      const mixed: MixedExercise[] = []

      // Add vocabulary exercises
      for (const progress of vocabQueue.slice(0, 10)) {
        const card = getVocabularyCardById(progress.cardId)
        if (card) {
          mixed.push({
            source: 'vocabulary',
            vocabProgress: progress,
            vocabCard: card,
            exerciseType: pickRandomExerciseType(),
          })
        }
      }

      // Add grammar exercises (as vocabulary-style for now)
      // Grammar exercises will use simplified format
      for (const grammarCard of grammarQueue.slice(0, 5)) {
        mixed.push({
          source: 'grammar',
          grammarCard,
          exerciseType: 'multiple_choice', // Grammar uses simpler format
        })
      }

      // Shuffle exercises
      const shuffled = mixed.sort(() => Math.random() - 0.5)
      setExercises(shuffled)
    } catch (error) {
      console.error('Failed to load exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResult = useCallback(async (correct: boolean) => {
    setLastCorrect(correct)
    setShowResult(true)

    const current = exercises[currentIndex]
    const isGrammarCorrect = correct && current.source === 'grammar'

    setStats((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
      grammarCorrect: s.grammarCorrect + (isGrammarCorrect ? 1 : 0),
    }))

    // Schedule based on result
    if (current.source === 'vocabulary' && current.vocabProgress) {
      await scheduleVocabularyCardAuto(current.vocabProgress.id, correct)
    }
    // Grammar scheduling would go here

    // Auto-advance after delay
    setTimeout(() => {
      setShowResult(false)
      if (currentIndex >= exercises.length - 1) {
        // Session complete — update language stats
        const finalStats = {
          correct: stats.correct + (correct ? 1 : 0),
          total: stats.total + 1,
          grammarCorrect: stats.grammarCorrect + (isGrammarCorrect ? 1 : 0),
        }
        incrementLanguageStats({
          exercisesSolved: finalStats.total,
          ...(finalStats.grammarCorrect > 0 && { grammarTopicsCompleted: finalStats.grammarCorrect }),
        })
        setSessionComplete(true)
      } else {
        setCurrentIndex((i) => i + 1)
      }
    }, 1200)
  }, [currentIndex, exercises, stats, incrementLanguageStats])

  const handleBack = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Загрузка упражнений...</p>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 space-y-4">
          <div className="text-5xl">✨</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Всё выполнено!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Нет упражнений для повторения. Изучите новые слова или грамматику.
          </p>
          <Button onClick={handleBack}>
            На главную
          </Button>
        </div>
      </Card>
    )
  }

  if (sessionComplete) {
    const accuracy = Math.round((stats.correct / stats.total) * 100)
    return (
      <Card>
        <div className="text-center py-8 space-y-6">
          <div className="text-6xl">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Сессия завершена!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              {stats.correct}/{stats.total} правильно ({accuracy}%)
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              На главную
            </Button>
            <Button onClick={loadExercises} className="flex-1">
              Ещё раз
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const current = exercises[currentIndex]

  // For vocabulary exercises, use ExerciseCard
  if (current.source === 'vocabulary' && current.vocabCard) {
    return (
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{currentIndex + 1} / {exercises.length}</span>
          <span>{stats.correct}/{stats.total} правильно</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>

        {!showResult ? (
          <ExerciseCard
            key={`${current.vocabProgress?.id}-${currentIndex}`}
            card={current.vocabCard}
            exerciseType={current.exerciseType}
            onResult={handleResult}
          />
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className={`text-2xl font-bold ${lastCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {lastCorrect ? '✓ Правильно!' : '✗ Неправильно'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Следующее упражнение...
              </p>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // For grammar exercises, show simplified format
  if (current.source === 'grammar' && current.grammarCard) {
    return (
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{currentIndex + 1} / {exercises.length}</span>
          <span>{stats.correct}/{stats.total} правильно</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>

        <Card>
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full mb-2">
                Грамматика
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {current.grammarCard.topic}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {current.grammarCard.explanation.slice(0, 150)}...
              </p>
            </div>

            {/* Simple yes/no for now */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => handleResult(false)}
                className="flex-1"
              >
                Не помню
              </Button>
              <Button
                onClick={() => handleResult(true)}
                className="flex-1"
              >
                Помню!
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return null
}
