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
      <p className="text-sm text-white/50 text-center">
        {exercise.instruction}
      </p>

      <div className="flex gap-4">
        {/* Left column */}
        <div className="flex-1 space-y-2">
          {exercise.pairs.map((pair) => {
            const isMatched = matchedLeftSet.has(pair.left)
            const isSelected = selectedLeft === pair.left
            const isError = errorPair?.left === pair.left

            let style = 'border-white/[0.10] bg-white/[0.06]'
            if (isMatched) {
              style = 'border-success-500 bg-success-500/15 text-success-500 opacity-60'
            } else if (isError) {
              style = 'border-danger-400 bg-danger-500/10'
            } else if (isSelected) {
              style = 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-300'
            }

            return (
              <button
                key={pair.left}
                onClick={() => handleLeftClick(pair.left)}
                disabled={isMatched}
                className={`w-full px-3 py-2.5 border-2 rounded-lg text-center transition-all text-white/90 text-sm font-medium ${style}`}
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

            let style = 'border-white/[0.10] bg-white/[0.06]'
            if (isMatched) {
              style = 'border-success-500 bg-success-500/15 text-success-500 opacity-60'
            } else if (isError) {
              style = 'border-danger-400 bg-danger-500/10'
            } else if (selectedLeft) {
              style = 'border-white/[0.10] bg-white/[0.06] hover:border-primary-400'
            }

            return (
              <button
                key={right}
                onClick={() => handleRightClick(right)}
                disabled={isMatched || !selectedLeft}
                className={`w-full px-3 py-2.5 border-2 rounded-lg text-center transition-all text-white/90 text-sm font-medium ${style}`}
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
            ? 'bg-success-500/10 text-success-500'
            : 'bg-warning-500/10 text-warning-400'
        }`}>
          {exercise.explanation}
        </div>
      )}
    </div>
  )
}
