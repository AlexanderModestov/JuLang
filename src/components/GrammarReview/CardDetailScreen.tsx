import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { getAllCards, saveCard } from '@/db'
import { getGrammarTopicById } from '@/modules/GrammarEngine'
import { enhanceCardExplanation } from '@/modules/AIService'
import { useSpeech } from '@/hooks/useSpeech'
import type { GrammarCard, GrammarTopic } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

/* -- Accordion section ---------------------------------------- */

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
    <div className="border-b border-white/[0.08] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-3 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
      >
        <span className="text-white/40 w-4 text-center text-sm">
          {open ? '\u25BC' : '\u25B6'}
        </span>
        <span className="font-semibold text-white/90">
          {title}
        </span>
        {count != null && (
          <span className="text-sm text-white/40">
            ({count})
          </span>
        )}
      </button>
      {open && <div className="pb-4 pl-6">{children}</div>}
    </div>
  )
}

/* -- Main component ------------------------------------------- */

export default function CardDetailScreen() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { user, currentLanguage } = useAuthContext()
  const { speakWithPauses } = useSpeech()

  const [card, setCard] = useState<GrammarCard | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState('')

  const topic = topicId
    ? (getGrammarTopicById(topicId, currentLanguage) as GrammarTopic | undefined)
    : undefined

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
    speakWithPauses(text)
  }

  if (!topic) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <span className="text-5xl block mb-4">?</span>
          <h2 className="text-xl font-semibold text-white/90 mb-2">
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
          <div className="animate-pulse text-4xl mb-4">...</div>
          <p className="text-white/50">Загрузка...</p>
        </Card>
      </div>
    )
  }

  const content = topic.content
  const examples = card.examples || []
  const commonMistakes = card.commonMistakes || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/review')}>
          &larr; Назад
        </Button>
        <div className="flex-1">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-500/15 text-primary-300 rounded mb-1">
            {card.level}
          </span>
          <h1 className="text-xl font-bold text-white/90">
            {topic.titleRu}
          </h1>
        </div>
      </div>

      {/* Title */}
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
            <span role="img" aria-hidden="true">
              &#x1F50A;
            </span>
          </Button>
        </div>
      </Card>

      {/* Accordion content */}
      <Card padding="none" className="px-4">
        {/* Правило — open by default */}
        <AccordionSection title="Правило" defaultOpen>
          <p className="text-white/70">
            {card.explanation}
          </p>

          {/* Enhanced explanation */}
          {card.isEnhanced && card.enhancedExplanation && (
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
          {!card.isEnhanced && (
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

        {/* Образование */}
        {content?.formation && (
          <AccordionSection title="Образование">
            <p className="text-white/50 italic mb-2">
              {content.formation.description}
            </p>
            <div className="bg-white/[0.04] rounded-lg p-3 mb-3">
              <code className="text-sm font-mono text-white/90">
                {content.formation.formula}
              </code>
            </div>
            {content.formation.details.length > 0 && (
              <ul className="space-y-1">
                {content.formation.details.map((d: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-white/70 text-sm"
                  >
                    <span className="text-white/30 mt-0.5">&#8226;</span>
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
                  className="flex items-start gap-2 text-white/70 text-sm"
                >
                  <span className="text-white/30 mt-0.5">&#8226;</span>
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
            <div className="border-l-2 border-danger-500/40 pl-3">
              <ul className="space-y-2">
                {content.exceptions.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-white/70 text-sm"
                  >
                    <span className="text-danger-400 mt-0.5">&#8226;</span>
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
              {examples.map((ex, i) => (
                <div
                  key={i}
                  className="bg-white/[0.03] p-3 rounded-lg"
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
                      <span role="img" aria-hidden="true">
                        &#x1F50A;
                      </span>
                    </Button>
                  </div>
                  <p className="text-sm text-white/40 mt-1">
                    {ex.russian}
                  </p>
                </div>
              ))}
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
                const parts = mistake.split(' → ')
                if (parts.length === 2) {
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-warning-500 flex-shrink-0 mt-0.5">
                        !
                      </span>
                      <span className="text-white/70">
                        <span className="line-through text-danger-400">
                          {parts[0]}
                        </span>
                        {' → '}
                        <span className="text-success-500">
                          {parts[1]}
                        </span>
                      </span>
                    </li>
                  )
                }
                return (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-white/70 text-sm"
                  >
                    <span className="text-warning-500 flex-shrink-0 mt-0.5">
                      !
                    </span>
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
            <div className="bg-warning-500/10 border border-warning-500/20 rounded-xl p-3 space-y-2">
              {content.tips.map((tip: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-white/70"
                >
                  <span className="flex-shrink-0">&#x1F4A1;</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}
      </Card>

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
