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
      <p className="text-lg text-gray-900 dark:text-white font-medium text-center">
        {exercise.question}
      </p>

      <div className="space-y-2">
        {exercise.options.map((option) => {
          let style = 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500'

          if (answered) {
            if (option === exercise.correctAnswer) {
              style = 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            } else if (option === selected) {
              style = 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            } else {
              style = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50'
            }
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors text-gray-900 dark:text-white ${style}`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className={`p-3 rounded-lg text-sm ${
          selected === exercise.correctAnswer
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {exercise.explanation}
        </div>
      )}
    </div>
  )
}
