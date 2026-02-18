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
      className="w-full text-left px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.07] hover:border-white/[0.12] transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-surface-900 group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-white/90">
            {topic.titleRu}
          </p>
          <p className="text-sm text-white/40 mt-0.5">
            {topic.title}
          </p>
        </div>
        <svg className="w-4 h-4 text-white/20 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
