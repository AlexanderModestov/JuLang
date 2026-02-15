import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import type { Exercise, FrenchLevel } from '@/types'
import { buildSession, saveResult } from '@/modules/ExercisesEngine'
import ExerciseMultipleChoice from './ExerciseMultipleChoice'
import ExerciseFillBlank from './ExerciseFillBlank'
import ExerciseTranslate from './ExerciseTranslate'
import ExerciseMatching from './ExerciseMatching'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function ExerciseSession() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile, currentLanguage } = useAuthContext()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)

  const level = (searchParams.get('level') || profile?.french_level || 'A1') as FrenchLevel
  const topicIds = searchParams.get('topics')?.split(',').filter(Boolean)

  useEffect(() => {
    loadSession()
  }, [user, currentLanguage])

  const loadSession = async () => {
    if (!user) return
    setLoading(true)
    setCurrentIndex(0)
    setStats({ correct: 0, total: 0 })
    setSessionComplete(false)

    try {
      const session = await buildSession(user.id, currentLanguage, level, topicIds)
      setExercises(session)
    } catch (error) {
      console.error('Failed to build session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResult = useCallback(async (correct: boolean) => {
    if (!user) return

    const current = exercises[currentIndex]
    setStats((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }))

    // Save result
    await saveResult(user.id, current, correct)

    // Advance to next or complete
    if (currentIndex >= exercises.length - 1) {
      setSessionComplete(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, exercises, user])

  const handleExit = () => {
    navigate('/exercises')
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
            Нет доступных упражнений по выбранным темам.
          </p>
          <Button onClick={handleExit}>Назад</Button>
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
            <Button variant="secondary" onClick={handleExit} className="flex-1">
              На главную
            </Button>
            <Button onClick={loadSession} className="flex-1">
              Ещё раз
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const current = exercises[currentIndex]

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleExit}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
        >
          ✕ Выйти
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentIndex + 1}/{exercises.length}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {stats.correct}/{stats.total} ✓
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise type badge */}
      <div className="flex justify-center">
        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
          current.type === 'multiple_choice'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            : current.type === 'fill_blank'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : current.type === 'translate'
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
        }`}>
          {current.type === 'multiple_choice' && 'Выбор варианта'}
          {current.type === 'fill_blank' && 'Заполни пропуск'}
          {current.type === 'translate' && 'Перевод'}
          {current.type === 'matching' && 'Сопоставление'}
        </span>
      </div>

      {/* Exercise content */}
      <Card>
        <div className="py-2">
          {current.type === 'multiple_choice' && (
            <ExerciseMultipleChoice
              key={current.id}
              exercise={current}
              onResult={handleResult}
            />
          )}
          {current.type === 'fill_blank' && (
            <ExerciseFillBlank
              key={current.id}
              exercise={current}
              onResult={handleResult}
            />
          )}
          {current.type === 'translate' && (
            <ExerciseTranslate
              key={current.id}
              exercise={current}
              onResult={handleResult}
            />
          )}
          {current.type === 'matching' && (
            <ExerciseMatching
              key={current.id}
              exercise={current}
              onResult={handleResult}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
