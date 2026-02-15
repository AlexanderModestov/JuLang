interface StreakBadgeProps {
  days: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function StreakBadge({
  days,
  size = 'md',
  className = '',
}: StreakBadgeProps) {
  if (days === 0) return null

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  }

  return (
    <div
      className={`inline-flex items-center bg-amber-500/15 text-amber-400 rounded-full font-semibold ${sizeStyles[size]} ${className}`}
    >
      <span className="leading-none">
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5c-.7 0-1.3.4-1.6 1L4.5 6.4c-.2.3-.5.5-.9.5H2.5c-.5 0-1 .4-1 1v.5c0 .5.3.9.7 1l2.2 1c.3.1.5.4.6.7l.5 2.4c.1.5.6.8 1.1.7.3-.1.5-.3.6-.5L8 12l.8 1.7c.1.3.3.4.6.5.5.1 1-.2 1.1-.7l.5-2.4c.1-.3.3-.6.6-.7l2.2-1c.5-.2.7-.6.7-1V8.9c0-.5-.4-1-1-1h-1.1c-.4 0-.7-.2-.9-.5L9.6 2.5c-.3-.6-.9-1-1.6-1z" />
        </svg>
      </span>
      <span>{days}</span>
    </div>
  )
}
