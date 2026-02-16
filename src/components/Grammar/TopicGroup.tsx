import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
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
        className="w-full flex items-center gap-2 py-2 text-left focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-surface-0 rounded"
      >
        <span className="text-text-muted w-4 flex items-center justify-center">
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </span>
        <h3 className="font-semibold text-text-primary">
          {groupName}
        </h3>
        <span className="text-sm text-text-muted">
          ({topics.length})
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-6 animate-fade-in">
          {topics.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  )
}
