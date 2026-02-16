import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { getCardsDueToday, getAllCards } from '@/db'
import { scheduleCard, getQualityLabel, formatInterval } from '@/modules/SRSEngine'
import { ensureCardsForLevel, getGrammarTopicById } from '@/modules/GrammarEngine'
import type { GrammarCard, GrammarTopic, SRSQuality, FrenchLevel } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import {
  BookOpen,
  CheckCircle,
  Trophy,
  Sparkles,
} from 'lucide-react'

const LEVELS: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function ReviewScreen() {
  const navigate = useNavigate()
  const { user, profile, progress, updateProgress, currentLanguage } = useAuthContext()

  const [cards, setCards] = useState<GrammarCard[]>([])
  const [allCards, setAllCards] = useState<GrammarCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, avgQuality: 0 })
  const [isComplete, setIsComplete] = useState(false)
  const [viewMode, setViewMode] = useState<'review' | 'browse'>('browse')

  useEffect(() => {
    loadCards()
  }, [user, profile])

  const loadCards = async () => {
    if (!user || !profile) return

    // Ensure cards exist for user's level
    const frenchLevel = profile.french_level || 'A1'
    await ensureCardsForLevel(user.id, frenchLevel, currentLanguage)

    const dueCards = await getCardsDueToday(user.id)
    const all = await getAllCards(user.id)
    setCards(dueCards)
    setAllCards(all)

    // If there are due cards, show review mode
    if (dueCards.length > 0) {
      setViewMode('review')
    }
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
          grammar_cards_mastered: progress.grammar_cards_mastered + 1,
        })
      }
    }
  }

  // Group cards by level
  const cardsByLevel = LEVELS.reduce((acc, level) => {
    acc[level] = allCards.filter((c) => c.level === level)
    return acc
  }, {} as Record<FrenchLevel, GrammarCard[]>)

  // Get levels up to user's level
  const userLevelIndex = LEVELS.indexOf(profile?.french_level || 'A1')
  const visibleLevels = LEVELS.slice(0, userLevelIndex + 1)

  // Browse mode - show all cards by level
  if (viewMode === 'browse') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">
            Грамматика
          </h1>
          {cards.length > 0 && (
            <Button onClick={() => setViewMode('review')}>
              Повторить ({cards.length})
            </Button>
          )}
        </div>

        {cards.length > 0 && (
          <Card className="bg-accent-subtle border-accent/20">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-accent flex-shrink-0" />
              <div>
                <p className="font-medium text-text-primary">
                  {cards.length} {cards.length === 1 ? 'карточка' : 'карточек'} для повторения
                </p>
                <p className="text-sm text-text-secondary">
                  Нажмите "Повторить" чтобы начать
                </p>
              </div>
            </div>
          </Card>
        )}

        {visibleLevels.map((level) => {
          const levelCards = cardsByLevel[level]
          if (levelCards.length === 0) return null

          return (
            <div key={level}>
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-accent-subtle text-accent rounded">
                  {level}
                </span>
                <span>{levelCards.length} тем</span>
              </h3>
              <div className="space-y-2">
                {levelCards.map((card) => {
                  const isDue = new Date(card.nextReview) <= new Date()
                  return (
                    <Card key={card.id} variant="outlined" padding="sm">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/review/${card.topicId}`}
                            className="font-medium text-text-primary hover:text-accent transition-colors"
                          >
                            {card.topic}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {isDue ? (
                              <span className="text-xs text-warm">
                                Пора повторить
                              </span>
                            ) : (
                              <span className="text-xs text-text-muted">
                                Через {formatInterval(card.interval)}
                              </span>
                            )}
                            {card.isEnhanced && (
                              <span className="text-xs text-success inline-flex items-center gap-1">
                                <Sparkles size={12} /> Расширено
                              </span>
                            )}
                          </div>
                        </div>
                        <Link to={`/practice/${card.id}`}>
                          <Button size="sm" variant="ghost">
                            Практика
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        {allCards.length === 0 && (
          <Card className="text-center py-8">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Нет карточек
            </h2>
            <p className="text-text-secondary">
              Карточки создаются автоматически при регистрации.
            </p>
          </Card>
        )}
      </div>
    )
  }

  // Session complete
  if (isComplete) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Сессия завершена!
          </h2>
          <div className="text-text-secondary mb-6">
            <p>Повторено карточек: {sessionStats.reviewed}</p>
            <p>Средняя оценка: {sessionStats.avgQuality.toFixed(1)} / 5</p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => {
              setViewMode('browse')
              setIsComplete(false)
              setCurrentIndex(0)
              setSessionStats({ reviewed: 0, avgQuality: 0 })
              loadCards()
            }}>
              К списку
            </Button>
            <Button onClick={() => navigate('/topics')}>
              Начать разговор
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // No cards due
  if (cards.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <Trophy className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Нет карточек для повторения!
          </h2>
          <p className="text-text-secondary mb-4">
            Вы всё повторили. Отличная работа!
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setViewMode('browse')}>
              Смотреть все
            </Button>
            <Button onClick={() => navigate('/topics')}>
              Начать разговор
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Review in progress
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setViewMode('browse')}>
          &larr; Назад
        </Button>
        <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-text-muted">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Card */}
      <Card className="min-h-[300px] flex flex-col">
        {/* Front */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-accent-subtle text-accent rounded-full mb-4">
              {currentCard.level}
            </span>
            <h2 className="text-2xl font-bold text-text-primary">
              {currentCard.topic}
            </h2>
          </div>
        </div>

        {/* Back (answer) */}
        {showAnswer && (() => {
          const staticTopic = getGrammarTopicById(currentCard.topicId, currentLanguage) as GrammarTopic | undefined
          const formation = staticTopic?.content?.formation
          return (
            <div className="border-t border-border-subtle pt-4 mt-4">
              <p className="text-text-secondary mb-4">
                {currentCard.explanation}
              </p>

              {/* Formation (brief) */}
              {formation && (
                <div className="bg-surface-2 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-text-muted mb-1">
                    Образование:
                  </p>
                  <code className="text-sm font-mono text-text-primary">
                    {formation.formula}
                  </code>
                </div>
              )}

              {currentCard.examples.length > 0 && (
                <div className="space-y-2 mb-4">
                  {currentCard.examples.slice(0, 3).map((ex, i) => (
                    <div key={i} className="bg-surface-2 p-3 rounded-lg">
                      <p className="font-medium text-text-primary">
                        {ex.french}
                      </p>
                      <p className="text-sm text-text-muted">
                        {ex.russian}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {currentCard.commonMistakes.length > 0 && (
                <div className="bg-error-subtle p-3 rounded-lg">
                  <p className="text-sm font-medium text-error mb-1">
                    Частые ошибки:
                  </p>
                  <ul className="text-sm text-text-secondary list-disc list-inside">
                    {currentCard.commonMistakes.map((mistake, i) => (
                      <li key={i}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })()}
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
