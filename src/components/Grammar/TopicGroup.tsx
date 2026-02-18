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
        className="w-full flex items-center gap-2 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-surface-900 rounded"
      >
        <svg
          className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5l8 7-8 7z" />
        </svg>
        <h3 className="font-semibold text-white/90 tracking-wide">
          {groupName}
        </h3>
        <span className="text-sm text-white/30">
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
