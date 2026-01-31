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
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
}

export default function StreakBadge({
  days,
  size = 'md',
  className = '',
}: StreakBadgeProps) {
  if (days === 0) return null

  return (
    <div
      className={`inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-semibold ${sizeStyles[size]} ${className}`}
    >
      <span className={iconSizes[size]}>🔥</span>
      <span>{days}</span>
    </div>
  )
}
