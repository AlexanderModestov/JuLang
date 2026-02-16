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
      className="w-full text-left px-4 py-3 bg-surface-1 border border-border-subtle rounded-xl hover:bg-surface-2 hover:border-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-surface-0"
    >
      <p className="font-medium text-text-primary">
        {topic.titleRu}
      </p>
      <p className="text-sm text-text-muted mt-0.5">
        {topic.title}
      </p>
    </button>
  )
}
