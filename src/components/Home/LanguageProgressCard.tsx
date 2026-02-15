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
      className={`w-full text-left rounded-xl p-4 transition-smooth ${
        isActive
          ? 'bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800/40'
          : 'bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{languageFlags[language]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-900 dark:text-stone-50 truncate">
              {languageLabels[language]}
            </span>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 bg-accent-500 text-white rounded-full leading-none font-medium">
                сейчас
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-400 dark:text-stone-500">
            <span>{wordsLearned} слов</span>
            <span>{formatTime(totalMinutes)}</span>
            {todayMinutes > 0 && (
              <span className="text-success-500">
                +{todayMinutes} мин
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
