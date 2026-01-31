import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useTeacherContext } from '@/store/teacherChatStore'
import { getAllCards, saveCard } from '@/db'
import {
  getGrammarTopicById,
  getAllGrammarTopics,
  createCardFromStatic,
} from '@/modules/GrammarEngine'
import { enhanceCardExplanation } from '@/modules/AIService'
import { speakWithPauses } from '@/modules/SpeechService'
import type { GrammarCard, GrammarTopic, FrenchLevel } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const LEVEL_ORDER: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function TopicDetail() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { user } = useAppStore()

  const [card, setCard] = useState<GrammarCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState('')

  const topic = topicId
    ? (getGrammarTopicById(topicId) as GrammarTopic | undefined)
    : undefined

  // Set teacher chat context with topic information
  useTeacherContext({
    screen: 'grammar',
    itemId: topicId,
    itemPreview: topic?.titleRu || topic?.title,
  })

  // Get all topics at user's level for "next rule" feature
  const availableTopics = useMemo(() => {
    if (!user) return []
    const allTopics = getAllGrammarTopics() as GrammarTopic[]
    const userLevelIndex = LEVEL_ORDER.indexOf(user.frenchLevel)
    const allowedLevels = LEVEL_ORDER.slice(0, userLevelIndex + 1)
    return allTopics.filter((t) =>
      allowedLevels.includes(t.level as FrenchLevel)
    )
  }, [user])

  useEffect(() => {
    loadCard()
  }, [topicId, user])

  const loadCard = async () => {
    if (!user || !topicId || !topic) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const allCards = await getAllCards(user.id)
      let foundCard = allCards.find((c) => c.topicId === topicId)

      // If no card exists, create one from static data
      if (!foundCard && topic) {
        foundCard = await createCardFromStatic(user.id, topic)
      }

      setCard(foundCard || null)
    } catch (err) {
      console.error('Error loading card:', err)
      setError('Не удалось загрузить данные.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnhance = async () => {
    if (!card || !topic) return

    setIsEnhancing(true)
    setError('')

    try {
      const enhanced = await enhanceCardExplanation(
        topic.title,
        topic.level,
        card.explanation,
        card.commonMistakes
      )

      const updatedCard: GrammarCard = {
        ...card,
        enhancedExplanation: enhanced,
        isEnhanced: true,
      }

      await saveCard(updatedCard)
      setCard(updatedCard)
    } catch (err) {
      console.error('Enhancement error:', err)
      setError('Не удалось расширить объяснение. Попробуйте позже.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleSpeak = (text: string) => {
    if (user) {
      speakWithPauses(text, user.speechSettings)
    }
  }

  const handleNextRule = () => {
    if (availableTopics.length <= 1) return

    // Filter out current topic and pick a random one
    const otherTopics = availableTopics.filter((t) => t.id !== topicId)
    const randomIndex = Math.floor(Math.random() * otherTopics.length)
    const nextTopic = otherTopics[randomIndex]

    navigate(`/grammar/${nextTopic.id}`)
  }

  const handlePractice = () => {
    if (card) {
      navigate(`/practice/${card.id}`)
    }
  }

  if (!topic) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <span className="text-5xl block mb-4">?</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Тема не найдена
          </h2>
          <Button onClick={() => navigate('/grammar')}>
            Вернуться к списку
          </Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <div className="animate-pulse text-4xl mb-4">...</div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </Card>
      </div>
    )
  }

  // Display from static topic data if card is not available
  const explanation = card?.explanation || topic.content?.rule || ''
  const examples = card?.examples || topic.content?.examples.map((e) => ({
    french: e.fr,
    russian: e.ru,
  })) || []
  const commonMistakes = card?.commonMistakes || topic.content?.commonMistakes || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/grammar')}>
          &larr; Назад
        </Button>
        <div className="flex-1">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded mb-1">
            {topic.level}
          </span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {topic.titleRu}
          </h1>
        </div>
      </div>

      {/* French title */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {topic.title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSpeak(topic.title)}
            aria-label="Listen to pronunciation"
          >
            <span role="img" aria-hidden="true">
              &#x1F50A;
            </span>
          </Button>
        </div>
      </Card>

      {/* Rule explanation */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Правило
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{explanation}</p>

        {/* Enhanced explanation */}
        {card?.isEnhanced && card.enhancedExplanation && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
              Расширенное объяснение:
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              {card.enhancedExplanation}
            </p>
          </div>
        )}

        {/* Enhance button */}
        {card && !card.isEnhanced && (
          <Button
            variant="secondary"
            className="mt-4"
            onClick={handleEnhance}
            disabled={isEnhancing}
          >
            {isEnhancing ? 'Расширяем...' : 'Расширить с помощью AI'}
          </Button>
        )}

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </Card>

      {/* Examples */}
      {examples.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Примеры
          </h3>
          <div className="space-y-3">
            {examples.map((ex, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {ex.french}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeak(ex.french)}
                    aria-label="Listen to example"
                  >
                    <span role="img" aria-hidden="true">
                      &#x1F50A;
                    </span>
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {ex.russian}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Common mistakes */}
      {commonMistakes.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Частые ошибки
          </h3>
          <ul className="space-y-2">
            {commonMistakes.map((mistake, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
              >
                <span className="text-amber-500 flex-shrink-0">!</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex-1" onClick={handlePractice} disabled={!card}>
          Практика
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={handleNextRule}
          disabled={availableTopics.length <= 1}
        >
          Следующее правило
        </Button>
      </div>
    </div>
  )
}
