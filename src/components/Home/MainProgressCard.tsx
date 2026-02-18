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
      className={`relative w-full rounded-2xl p-5 overflow-hidden ${className}`}
    >
      {/* Gradient background with subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-neon-400/10 to-accent-500/15 rounded-2xl" />
      <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl border border-white/[0.10] rounded-2xl" />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Streak badge in top-right corner */}
        {currentStreak > 0 && (
          <div className="absolute top-0 right-0">
            <StreakBadge days={currentStreak} size="sm" />
          </div>
        )}

        {/* Level progress section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-white text-glow-cyan">{current}</span>
            {next && (
              <>
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-lg text-white/40 font-medium">{next}</span>
              </>
            )}
          </div>

          {/* Progress bar with glow */}
          <div className="w-full bg-white/[0.08] rounded-full h-2 mb-1.5">
            <div
              className="h-2 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary-500 to-primary-400"
              style={{
                width: `${percent}%`,
                boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
              }}
            />
          </div>
          <div className="text-sm text-white/50 font-medium">{percent}% завершено</div>
        </div>

        {/* Today's practice time */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-400" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-white/60">
            Сегодня: <span className="font-semibold text-white/90">{todayMinutes} мин</span>
          </span>
        </div>
      </div>
    </div>
  )
}
