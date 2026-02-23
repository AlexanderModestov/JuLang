import { BookOpen, Clock } from 'lucide-react'
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
      className={`w-full text-left rounded-xl p-4 shadow-glass transition-all ${
        isActive
          ? 'bg-white/5 ring-2 ring-primary-400'
          : 'bg-white/[0.03] backdrop-blur-md border border-white/[0.06] hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{languageFlags[language]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm truncate">
              {languageLabels[language]}
            </span>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 bg-primary-500 text-white rounded-full leading-none">
                сейчас
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-primary-400/60">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {wordsLearned} слов
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(totalMinutes)}
            </span>
            {todayMinutes > 0 && (
              <span className="text-emerald-400">
                +{todayMinutes} мин
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
