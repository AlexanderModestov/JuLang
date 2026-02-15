import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import type { Language } from '@/types'
import { useTeacherContext } from '@/store/teacherChatStore'
import MainProgressCard from './MainProgressCard'
import StatsCard from './StatsCard'
import LanguageProgressCard from './LanguageProgressCard'
import { useHomeStats } from '@/hooks/useHomeStats'

function formatTotalTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
}

const greetings: Record<Language, string> = {
  fr: 'Bonjour',
  en: 'Hello',
  es: 'Hola',
  de: 'Hallo',
  pt: 'Olá',
}

const features = [
  { to: '/topics', label: 'Разговор', sublabel: 'Практика с AI', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  )},
  { to: '/vocabulary', label: 'Словарь', sublabel: 'Новые слова', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )},
  { to: '/grammar', label: 'Грамматика', sublabel: 'Справочник', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  )},
  { to: '/exercises', label: 'Упражнения', sublabel: 'Повторение', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )},
]

export default function HomeScreen() {
  const { profile, progress, currentLanguage, setCurrentLanguage } = useAuthContext()
  const { stats, languageStats, loading: statsLoading } = useHomeStats()

  useTeacherContext({ screen: 'home' })

  if (!profile || !progress) return null

  const userLanguages: Language[] = (profile.languages as Language[]) || [currentLanguage]
  const hasMultipleLanguages = userLanguages.length > 1

  return (
    <div className="space-y-8 stagger-children">
      {/* Greeting */}
      <div>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">
          {greetings[currentLanguage]}
        </p>
        <h1 className="font-display text-display-md font-semibold text-stone-900 dark:text-stone-50">
          {profile.name}
        </h1>
      </div>

      {/* Main progress card */}
      {stats && (
        <MainProgressCard
          levelProgress={stats.levelProgress}
          todayMinutes={stats.todayMinutes}
          currentStreak={stats.currentStreak}
        />
      )}

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <StatsCard
            value={stats.wordsLearned}
            label="Слов изучено"
          />
          <StatsCard
            value={formatTotalTime(stats.totalDialogueMinutes)}
            label="Всего диалогов"
          />
          <StatsCard
            value={`${stats.averageDialogueMinutes} мин`}
            label="Средняя длина"
          />
        </div>
      )}

      {/* Per-language progress */}
      {hasMultipleLanguages && languageStats.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">
            Мои языки
          </h2>
          <div className="space-y-2">
            {languageStats.map((ls) => (
              <LanguageProgressCard
                key={ls.language}
                stats={ls}
                isActive={ls.language === currentLanguage}
                onSelect={setCurrentLanguage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {statsLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-stone-200 dark:border-stone-800 border-t-accent-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">
          Обучение
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => (
            <Link key={feature.to} to={feature.to}>
              <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-2xl p-5 card-interactive cursor-pointer">
                <div className="text-stone-400 dark:text-stone-500 mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-medium text-stone-900 dark:text-stone-50">
                  {feature.label}
                </h3>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                  {feature.sublabel}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
