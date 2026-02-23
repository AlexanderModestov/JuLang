import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
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
      className="w-full text-left px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.08] hover:border-primary-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-white">
            {topic.titleRu}
          </p>
          <p className="text-sm text-primary-400/60 mt-0.5">
            {topic.title}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-primary-300 flex-shrink-0" />
      </div>
    </button>
  )
}
