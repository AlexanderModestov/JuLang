import { useState, useRef, useEffect } from 'react'
import type { ExerciseFillBlank as ExerciseFBType } from '@/types'
import { checkAnswer } from '@/modules/ExercisesEngine'
import Button from '@/components/ui/Button'

interface Props {
  exercise: ExerciseFBType
  onResult: (correct: boolean) => void
}

export default function ExerciseFillBlank({ exercise, onResult }: Props) {
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
      <p className="text-lg text-white/90 font-medium text-center">
        {exercise.question}
      </p>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={answered}
          placeholder="Введите ответ..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`flex-1 px-4 py-2 border-2 rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500
            bg-white/[0.06] text-white/90
            placeholder-white/30
            ${answered
              ? correct
                ? 'border-success-500'
                : 'border-danger-400'
              : 'border-white/[0.10]'
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
            ? 'bg-success-500/10 text-success-500'
            : 'bg-danger-500/10 text-danger-400'
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
