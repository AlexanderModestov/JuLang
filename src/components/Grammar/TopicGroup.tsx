import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
    <div className="mb-4 border border-white/[0.06] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 py-2 px-3 text-left focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded hover:bg-white/5 transition-colors"
      >
        <span className="text-primary-400 w-4 flex items-center justify-center">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <h3 className="font-semibold text-white">
          {groupName}
        </h3>
        <span className="text-sm text-primary-400/60">
          ({topics.length})
        </span>
      </button>

      {isExpanded && (
        <div className="mt-1 space-y-1 px-3 pb-3">
          {topics.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  )
}
