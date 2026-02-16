import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import type { FrenchLevel, TopicStats } from '@/types'
import { getLevelStats, getTopicStats } from '@/modules/ExercisesEngine'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Check } from 'lucide-react'

const LEVELS: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function ExercisesScreen() {
  const navigate = useNavigate()
  const { user, profile, currentLanguage } = useAuthContext()

  const userLevel = (profile?.french_level as FrenchLevel) || 'A1'

  const [selectedLevel, setSelectedLevel] = useState<FrenchLevel>(userLevel)
  const [topics, setTopics] = useState<TopicStats[]>([])
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [levelSolved, setLevelSolved] = useState(0)
  const [levelTotal, setLevelTotal] = useState(0)
  const [levelAttempts, setLevelAttempts] = useState(0)
  const [levelCorrect, setLevelCorrect] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user, selectedLevel, currentLanguage])

  const loadData = async () => {
    if (!user) return
    setLoading(true)

    try {
      const [stats, topicData] = await Promise.all([
        getLevelStats(user.id, currentLanguage, selectedLevel),
        getTopicStats(user.id, currentLanguage, selectedLevel),
      ])

      setLevelSolved(stats.solved)
      setLevelTotal(stats.totalExercises)
      setLevelAttempts(stats.attempts)
      setLevelCorrect(stats.correctCount)
      setTopics(topicData)
    } catch (error) {
      console.error('Failed to load exercises data:', error)
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

  const handleQuickStart = () => {
    navigate(`/exercises/session?level=${selectedLevel}`)
  }

  const handleStartSelected = () => {
    const topicIds = Array.from(selectedTopics).join(',')
    navigate(`/exercises/session?level=${selectedLevel}&topics=${topicIds}`)
  }

  const accuracyPercent = levelAttempts > 0
    ? Math.round((levelCorrect / levelAttempts) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Quick start section */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-text-primary">
              Упражнения
            </h1>
            <span className="px-2 py-1 text-sm font-medium bg-accent-subtle text-accent rounded-full">
              {userLevel}
            </span>
          </div>

          <Button onClick={handleQuickStart} size="lg" className="w-full">
            Начать сессию
          </Button>

          {levelAttempts > 0 && (
            <p className="text-sm text-text-muted text-center">
              Решено {levelSolved}/{levelTotal} заданий · {accuracyPercent}% правильно
            </p>
          )}
        </div>
      </Card>

      {/* Topic selection section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary">
          Выбрать тему
        </h2>

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
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
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
              const topicAccuracy = topic.attempts > 0
                ? Math.round((topic.correctCount / topic.attempts) * 100)
                : 0

              return (
                <button
                  key={topic.topicId}
                  onClick={() => toggleTopic(topic.topicId)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
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
                        <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
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
                            {topicAccuracy}%
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

        {/* Start by selected topics */}
        {selectedTopics.size > 0 && (
          <div className="sticky bottom-4 pt-2">
            <Button onClick={handleStartSelected} size="lg" className="w-full">
              Начать по выбранным темам ({selectedTopics.size})
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
