import { useMemo } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTeacherContext } from '@/store/teacherChatStore'
import { getAllGrammarTopics } from '@/modules/GrammarEngine'
import type { GrammarTopic, GrammarGroup, FrenchLevel } from '@/types'
import { languageLabels } from '@/types'
import Card from '@/components/ui/Card'
import TopicGroup from './TopicGroup'
import { groupLabels, groupOrder } from './constants'

const LEVEL_ORDER: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function GrammarScreen() {
  const { currentLanguage, currentLevel } = useAuthContext()

  // Set teacher chat context for grammar screen
  useTeacherContext({ screen: 'grammar' })

  // Get topics filtered by user's level and below
  const topics = useMemo(() => {
    const allTopics = getAllGrammarTopics(currentLanguage) as GrammarTopic[]
    const userLevelIndex = LEVEL_ORDER.indexOf(currentLevel)
    const allowedLevels = LEVEL_ORDER.slice(0, userLevelIndex + 1)

    return allTopics.filter((topic) =>
      allowedLevels.includes(topic.level as FrenchLevel)
    )
  }, [currentLevel, currentLanguage])

  // Group topics by their group field
  const groupedTopics = useMemo(() => {
    const groups: Record<GrammarGroup, GrammarTopic[]> = {
      articles: [],
      tenses: [],
      pronouns: [],
      prepositions: [],
      adjectives: [],
      negation: [],
      questions: [],
    }

    topics.forEach((topic) => {
      if (topic.group && groups[topic.group]) {
        groups[topic.group].push(topic)
      }
    })

    return groups
  }, [topics])

  if (topics.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Грамматика
        </h1>
        <Card className="text-center py-8">
          <span className="text-5xl block mb-4">📖</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет доступных тем
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Грамматические правила скоро появятся.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Грамматика
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {topics.length} тем для уровня {currentLevel}
        </span>
      </div>

      <Card padding="md">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Справочник грамматических правил. {languageLabels[currentLanguage]}. Выберите тему для
          изучения.
        </p>
      </Card>

      <div>
        {groupOrder.map((group) => {
          const groupTopics = groupedTopics[group]
          if (groupTopics.length === 0) return null

          return (
            <TopicGroup
              key={group}
              groupName={groupLabels[group]}
              topics={groupTopics}
              defaultExpanded={true}
            />
          )
        })}
      </div>
    </div>
  )
}
