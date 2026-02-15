import { useState, useCallback } from 'react'
import type { VocabularyCard } from '@/types'
import { speak } from '@/modules/SpeechService'
import {
  getWordWithArticle,
  getCardWord,
  getExampleText,
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
          <p className="text-sm text-stone-500 dark:text-stone-400">
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
        <div className="text-center py-8 space-y-6 animate-fade-in-up">
          <div className="text-5xl opacity-80">&#127881;</div>
          <div>
            <h2 className="font-display text-display-sm font-semibold text-stone-900 dark:text-stone-50">
              {sessionResult.wordsLearned} новых слов изучено!
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2">
              {sessionResult.correctCount}/{sessionResult.totalExercises} правильно ({sessionResult.accuracy}%)
            </p>
          </div>

          {/* Show learned words */}
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">Изученные слова</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {learnedCards.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1 bg-white dark:bg-stone-900 rounded-full text-sm text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-800/60"
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
      <div className="space-y-4 animate-fade-in">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
          <span>Закрепление: {miniExerciseIndex + 1} / {miniExercises.length}</span>
          <span>{miniResults.filter(Boolean).length} правильно</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-500 transition-all duration-300"
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
    <div className="space-y-4 animate-fade-in">
      <p className="text-sm text-stone-400 dark:text-stone-500 text-center">
        {currentIndex + 1} / {cards.length}
      </p>

      <Card>
        <div className="text-center space-y-5 py-4">
          {/* French word with article */}
          <div>
            <button
              onClick={() => handleSpeak(getWordWithArticle(card))}
              className="font-display text-display-sm font-semibold text-stone-900 dark:text-stone-50 hover:text-accent-600 dark:hover:text-accent-400 transition-smooth"
            >
              {card.article && (
                <span className="text-accent-500 dark:text-accent-400">
                  {card.article}
                  {card.article !== "l'" && ' '}
                </span>
              )}
              {getCardWord(card)}
              <svg className="w-5 h-5 inline-block ml-2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </button>
          </div>

          {/* Flip to reveal */}
          {!flipped ? (
            <Button variant="secondary" onClick={() => setFlipped(true)}>
              Показать перевод
            </Button>
          ) : (
            <>
              <div className="border-t border-stone-200/60 dark:border-stone-800/60 pt-4 animate-fade-in">
                <p className="text-lg text-stone-700 dark:text-stone-300">
                  {card.russian}
                </p>
              </div>

              {/* Examples */}
              {card.examples.length > 0 && (
                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3 text-left space-y-2">
                  {card.examples.map((example, idx) => (
                    <div key={idx} className="border-l-2 border-accent-300 dark:border-accent-700 pl-2">
                      <button
                        onClick={() => handleSpeak(getExampleText(example))}
                        className="text-sm text-stone-800 dark:text-stone-200 hover:text-accent-600 dark:hover:text-accent-400 transition-smooth"
                      >
                        <svg className="w-3.5 h-3.5 inline-block mr-1 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                        {getExampleText(example)}
                      </button>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
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
