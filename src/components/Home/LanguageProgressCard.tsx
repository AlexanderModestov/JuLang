import type { Language } from '@/types'
import { languageLabels, languageFlags } from '@/types'
import type { LanguageStats } from '@/hooks/useHomeStats'

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
}

interface LanguageProgressCardProps {
  stats: LanguageStats
  isActive: boolean
  onSelect: (language: Language) => void
}

export default function LanguageProgressCard({
  stats,
  isActive,
  onSelect,
}: LanguageProgressCardProps) {
  const { language, wordsLearned, totalMinutes, todayMinutes } = stats

  return (
    <button
      onClick={() => onSelect(language)}
      className={`w-full text-left rounded-2xl p-4 transition-all duration-200 border ${
        isActive
          ? 'bg-primary-500/10 border-primary-500/30 shadow-glow-cyan-sm'
          : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{languageFlags[language]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/90 text-sm truncate">
              {languageLabels[language]}
            </span>
            {isActive && (
              <span className="text-[10px] px-2 py-0.5 bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded-full leading-none font-semibold">
                сейчас
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {wordsLearned} слов
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {formatTime(totalMinutes)}
            </span>
            {todayMinutes > 0 && (
              <span className="text-success-400 font-medium">
                +{todayMinutes} мин
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
