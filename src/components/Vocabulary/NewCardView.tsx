import { useState, useCallback } from 'react'
import type { VocabularyCard, VocabularyProgress } from '@/types'
import { useSpeech } from '@/hooks/useSpeech'
import {
  getWordWithArticle,
  getCardWord,
  getExampleText,
  generateMiniSessionExercises,
  calculateMiniSessionResult,
  scheduleVocabularyCardAuto,
  type MiniSessionExercise,
  type MiniSessionResult,
} from '@/modules/VocabularyEngine'
import ExerciseCard from './ExerciseCard'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface NewCardViewProps {
  cards: VocabularyCard[]
  onCardLearned: (cardId: string) => Promise<VocabularyProgress | undefined> | void
  onComplete: () => void
}

type ViewMode = 'learning' | 'mini-session' | 'result'

export default function NewCardView({ cards, onCardLearned, onComplete }: NewCardViewProps) {
  const { speak } = useSpeech()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [learnedCards, setLearnedCards] = useState<VocabularyCard[]>([])

  // Progress IDs for mini-session SRS updates
  const [progressMap, setProgressMap] = useState<Map<string, string>>(new Map())

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
          <p className="text-white/50">
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

  const handleNext = async () => {
    const progress = await onCardLearned(card.id)
    if (progress) {
      setProgressMap((prev) => new Map(prev).set(card.id, progress.id))
    }
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

  const handleMiniExerciseResult = useCallback(async (correct: boolean) => {
    const newResults = [...miniResults, correct]
    setMiniResults(newResults)

    // Update SRS for this exercise's card
    const exerciseCard = miniExercises[miniExerciseIndex]?.card
    if (exerciseCard) {
      const progressId = progressMap.get(exerciseCard.id)
      if (progressId) {
        try {
          await scheduleVocabularyCardAuto(progressId, correct)
        } catch (err) {
          console.error('Failed to schedule vocabulary card:', err)
        }
      }
    }

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
  }, [miniResults, miniExerciseIndex, miniExercises, learnedCards.length, progressMap])

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
            <h2 className="text-2xl font-bold text-white/90">
              {sessionResult.wordsLearned} новых слов изучено!
            </h2>
            <p className="text-lg text-white/50 mt-2">
              {sessionResult.correctCount}/{sessionResult.totalExercises} правильно ({sessionResult.accuracy}%)
            </p>
          </div>

          {/* Show learned words */}
          <div className="bg-white/[0.03] rounded-xl p-4">
            <p className="text-sm text-white/40 mb-2">Изученные слова:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {learnedCards.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1 bg-white/[0.05] rounded-full text-sm text-white/70 border border-white/[0.08]"
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
        <div className="flex items-center justify-between text-sm text-white/40">
          <span>Закрепление: {miniExerciseIndex + 1} / {miniExercises.length}</span>
          <span>{miniResults.filter(Boolean).length} правильно</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
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
      <p className="text-sm text-white/40 text-center">
        {currentIndex + 1} / {cards.length}
      </p>

      <Card>
        <div className="text-center space-y-4 py-4">
          {/* French word with article */}
          <div>
            <button
              onClick={() => handleSpeak(getWordWithArticle(card))}
              className="text-3xl font-bold text-white/90 hover:text-primary-400 transition-colors"
            >
              {card.article && (
                <span className="text-primary-400">
                  {card.article}
                  {card.article !== "l'" && ' '}
                </span>
              )}
              {getCardWord(card)} 🔊
            </button>
          </div>

          {/* Flip to reveal */}
          {!flipped ? (
            <Button variant="secondary" onClick={() => setFlipped(true)}>
              Показать перевод
            </Button>
          ) : (
            <>
              <div className="border-t border-white/[0.08] pt-4">
                <p className="text-xl text-white/90">
                  {card.russian}
                </p>
              </div>

              {/* Examples */}
              {card.examples.length > 0 && (
                <div className="bg-white/[0.03] rounded-xl p-3 text-left space-y-2">
                  {card.examples.map((example, idx) => (
                    <div key={idx} className="border-l-2 border-primary-500 pl-2">
                      <button
                        onClick={() => handleSpeak(getExampleText(example))}
                        className="text-sm text-white/90 hover:text-primary-400"
                      >
                        🔊 {getExampleText(example)}
                      </button>
                      <p className="text-sm text-white/40">
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
