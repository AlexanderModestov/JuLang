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
  sm: 14,
  md: 18,
  lg: 22,
}

export default function StreakBadge({
  days,
  size = 'md',
  className = '',
}: StreakBadgeProps) {
  if (days === 0) return null

  return (
    <div
      className={`inline-flex items-center gap-1 bg-warm-subtle text-warm rounded-full font-semibold ${sizeStyles[size]} ${className}`}
    >
      <Flame size={iconSizes[size]} className="text-warm" />
      <span>{days}</span>
    </div>
  )
}
