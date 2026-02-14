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
      className={`w-full text-left rounded-xl p-4 shadow-md transition-all ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{languageFlags[language]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {languageLabels[language]}
            </span>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-500 text-white rounded-full leading-none">
                сейчас
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>📚 {wordsLearned} слов</span>
            <span>⏱ {formatTime(totalMinutes)}</span>
            {todayMinutes > 0 && (
              <span className="text-green-600 dark:text-green-400">
                +{todayMinutes} мин
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
