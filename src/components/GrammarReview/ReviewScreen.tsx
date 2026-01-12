import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { getCardsDueToday, getAllCards } from '@/db'
import { scheduleCard, getQualityLabel, formatInterval } from '@/modules/SRSEngine'
import type { GrammarCard, SRSQuality } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function ReviewScreen() {
  const navigate = useNavigate()
  const { user, updateProgress, progress } = useAppStore()

  const [cards, setCards] = useState<GrammarCard[]>([])
  const [allCards, setAllCards] = useState<GrammarCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, avgQuality: 0 })
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    loadCards()
  }, [user])

  const loadCards = async () => {
    if (!user) return
    const dueCards = await getCardsDueToday(user.id)
    const all = await getAllCards(user.id)
    setCards(dueCards)
    setAllCards(all)
  }

  const currentCard = cards[currentIndex]

  const handleRate = async (quality: SRSQuality) => {
    if (!currentCard) return

    await scheduleCard(currentCard.id, quality)

    // Update session stats
    const newReviewed = sessionStats.reviewed + 1
    const newAvg =
      (sessionStats.avgQuality * sessionStats.reviewed + quality) / newReviewed
    setSessionStats({ reviewed: newReviewed, avgQuality: newAvg })

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setShowAnswer(false)
    } else {
      // Session complete
      setIsComplete(true)
      if (progress) {
        updateProgress({
          grammarCardsMastered: progress.grammarCardsMastered + 1,
        })
      }
    }
  }

  // No cards due
  if (cards.length === 0 && !isComplete) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Повторение грамматики
        </h1>

        <Card className="text-center py-8">
          <span className="text-5xl block mb-4">🎉</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет карточек на сегодня!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Вы всё повторили. Отличная работа!
          </p>
          <Button onClick={() => navigate('/topics')}>
            Начать разговор
          </Button>
        </Card>

        {/* All cards list */}
        {allCards.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Ваши карточки ({allCards.length})
            </h3>
            <div className="space-y-2">
              {allCards.map((card) => (
                <Card key={card.id} variant="outlined" padding="sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {card.topic}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Следующее повторение: {formatInterval(card.interval)}
                      </p>
                    </div>
                    <Link to={`/practice/${card.id}`}>
                      <Button size="sm" variant="ghost">
                        Практика
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Session complete
  if (isComplete) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <span className="text-5xl block mb-4">✅</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Сессия завершена!
          </h2>
          <div className="text-gray-600 dark:text-gray-400 mb-6">
            <p>Повторено карточек: {sessionStats.reviewed}</p>
            <p>Средняя оценка: {sessionStats.avgQuality.toFixed(1)} / 5</p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/')}>
              На главную
            </Button>
            <Button onClick={() => {
              setIsComplete(false)
              setCurrentIndex(0)
              setSessionStats({ reviewed: 0, avgQuality: 0 })
              loadCards()
            }}>
              Ещё раз
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Review in progress
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Card */}
      <Card className="min-h-[300px] flex flex-col">
        {/* Front */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full mb-4">
              {currentCard.level}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentCard.topic}
            </h2>
          </div>
        </div>

        {/* Back (answer) */}
        {showAnswer && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {currentCard.explanation}
            </p>
            {currentCard.examples.length > 0 && (
              <div className="space-y-2">
                {currentCard.examples.map((ex, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {ex.french}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ex.russian}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Actions */}
      {!showAnswer ? (
        <div className="flex justify-center gap-4">
          <Button onClick={() => setShowAnswer(true)} size="lg">
            Показать ответ
          </Button>
          <Link to={`/practice/${currentCard.id}`}>
            <Button variant="secondary" size="lg">
              Практика
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {([0, 2, 3, 5] as SRSQuality[]).map((q) => {
            const { label } = getQualityLabel(q)
            return (
              <Button
                key={q}
                onClick={() => handleRate(q)}
                variant={q < 3 ? 'danger' : q < 4 ? 'secondary' : 'primary'}
                className="flex-col py-3"
              >
                <span className="text-lg">{label}</span>
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
