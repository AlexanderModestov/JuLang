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
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 px-3 hover:bg-stone-100/60 dark:hover:bg-stone-800/40 rounded-xl transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
      >
        <div className="flex items-center gap-2.5">
          <h3 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
            {groupName}
          </h3>
          <span className="text-xs text-stone-400 dark:text-stone-600">
            {topics.length}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-stone-400 dark:text-stone-500 transition-smooth ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1.5 pl-3">
          {topics.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  )
}
