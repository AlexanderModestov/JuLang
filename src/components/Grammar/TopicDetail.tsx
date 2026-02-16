import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Volume2,
  Lightbulb,
  AlertTriangle,
  Search,
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTeacherContext } from '@/store/teacherChatStore'
import { getAllCards, saveCard } from '@/db'
import {
  getGrammarTopicById,
  getAllGrammarTopics,
  createCardFromStatic,
} from '@/modules/GrammarEngine'
import { enhanceCardExplanation } from '@/modules/AIService'
import { useSpeech } from '@/hooks/useSpeech'
import type { GrammarCard, GrammarTopic, FrenchLevel } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const LEVEL_ORDER: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/* -- Accordion section --------------------------------------------------- */

function AccordionSection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-3 text-left focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-surface-0 rounded"
      >
        <span className="text-text-muted w-4 flex items-center justify-center">
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          />
        </span>
        <span className="font-semibold text-text-primary">
          {title}
        </span>
        {count != null && (
          <span className="text-sm text-text-muted">
            ({count})
          </span>
        )}
      </button>
      {open && <div className="pb-4 pl-6 animate-fade-in">{children}</div>}
    </div>
  )
}

/* -- Main component ------------------------------------------------------ */

export default function TopicDetail() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuthContext()
  const { speakWithPauses } = useSpeech()

  const [card, setCard] = useState<GrammarCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState('')

  const { currentLanguage } = useAuthContext()

  const topic = topicId
    ? (getGrammarTopicById(topicId, currentLanguage) as GrammarTopic | undefined)
    : undefined

  // Set teacher chat context with topic information
  useTeacherContext({
    screen: 'grammar',
    itemId: topicId,
    itemPreview: topic?.titleRu || topic?.title,
  })

  // Get all topics at user's level for "next rule" feature
  const availableTopics = useMemo(() => {
    if (!profile) return []
    const allTopics = getAllGrammarTopics(currentLanguage) as GrammarTopic[]
    const frenchLevel = profile.french_level || 'A1'
    const userLevelIndex = LEVEL_ORDER.indexOf(frenchLevel)
    const allowedLevels = LEVEL_ORDER.slice(0, userLevelIndex + 1)
    return allTopics.filter((t) =>
      allowedLevels.includes(t.level as FrenchLevel)
    )
  }, [profile, currentLanguage])

  useEffect(() => {
    loadCard()
  }, [topicId, user, profile])

  const loadCard = async () => {
    if (!user || !profile || !topicId || !topic) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const allCards = await getAllCards(user.id)
      let foundCard = allCards.find((c) => c.topicId === topicId)

      // If no card exists, create one from static data
      if (!foundCard && topic) {
        foundCard = await createCardFromStatic(user.id, topic, currentLanguage)
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
    speakWithPauses(text)
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
      <div className="space-y-6 animate-fade-in">
        <Card className="text-center py-8">
          <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
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
          <div className="animate-pulse text-4xl text-text-muted mb-4">...</div>
          <p className="text-text-secondary">Загрузка...</p>
        </Card>
      </div>
    )
  }

  // Static content from topic
  const content = topic.content
  const explanation = card?.explanation || content?.rule || ''
  const examples =
    card?.examples ||
    content?.examples.map((e: any) => ({
      french: e.fr || e.en || e.es || e.de || e.pt || '',
      russian: e.ru,
    })) ||
    []
  const commonMistakes = card?.commonMistakes || content?.commonMistakes || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/grammar')}>
          &larr; Назад
        </Button>
        <div className="flex-1">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-accent-subtle text-accent rounded mb-1">
            {topic.level}
          </span>
          <h1 className="text-xl font-bold text-text-primary">
            {topic.titleRu}
          </h1>
        </div>
      </div>

      {/* French title */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-text-primary">
            {topic.title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSpeak(topic.title)}
            aria-label="Listen to pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Accordion content */}
      <Card padding="none" className="px-4">
        {/* Правило -- open by default */}
        <AccordionSection title="Правило" defaultOpen>
          <p className="text-text-secondary">{explanation}</p>

          {/* Enhanced explanation */}
          {card?.isEnhanced && card.enhancedExplanation && (
            <div className="mt-4 p-3 bg-success-subtle border border-border-subtle rounded-lg">
              <p className="text-sm font-medium text-success mb-1">
                Расширенное объяснение:
              </p>
              <p className="text-sm text-text-secondary">
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

          {error && <p className="text-sm text-error mt-2">{error}</p>}
        </AccordionSection>

        {/* Образование */}
        {content?.formation && (
          <AccordionSection title="Образование">
            <p className="text-text-secondary italic mb-2">
              {content.formation.description}
            </p>
            <div className="bg-surface-2 rounded-lg p-3 mb-3">
              <code className="text-sm font-mono text-text-primary">
                {content.formation.formula}
              </code>
            </div>
            {content.formation.details.length > 0 && (
              <ul className="space-y-1">
                {content.formation.details.map((d: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-text-secondary text-sm"
                  >
                    <span className="text-text-muted mt-0.5">&#8226;</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </AccordionSection>
        )}

        {/* Использование */}
        {content?.usage && content.usage.length > 0 && (
          <AccordionSection
            title="Использование"
            count={content.usage.length}
          >
            <ul className="space-y-2">
              {content.usage.map((item: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-text-secondary text-sm"
                >
                  <span className="text-text-muted mt-0.5">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionSection>
        )}

        {/* Исключения */}
        {content?.exceptions && content.exceptions.length > 0 && (
          <AccordionSection
            title="Исключения"
            count={content.exceptions.length}
          >
            <div className="border-l-2 border-error pl-3">
              <ul className="space-y-2">
                {content.exceptions.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-text-secondary text-sm"
                  >
                    <span className="text-error mt-0.5">&#8226;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AccordionSection>
        )}

        {/* Примеры */}
        {examples.length > 0 && (
          <AccordionSection title="Примеры" count={examples.length}>
            <div className="space-y-3">
              {examples.map(
                (ex: { french: string; russian: string }, i: number) => (
                  <div
                    key={i}
                    className="bg-surface-2 p-3 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-text-primary">
                        {ex.french}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(ex.french)}
                        aria-label="Listen to example"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-text-muted mt-1">
                      {ex.russian}
                    </p>
                  </div>
                )
              )}
            </div>
          </AccordionSection>
        )}

        {/* Типичные ошибки */}
        {commonMistakes.length > 0 && (
          <AccordionSection
            title="Типичные ошибки"
            count={commonMistakes.length}
          >
            <ul className="space-y-2">
              {commonMistakes.map((mistake: string, i: number) => {
                // Parse "wrong -> right" format
                const parts = mistake.split(' \u2192 ')
                if (parts.length === 2) {
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">
                        <span className="line-through text-error">
                          {parts[0]}
                        </span>
                        {' \u2192 '}
                        <span className="text-success">
                          {parts[1]}
                        </span>
                      </span>
                    </li>
                  )
                }
                return (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-text-secondary text-sm"
                  >
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>{mistake}</span>
                  </li>
                )
              })}
            </ul>
          </AccordionSection>
        )}

        {/* Подсказки */}
        {content?.tips && content.tips.length > 0 && (
          <AccordionSection title="Подсказки" count={content.tips.length}>
            <div className="bg-warning-subtle rounded-lg p-3 space-y-2">
              {content.tips.map((tip: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}
      </Card>

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
