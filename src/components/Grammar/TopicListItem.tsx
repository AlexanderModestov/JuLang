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
      className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
    >
      <p className="font-medium text-gray-900 dark:text-white">
        {topic.titleRu}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {topic.title}
      </p>
    </button>
  )
}
