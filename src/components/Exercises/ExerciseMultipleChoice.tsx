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
    // Delay to show feedback
    setTimeout(() => onResult(correct), 1500)
  }

  return (
    <div className="space-y-4">
      <p className="text-lg text-white/90 font-medium text-center">
        {exercise.question}
      </p>

      <div className="space-y-2">
        {exercise.options.map((option) => {
          let style = 'border-white/[0.10] bg-white/[0.06] hover:border-primary-400'

          if (answered) {
            if (option === exercise.correctAnswer) {
              style = 'border-success-500 bg-success-500/15 text-success-500'
            } else if (option === selected) {
              style = 'border-danger-400 bg-danger-500/10 text-danger-400'
            } else {
              style = 'border-white/[0.08] bg-white/[0.03] opacity-50'
            }
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors text-white/90 ${style}`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className={`p-3 rounded-lg text-sm ${
          selected === exercise.correctAnswer
            ? 'bg-success-500/10 text-success-500'
            : 'bg-danger-500/10 text-danger-400'
        }`}>
          {exercise.explanation}
        </div>
      )}
    </div>
  )
}
