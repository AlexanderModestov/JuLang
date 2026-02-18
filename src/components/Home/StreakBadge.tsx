interface StreakBadgeProps {
  days: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'text-sm px-2.5 py-1',
  md: 'text-base px-3 py-1.5',
  lg: 'text-lg px-4 py-2',
}

export default function StreakBadge({
  days,
  size = 'md',
  className = '',
}: StreakBadgeProps) {
  if (days === 0) return null

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-warning-500/15 border border-warning-500/25 text-warning-400 rounded-full font-bold ${sizeStyles[size]} ${className}`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12zm0 18a6 6 0 01-6-6c0-2.5 2-5.5 6-9.5 4 4 6 7 6 9.5a6 6 0 01-6 6z" />
      </svg>
      <span>{days}</span>
    </div>
  )
}
