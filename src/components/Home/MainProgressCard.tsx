import { Clock } from 'lucide-react'
import type { FrenchLevel } from '@/types'
import StreakBadge from './StreakBadge'

interface MainProgressCardProps {
  levelProgress: {
    current: FrenchLevel
    next: FrenchLevel | null
    percent: number
  }
  todayMinutes: number
  currentStreak: number
  className?: string
}

export default function MainProgressCard({
  levelProgress,
  todayMinutes,
  currentStreak,
  className = '',
}: MainProgressCardProps) {
  const { current, next, percent } = levelProgress

  return (
    <div
      className={`relative w-full bg-surface-2 border border-border-subtle rounded-2xl p-5 ${className}`}
    >
      {/* Streak badge in top-right corner */}
      {currentStreak > 0 && (
        <div className="absolute top-4 right-4">
          <StreakBadge days={currentStreak} size="sm" />
        </div>
      )}

      {/* Level progress section */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-text-primary">{current}</span>
          {next && (
            <>
              <span className="text-text-muted">&rarr;</span>
              <span className="text-lg text-text-secondary">{next}</span>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface-3 rounded-full h-2 mb-1.5">
          <div
            className="bg-accent rounded-full h-2 transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-sm text-text-muted">{percent}% завершено</div>
      </div>

      {/* Today's practice time */}
      <div className="flex items-center gap-2 text-text-secondary">
        <Clock size={16} className="text-text-muted" />
        <span className="text-sm">
          Сегодня: <span className="font-semibold text-text-primary">{todayMinutes} мин</span>
        </span>
      </div>
    </div>
  )
}
