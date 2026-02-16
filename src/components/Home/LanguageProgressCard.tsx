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
      className={`w-full text-left rounded-2xl p-4 transition-all ${
        isActive
          ? 'border border-accent bg-accent-subtle'
          : 'bg-surface-1 border border-border-subtle hover:border-border'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{languageFlags[language]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary text-sm truncate">
              {languageLabels[language]}
            </span>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 bg-accent text-white rounded-full leading-none">
                сейчас
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <BookOpen size={12} />
              {wordsLearned} слов
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {formatTime(totalMinutes)}
            </span>
            {todayMinutes > 0 && (
              <span className="text-accent">
                +{todayMinutes} мин
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
