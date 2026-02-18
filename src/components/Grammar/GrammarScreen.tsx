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
  useTeacherContext({ screen: 'grammar' })

  const topics = useMemo(() => {
    const allTopics = getAllGrammarTopics(currentLanguage) as GrammarTopic[]
    const userLevelIndex = LEVEL_ORDER.indexOf(currentLevel)
    const allowedLevels = LEVEL_ORDER.slice(0, userLevelIndex + 1)
    return allTopics.filter((topic) => allowedLevels.includes(topic.level as FrenchLevel))
  }, [currentLevel, currentLanguage])

  const groupedTopics = useMemo(() => {
    const groups: Record<GrammarGroup, GrammarTopic[]> = {
      articles: [], tenses: [], pronouns: [], prepositions: [],
      adjectives: [], negation: [], questions: [],
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
        <h1 className="text-2xl font-bold text-white/90 tracking-wide">
          Грамматика
        </h1>
        <Card className="text-center py-8">
          <svg className="w-12 h-12 mx-auto mb-4 text-neon-300/40" viewBox="0 0 24 24" fill="none">
            <path d="M8 6l8 20M24 6l-8 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M6 18h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h2 className="text-xl font-semibold text-white/90 mb-2">
            Нет доступных тем
          </h2>
          <p className="text-white/40">
            Грамматические правила скоро появятся.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white/90 tracking-wide">
          Грамматика
        </h1>
        <span className="text-sm text-white/40">
          <span className="text-primary-400 font-semibold">{topics.length}</span> тем для уровня {currentLevel}
        </span>
      </div>

      <Card padding="md">
        <p className="text-sm text-white/40">
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
