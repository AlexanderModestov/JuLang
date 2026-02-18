import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

/* Accordion section */

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
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-3.5 text-left focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-surface-900 rounded"
      >
        <svg
          className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5l8 7-8 7z" />
        </svg>
        <span className="font-semibold text-white/90 tracking-wide">
          {title}
        </span>
        {count != null && (
          <span className="text-sm text-white/30">
            ({count})
          </span>
        )}
      </button>
      {open && <div className="pb-4 pl-6">{children}</div>}
    </div>
  )
}

/* Main component */

export default function TopicDetail() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { user, profile, currentLevel } = useAuthContext()
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
    const userLevelIndex = LEVEL_ORDER.indexOf(currentLevel)
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
      <div className="space-y-6">
        <Card className="text-center py-8">
          <span className="text-5xl block mb-4 text-white/20">?</span>
          <h2 className="text-xl font-semibold text-white/90 mb-2">
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
          <div className="flex justify-center mb-4">
            <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
          <p className="text-white/40">Загрузка...</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/grammar')}>
          &larr; Назад
        </Button>
        <div className="flex-1">
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-primary-500/15 text-primary-400 border border-primary-500/20 rounded-lg mb-1">
            {topic.level}
          </span>
          <h1 className="text-xl font-bold text-white/90 tracking-wide">
            {topic.titleRu}
          </h1>
        </div>
      </div>

      {/* French title */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white/90">
            {topic.title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSpeak(topic.title)}
            aria-label="Listen to pronunciation"
          >
            <svg className="w-5 h-5 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
            </svg>
          </Button>
        </div>
      </Card>

      {/* Accordion content */}
      <Card padding="none" className="px-4">
        {/* Rule */}
        <AccordionSection title="Правило" defaultOpen>
          <p className="text-white/70">{explanation}</p>

          {/* Enhanced explanation */}
          {card?.isEnhanced && card.enhancedExplanation && (
            <div className="mt-4 p-3 bg-success-500/10 border border-success-500/20 rounded-xl">
              <p className="text-sm font-medium text-success-400 mb-1">
                Расширенное объяснение:
              </p>
              <p className="text-sm text-success-400/80">
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

          {error && <p className="text-sm text-danger-400 mt-2">{error}</p>}
        </AccordionSection>

        {/* Formation */}
        {content?.formation && (
          <AccordionSection title="Образование">
            <p className="text-white/50 italic mb-2">
              {content.formation.description}
            </p>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 mb-3">
              <code className="text-sm font-mono text-primary-300">
                {content.formation.formula}
              </code>
            </div>
            {content.formation.details.length > 0 && (
              <ul className="space-y-1">
                {content.formation.details.map((d: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-white/60 text-sm"
                  >
                    <span className="text-primary-500/50 mt-0.5">&bull;</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </AccordionSection>
        )}

        {/* Usage */}
        {content?.usage && content.usage.length > 0 && (
          <AccordionSection
            title="Использование"
            count={content.usage.length}
          >
            <ul className="space-y-2">
              {content.usage.map((item: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-white/60 text-sm"
                >
                  <span className="text-primary-500/50 mt-0.5">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionSection>
        )}

        {/* Exceptions */}
        {content?.exceptions && content.exceptions.length > 0 && (
          <AccordionSection
            title="Исключения"
            count={content.exceptions.length}
          >
            <div className="border-l-2 border-danger-500/40 pl-3">
              <ul className="space-y-2">
                {content.exceptions.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-white/60 text-sm"
                  >
                    <span className="text-danger-400/70 mt-0.5">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AccordionSection>
        )}

        {/* Examples */}
        {examples.length > 0 && (
          <AccordionSection title="Примеры" count={examples.length}>
            <div className="space-y-3">
              {examples.map(
                (ex: { french: string; russian: string }, i: number) => (
                  <div
                    key={i}
                    className="bg-white/[0.04] border border-white/[0.06] p-3 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white/90">
                        {ex.french}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(ex.french)}
                        aria-label="Listen to example"
                      >
                        <svg className="w-4 h-4 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M15.54 8.46a5 5 0 010 7.07" />
                        </svg>
                      </Button>
                    </div>
                    <p className="text-sm text-white/40 mt-1">
                      {ex.russian}
                    </p>
                  </div>
                )
              )}
            </div>
          </AccordionSection>
        )}

        {/* Common Mistakes */}
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
                      <span className="text-warning-500 flex-shrink-0 mt-0.5 font-bold">
                        !
                      </span>
                      <span className="text-white/60">
                        <span className="line-through text-danger-400/70">
                          {parts[0]}
                        </span>
                        {' \u2192 '}
                        <span className="text-success-400">
                          {parts[1]}
                        </span>
                      </span>
                    </li>
                  )
                }
                return (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-white/60 text-sm"
                  >
                    <span className="text-warning-500 flex-shrink-0 mt-0.5 font-bold">
                      !
                    </span>
                    <span>{mistake}</span>
                  </li>
                )
              })}
            </ul>
          </AccordionSection>
        )}

        {/* Tips */}
        {content?.tips && content.tips.length > 0 && (
          <AccordionSection title="Подсказки" count={content.tips.length}>
            <div className="bg-warning-500/10 border border-warning-500/20 rounded-xl p-3 space-y-2">
              {content.tips.map((tip: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-white/60"
                >
                  <svg className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                  </svg>
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
