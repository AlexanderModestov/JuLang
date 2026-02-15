import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import type { FrenchLevel, TopicStats } from '@/types'
import { getTopicStats } from '@/modules/ExercisesEngine'
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
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Выбрать тему
        </h2>
        <button
          onClick={() => navigate('/exercises')}
          className="text-sm text-primary-600 dark:text-primary-400"
        >
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
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Topic list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Загрузка тем...</p>
        </div>
      ) : topics.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
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
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                    isSelected
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {topic.topicName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {topic.solved}/{topic.total}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progressPercent === 100
                              ? 'bg-green-500'
                              : 'bg-primary-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      {topic.attempts > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
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
