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
import { Sparkles, Trophy, ThumbsUp, Dumbbell, X, Check } from 'lucide-react'

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

    await saveResult(user.id, current, correct)

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
        <p className="text-text-muted">Загрузка упражнений...</p>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 space-y-4">
          <Sparkles className="w-12 h-12 text-accent mx-auto" />
          <h2 className="text-xl font-bold text-text-primary">
            Все выполнено!
          </h2>
          <p className="text-text-secondary">
            Нет доступных упражнений по выбранным темам.
          </p>
          <Button onClick={handleExit}>Назад</Button>
        </div>
      </Card>
    )
  }

  if (sessionComplete) {
    const accuracy = Math.round((stats.correct / stats.total) * 100)
    const ResultIcon = accuracy >= 80 ? Trophy : accuracy >= 60 ? ThumbsUp : Dumbbell
    return (
      <Card>
        <div className="text-center py-8 space-y-6">
          <ResultIcon className="w-14 h-14 text-accent mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Сессия завершена!
            </h2>
            <p className="text-lg text-text-secondary mt-2">
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
      <div className="flex items-center justify-between">
        <button
          onClick={handleExit}
          className="text-text-muted hover:text-text-primary text-sm inline-flex items-center gap-1 transition-colors"
        >
          <X size={14} /> Выйти
        </button>
        <span className="text-sm text-text-muted">
          {currentIndex + 1}/{exercises.length}
        </span>
        <span className="text-sm text-text-muted inline-flex items-center gap-1">
          {stats.correct}/{stats.total} <Check size={14} />
        </span>
      </div>

      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
        />
      </div>

      <div className="flex justify-center">
        <span className="inline-block px-2 py-1 text-xs rounded-full bg-accent-subtle text-accent">
          {current.type === 'multiple_choice' && 'Выбор варианта'}
          {current.type === 'fill_blank' && 'Заполни пропуск'}
          {current.type === 'translate' && 'Перевод'}
          {current.type === 'matching' && 'Сопоставление'}
        </span>
      </div>

      <Card>
        <div className="py-2">
          {current.type === 'multiple_choice' && (
            <ExerciseMultipleChoice key={current.id} exercise={current} onResult={handleResult} />
          )}
          {current.type === 'fill_blank' && (
            <ExerciseFillBlank key={current.id} exercise={current} onResult={handleResult} />
          )}
          {current.type === 'translate' && (
            <ExerciseTranslate key={current.id} exercise={current} onResult={handleResult} />
          )}
          {current.type === 'matching' && (
            <ExerciseMatching key={current.id} exercise={current} onResult={handleResult} />
          )}
        </div>
      </Card>
    </div>
  )
}
