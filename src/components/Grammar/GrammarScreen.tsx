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
  const { profile, currentLanguage } = useAuthContext()

  // Set teacher chat context for grammar screen
  useTeacherContext({ screen: 'grammar' })

  // Get topics filtered by user's level and below
  const topics = useMemo(() => {
    const allTopics = getAllGrammarTopics(currentLanguage) as GrammarTopic[]
    const userLevel = profile?.french_level || 'A1'
    const userLevelIndex = LEVEL_ORDER.indexOf(userLevel)
    const allowedLevels = LEVEL_ORDER.slice(0, userLevelIndex + 1)

    return allTopics.filter((topic) =>
      allowedLevels.includes(topic.level as FrenchLevel)
    )
  }, [profile?.french_level, currentLanguage])

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
      <div className="space-y-8 stagger-children">
        <div>
          <h1 className="font-display text-display-md font-semibold text-stone-900 dark:text-stone-50">
            Грамматика
          </h1>
        </div>
        <Card className="text-center py-12">
          <span className="text-4xl block mb-4 opacity-60">&#128214;</span>
          <h2 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
            Нет доступных тем
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Грамматические правила скоро появятся.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 stagger-children">
      {/* Header */}
      <div className="flex items-end justify-between">
        <h1 className="font-display text-display-md font-semibold text-stone-900 dark:text-stone-50">
          Грамматика
        </h1>
        <span className="text-xs font-medium text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full">
          {topics.length} тем &middot; {profile?.french_level || 'A1'}
        </span>
      </div>

      {/* Info card */}
      <Card padding="md">
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
          Справочник грамматических правил. {languageLabels[currentLanguage]}. Выберите тему для
          изучения.
        </p>
      </Card>

      {/* Topic groups */}
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
