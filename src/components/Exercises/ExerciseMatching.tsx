import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ExerciseMatching as ExerciseMAType } from '@/types'

interface Props {
  exercise: ExerciseMAType
  onResult: (correct: boolean) => void
}

interface MatchedPair {
  left: string
  right: string
}

export default function ExerciseMatching({ exercise, onResult }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<MatchedPair[]>([])
  const [errorPair, setErrorPair] = useState<{ left: string; right: string } | null>(null)
  const [hadError, setHadError] = useState(false)

  // Shuffle right side once on mount
  const shuffledRight = useMemo(() => {
    const rights = exercise.pairs.map((p) => p.right)
    for (let i = rights.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[rights[i], rights[j]] = [rights[j], rights[i]]
    }
    return rights
  }, [exercise.id])

  const matchedLeftSet = useMemo(
    () => new Set(matched.map((m) => m.left)),
    [matched]
  )
  const matchedRightSet = useMemo(
    () => new Set(matched.map((m) => m.right)),
    [matched]
  )

  // Check if all pairs are matched
  useEffect(() => {
    if (matched.length === exercise.pairs.length) {
      setTimeout(() => onResult(!hadError), 1000)
    }
  }, [matched, exercise.pairs.length, hadError, onResult])

  const handleLeftClick = useCallback((left: string) => {
    if (matchedLeftSet.has(left)) return
    setSelectedLeft((prev) => (prev === left ? null : left))
  }, [matchedLeftSet])

  const handleRightClick = useCallback((right: string) => {
    if (matchedRightSet.has(right) || !selectedLeft) return

    // Check if pair is correct
    const isCorrect = exercise.pairs.some(
      (p) => p.left === selectedLeft && p.right === right
    )

    if (isCorrect) {
      setMatched((prev) => [...prev, { left: selectedLeft, right }])
      setSelectedLeft(null)
    } else {
      setHadError(true)
      setErrorPair({ left: selectedLeft, right })
      setTimeout(() => {
        setErrorPair(null)
        setSelectedLeft(null)
      }, 600)
    }
  }, [selectedLeft, matchedRightSet, exercise.pairs])

  const allMatched = matched.length === exercise.pairs.length

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {exercise.instruction}
      </p>

      <div className="flex gap-4">
        {/* Left column */}
        <div className="flex-1 space-y-2">
          {exercise.pairs.map((pair) => {
            const isMatched = matchedLeftSet.has(pair.left)
            const isSelected = selectedLeft === pair.left
            const isError = errorPair?.left === pair.left

            let style = 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
            if (isMatched) {
              style = 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 opacity-60'
            } else if (isError) {
              style = 'border-red-500 bg-red-50 dark:bg-red-900/30'
            } else if (isSelected) {
              style = 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-300'
            }

            return (
              <button
                key={pair.left}
                onClick={() => handleLeftClick(pair.left)}
                disabled={isMatched}
                className={`w-full px-3 py-2.5 border-2 rounded-lg text-center transition-all text-gray-900 dark:text-white text-sm font-medium ${style}`}
              >
                {pair.left}
              </button>
            )
          })}
        </div>

        {/* Right column */}
        <div className="flex-1 space-y-2">
          {shuffledRight.map((right) => {
            const isMatched = matchedRightSet.has(right)
            const isError = errorPair?.right === right

            let style = 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
            if (isMatched) {
              style = 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 opacity-60'
            } else if (isError) {
              style = 'border-red-500 bg-red-50 dark:bg-red-900/30'
            } else if (selectedLeft) {
              style = 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500'
            }

            return (
              <button
                key={right}
                onClick={() => handleRightClick(right)}
                disabled={isMatched || !selectedLeft}
                className={`w-full px-3 py-2.5 border-2 rounded-lg text-center transition-all text-gray-900 dark:text-white text-sm font-medium ${style}`}
              >
                {right}
              </button>
            )
          })}
        </div>
      </div>

      {allMatched && (
        <div className={`p-3 rounded-lg text-sm ${
          !hadError
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
        }`}>
          {exercise.explanation}
        </div>
      )}
    </div>
  )
}
