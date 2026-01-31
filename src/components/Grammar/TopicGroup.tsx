import { useState } from 'react'
import type { GrammarTopic } from '@/types'
import TopicListItem from './TopicListItem'

interface TopicGroupProps {
  groupName: string
  topics: GrammarTopic[]
  defaultExpanded?: boolean
}

export default function TopicGroup({
  groupName,
  topics,
  defaultExpanded = true,
}: TopicGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (topics.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
      >
        <span className="text-gray-500 dark:text-gray-400 w-4 text-center">
          {isExpanded ? '\u25BC' : '\u25B6'}
        </span>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {groupName}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({topics.length})
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-6">
          {topics.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  )
}
