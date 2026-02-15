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
      className={`relative w-full bg-stone-900 dark:bg-stone-800 rounded-2xl p-6 text-white overflow-hidden ${className}`}
    >
      {/* Subtle decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/[0.03] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        {/* Top row: Level + Streak */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-semibold">{current}</span>
              {next && (
                <>
                  <span className="text-white/30 text-sm">/</span>
                  <span className="text-base text-white/40">{next}</span>
                </>
              )}
            </div>
            <p className="text-xs text-white/50 mt-1">Текущий уровень</p>
          </div>
          {currentStreak > 0 && (
            <StreakBadge days={currentStreak} />
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className="bg-accent-400 rounded-full h-1.5 transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/40">{percent}%</span>
            <span className="text-xs text-white/40">Сегодня: {todayMinutes} мин</span>
          </div>
        </div>
      </div>
    </div>
  )
}
