import { useState, useCallback } from 'react'
import type { VocabularyCard } from '@/types'
import { speak } from '@/modules/SpeechService'
import {
  getWordWithArticle,
  generateMiniSessionExercises,
  calculateMiniSessionResult,
  type MiniSessionExercise,
  type MiniSessionResult,
} from '@/modules/VocabularyEngine'
import ExerciseCard from './ExerciseCard'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface NewCardViewProps {
  cards: VocabularyCard[]
  onCardLearned: (cardId: string) => void
  onComplete: () => void
}

type ViewMode = 'learning' | 'mini-session' | 'result'

export default function NewCardView({ cards, onCardLearned, onComplete }: NewCardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [learnedCards, setLearnedCards] = useState<VocabularyCard[]>([])

  // Mini-session state
  const [viewMode, setViewMode] = useState<ViewMode>('learning')
  const [miniExercises, setMiniExercises] = useState<MiniSessionExercise[]>([])
  const [miniExerciseIndex, setMiniExerciseIndex] = useState(0)
  const [miniResults, setMiniResults] = useState<boolean[]>([])
  const [sessionResult, setSessionResult] = useState<MiniSessionResult | null>(null)

  if (cards.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Нет новых слов для изучения на вашем уровне.
          </p>
        </div>
      </Card>
    )
  }

  const card = cards[currentIndex]
  const isLastCard = currentIndex >= cards.length - 1

  const handleSpeak = (text: string) => {
    speak(text)
  }

  const handleNext = () => {
    onCardLearned(card.id)
    const newLearnedCards = [...learnedCards, card]
    setLearnedCards(newLearnedCards)

    if (isLastCard) {
      // All cards learned - start mini-session
      startMiniSession(newLearnedCards)
    } else {
      setCurrentIndex((i) => i + 1)
      setFlipped(false)
    }
  }

  const startMiniSession = (cardsToReinforce: VocabularyCard[]) => {
    const exercises = generateMiniSessionExercises(cardsToReinforce)
    setMiniExercises(exercises)
    setMiniExerciseIndex(0)
    setMiniResults([])
    setViewMode('mini-session')
  }

  const handleMiniExerciseResult = useCallback((correct: boolean) => {
    const newResults = [...miniResults, correct]
    setMiniResults(newResults)

    // Brief delay then advance
    setTimeout(() => {
      if (miniExerciseIndex >= miniExercises.length - 1) {
        // Mini-session complete
        const result = calculateMiniSessionResult(newResults, learnedCards.length)
        setSessionResult(result)
        setViewMode('result')
      } else {
        setMiniExerciseIndex((i) => i + 1)
      }
    }, 1000)
  }, [miniResults, miniExerciseIndex, miniExercises.length, learnedCards.length])

  const handleFinish = () => {
    onComplete()
  }

  // Mini-session result screen
  if (viewMode === 'result' && sessionResult) {
    return (
      <Card>
        <div className="text-center py-8 space-y-6">
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessionResult.wordsLearned} новых слов изучено!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              {sessionResult.correctCount}/{sessionResult.totalExercises} правильно ({sessionResult.accuracy}%)
            </p>
          </div>

          {/* Show learned words */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Изученные слова:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {learnedCards.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                >
                  {getWordWithArticle(c)}
                </span>
              ))}
            </div>
          </div>

          <Button onClick={handleFinish} size="lg" className="w-full">
            Готово
          </Button>
        </div>
      </Card>
    )
  }

  // Mini-session exercise
  if (viewMode === 'mini-session' && miniExercises.length > 0) {
    const currentExercise = miniExercises[miniExerciseIndex]

    return (
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Закрепление: {miniExerciseIndex + 1} / {miniExercises.length}</span>
          <span>{miniResults.filter(Boolean).length} правильно</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${((miniExerciseIndex + 1) / miniExercises.length) * 100}%` }}
          />
        </div>

        <ExerciseCard
          key={`mini-${miniExerciseIndex}`}
          card={currentExercise.card}
          exerciseType={currentExercise.exerciseType}
          onResult={handleMiniExerciseResult}
        />
      </div>
    )
  }

  // Learning mode - show new cards
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {currentIndex + 1} / {cards.length}
      </p>

      <Card>
        <div className="text-center space-y-4 py-4">
          {/* French word with article */}
          <div>
            <button
              onClick={() => handleSpeak(getWordWithArticle(card))}
              className="text-3xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {card.article && (
                <span className="text-primary-600 dark:text-primary-400">
                  {card.article}
                  {card.article !== "l'" && ' '}
                </span>
              )}
              {card.french} 🔊
            </button>
          </div>

          {/* Flip to reveal */}
          {!flipped ? (
            <Button variant="secondary" onClick={() => setFlipped(true)}>
              Показать перевод
            </Button>
          ) : (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xl text-gray-800 dark:text-gray-200">
                  {card.russian}
                </p>
              </div>

              {/* Examples */}
              {card.examples.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-left space-y-2">
                  {card.examples.map((example, idx) => (
                    <div key={idx} className="border-l-2 border-primary-300 dark:border-primary-600 pl-2">
                      <button
                        onClick={() => handleSpeak(example.fr)}
                        className="text-sm text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        🔊 {example.fr}
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {example.ru}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleNext} className="w-full">
                {isLastCard ? 'Закрепить слова' : 'Далее'}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
