import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  days: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'text-sm px-2 py-0.5',
  md: 'text-base px-2.5 py-1',
  lg: 'text-lg px-3 py-1.5',
}

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export default function StreakBadge({
  days,
  size = 'md',
  className = '',
}: StreakBadgeProps) {
  if (days === 0) return null

  return (
    <div
      className={`inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 rounded-full font-semibold ${sizeStyles[size]} ${className}`}
    >
      <Flame className={iconSizes[size]} />
      <span>{days}</span>
    </div>
  )
}
