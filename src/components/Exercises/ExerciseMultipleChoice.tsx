import { useState } from 'react'
import type { ExerciseMultipleChoice as ExerciseMCType } from '@/types'

interface Props {
  exercise: ExerciseMCType
  onResult: (correct: boolean) => void
}

export default function ExerciseMultipleChoice({ exercise, onResult }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (option: string) => {
    if (answered) return
    setSelected(option)
    setAnswered(true)
    const correct = option === exercise.correctAnswer
    setTimeout(() => onResult(correct), 1500)
  }

  return (
    <div className="space-y-4">
      <p className="text-lg text-text-primary font-medium text-center">
        {exercise.question}
      </p>

      <div className="space-y-2">
        {exercise.options.map((option) => {
          let style = 'border-border bg-surface-1 hover:border-accent/50'

          if (answered) {
            if (option === exercise.correctAnswer) {
              style = 'border-success bg-success-subtle text-success'
            } else if (option === selected) {
              style = 'border-error bg-error-subtle text-error'
            } else {
              style = 'border-border-subtle bg-surface-2 opacity-50'
            }
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`w-full text-left px-4 py-3 border-2 rounded-xl transition-colors text-text-primary ${style}`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className={`p-3 rounded-lg text-sm ${
          selected === exercise.correctAnswer
            ? 'bg-success-subtle text-success'
            : 'bg-error-subtle text-error'
        }`}>
          {exercise.explanation}
        </div>
      )}
    </div>
  )
}
