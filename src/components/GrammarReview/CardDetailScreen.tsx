import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { getAllCards, saveCard } from '@/db'
import { getGrammarTopicById } from '@/modules/GrammarEngine'
import { enhanceCardExplanation } from '@/modules/AIService'
import { speakWithPauses } from '@/modules/SpeechService'
import type { GrammarCard } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function CardDetailScreen() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { user } = useAppStore()

  const [card, setCard] = useState<GrammarCard | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState('')

  const topic = topicId ? getGrammarTopicById(topicId) : undefined

  useEffect(() => {
    loadCard()
  }, [topicId, user])

  const loadCard = async () => {
    if (!user || !topicId) return

    const allCards = await getAllCards(user.id)
    const foundCard = allCards.find((c) => c.topicId === topicId)
    setCard(foundCard || null)
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

  if (!topic) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <span className="text-5xl block mb-4">❓</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Тема не найдена
          </h2>
          <Button onClick={() => navigate('/review')}>
            Вернуться к списку
          </Button>
        </Card>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/review')}>
          ← Назад
        </Button>
        <div className="flex-1">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded mb-1">
            {card.level}
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
          >
            🔊
          </Button>
        </div>
      </Card>

      {/* Rule explanation */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Правило
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          {card.explanation}
        </p>

        {/* Enhanced explanation */}
        {card.isEnhanced && card.enhancedExplanation && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
              ✨ Расширенное объяснение:
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              {card.enhancedExplanation}
            </p>
          </div>
        )}

        {/* Enhance button */}
        {!card.isEnhanced && (
          <Button
            variant="secondary"
            className="mt-4"
            onClick={handleEnhance}
            disabled={isEnhancing}
          >
            {isEnhancing ? 'Расширяем...' : '✨ Расширить с помощью AI'}
          </Button>
        )}

        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </Card>

      {/* Examples */}
      {card.examples.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Примеры
          </h3>
          <div className="space-y-3">
            {card.examples.map((ex, i) => (
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
                  >
                    🔊
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
      {card.commonMistakes.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Частые ошибки
          </h3>
          <ul className="space-y-2">
            {card.commonMistakes.map((mistake, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
              >
                <span className="text-red-500">⚠️</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={`/practice/${card.id}`} className="flex-1">
          <Button className="w-full">
            Практика
          </Button>
        </Link>
      </div>
    </div>
  )
}
