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
      className={`relative w-full bg-gradient-to-r from-primary-600 to-neon-700 rounded-xl p-5 shadow-glow-cyan text-white ${className}`}
    >
      {/* Streak badge in top-right corner */}
      {currentStreak > 0 && (
        <div className="absolute top-3 right-3">
          <StreakBadge
            days={currentStreak}
            size="sm"
            className="bg-white/15 text-white"
          />
        </div>
      )}

      {/* Level progress section */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">{current}</span>
          {next && (
            <>
              <span className="text-white/70">→</span>
              <span className="text-lg text-white/70">{next}</span>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/15 rounded-full h-2.5 mb-1">
          <div
            className="bg-white rounded-full h-2.5 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-sm text-white/80">{percent}% завершено</div>
      </div>

      {/* Today's practice time */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span className="text-sm">
          Сегодня: <span className="font-semibold">{todayMinutes} мин</span>
        </span>
      </div>
    </div>
  )
}
