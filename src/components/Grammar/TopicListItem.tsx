import { useNavigate } from 'react-router-dom'
import type { GrammarTopic } from '@/types'

interface TopicListItemProps {
  topic: GrammarTopic
}

export default function TopicListItem({ topic }: TopicListItemProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/grammar/${topic.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-smooth active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
            {topic.titleRu}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {topic.title}
          </p>
        </div>
        <svg
          className="w-4 h-4 text-stone-300 dark:text-stone-600 flex-shrink-0 ml-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
