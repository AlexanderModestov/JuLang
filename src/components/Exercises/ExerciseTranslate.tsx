import { useState, useRef, useEffect } from 'react'
import type { ExerciseTranslate as ExerciseTRType } from '@/types'
import { checkAnswer } from '@/modules/ExercisesEngine'
import Button from '@/components/ui/Button'

interface Props {
  exercise: ExerciseTRType
  onResult: (correct: boolean) => void
}

export default function ExerciseTranslate({ exercise, onResult }: Props) {
  const [userAnswer, setUserAnswer] = useState('')
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCheck = () => {
    if (!userAnswer.trim() || answered) return
    const isCorrect = checkAnswer(exercise, userAnswer)
    setCorrect(isCorrect)
    setAnswered(true)
    setTimeout(() => onResult(isCorrect), 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck()
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full mb-2">
          Переведите
        </span>
        <p className="text-lg text-gray-900 dark:text-white font-medium">
          {exercise.question}
        </p>
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={answered}
          placeholder="Введите перевод..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`flex-1 px-4 py-2 border-2 rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            ${answered
              ? correct
                ? 'border-green-500'
                : 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
            }`}
        />
        {!answered && (
          <Button onClick={handleCheck} disabled={!userAnswer.trim()}>
            Проверить
          </Button>
        )}
      </div>

      {answered && (
        <div className={`p-3 rounded-lg text-sm ${
          correct
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {!correct && (
            <p className="font-medium mb-1">
              Правильный ответ: {exercise.correctAnswer}
            </p>
          )}
          {exercise.explanation}
        </div>
      )}
    </div>
  )
}
