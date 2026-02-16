import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import type { FrenchLevel, TopicStats } from '@/types'
import { getTopicStats } from '@/modules/ExercisesEngine'
import { Check, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const LEVELS: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function TopicSelector() {
  const navigate = useNavigate()
  const { user, profile, currentLanguage } = useAuthContext()

  const [selectedLevel, setSelectedLevel] = useState<FrenchLevel>(
    (profile?.french_level as FrenchLevel) || 'A1'
  )
  const [topics, setTopics] = useState<TopicStats[]>([])
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTopics()
  }, [user, selectedLevel, currentLanguage])

  const loadTopics = async () => {
    if (!user) return
    setLoading(true)
    try {
      const stats = await getTopicStats(user.id, currentLanguage, selectedLevel)
      setTopics(stats)
    } catch (error) {
      console.error('Failed to load topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) {
        next.delete(topicId)
      } else {
        next.add(topicId)
      }
      return next
    })
  }

  const handleStart = () => {
    const topicIds = Array.from(selectedTopics).join(',')
    navigate(`/exercises/session?level=${selectedLevel}&topics=${topicIds}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">
          Выбрать тему
        </h2>
        <button
          onClick={() => navigate('/exercises')}
          className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
      </div>

      {/* Level filter chips */}
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => {
              setSelectedLevel(level)
              setSelectedTopics(new Set())
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedLevel === level
                ? 'bg-accent text-text-inverse'
                : 'bg-surface-2 text-text-secondary border border-border-subtle hover:bg-surface-3'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Topic list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-text-muted">Загрузка тем...</p>
        </div>
      ) : topics.length === 0 ? (
        <Card>
          <p className="text-center text-text-muted py-4">
            Нет тем для уровня {selectedLevel}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {topics.map((topic) => {
            const isSelected = selectedTopics.has(topic.topicId)
            const progressPercent = topic.total > 0
              ? Math.round((topic.solved / topic.total) * 100)
              : 0
            const accuracyPercent = topic.attempts > 0
              ? Math.round((topic.correctCount / topic.attempts) * 100)
              : 0

            return (
              <button
                key={topic.topicId}
                onClick={() => toggleTopic(topic.topicId)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent-subtle'
                    : 'border-border-subtle bg-surface-1 hover:border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                    isSelected
                      ? 'bg-accent border-accent'
                      : 'border-border'
                  }`}>
                    {isSelected && (
                      <Check className="w-3 h-3 text-text-inverse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {topic.topicName}
                      </span>
                      <span className="text-xs text-text-muted ml-2 flex-shrink-0">
                        {topic.solved}/{topic.total}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progressPercent === 100
                              ? 'bg-success'
                              : 'bg-accent'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      {topic.attempts > 0 && (
                        <span className="text-xs text-text-muted flex-shrink-0">
                          {accuracyPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Start button */}
      {selectedTopics.size > 0 && (
        <div className="sticky bottom-4">
          <Button onClick={handleStart} size="lg" className="w-full">
            Начать по выбранным темам ({selectedTopics.size})
          </Button>
        </div>
      )}
    </div>
  )
}
