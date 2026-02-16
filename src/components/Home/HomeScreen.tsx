import { Link } from 'react-router-dom'
import { MessageCircle, BookOpen, FileText, PenLine, Clock } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import type { Language } from '@/types'
import { useTeacherContext } from '@/store/teacherChatStore'
import Card from '@/components/ui/Card'
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

const quickActions = [
  {
    to: '/topics',
    icon: MessageCircle,
    label: 'Разговор',
    description: 'Практика с AI',
    iconColor: 'text-accent',
  },
  {
    to: '/vocabulary',
    icon: BookOpen,
    label: 'Словарь',
    description: 'Новые слова',
    iconColor: 'text-warm',
  },
  {
    to: '/grammar',
    icon: FileText,
    label: 'Грамматика',
    description: 'Справочник',
    iconColor: 'text-lavender',
  },
  {
    to: '/exercises',
    icon: PenLine,
    label: 'Упражнения',
    description: 'Повторение',
    iconColor: 'text-accent',
  },
]

export default function HomeScreen() {
  const { profile, progress, currentLanguage, setCurrentLanguage } = useAuthContext()
  const { stats, languageStats, loading: statsLoading } = useHomeStats()

  // Set teacher chat context for home screen
  useTeacherContext({ screen: 'home' })

  if (!profile || !progress) return null

  const userLanguages: Language[] = (profile.languages as Language[]) || [currentLanguage]
  const hasMultipleLanguages = userLanguages.length > 1

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="py-4">
        <h1 className="text-xl font-semibold text-text-primary">
          {greetings[currentLanguage]}, {profile.name}
        </h1>
        <p className="text-sm text-text-muted mt-0.5">Продолжайте обучение</p>
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
        <div className="flex gap-3">
          <StatsCard
            icon={<BookOpen size={20} className="text-accent" />}
            value={stats.wordsLearned}
            label="Слов изучено"
          />
          <StatsCard
            icon={<Clock size={20} className="text-lavender" />}
            value={formatTotalTime(stats.totalDialogueMinutes)}
            label="Всего диалогов"
          />
          <StatsCard
            icon={<MessageCircle size={20} className="text-warm" />}
            value={`${stats.averageDialogueMinutes} мин`}
            label="Средняя длина"
          />
        </div>
      )}

      {/* Per-language progress */}
      {hasMultipleLanguages && languageStats.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide px-1">
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
          <div className="animate-pulse text-text-muted">Загрузка...</div>
        </div>
      )}

      {/* Quick actions - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link key={action.to} to={action.to}>
              <Card
                variant="elevated"
                className="cursor-pointer hover:scale-[1.02] transition-transform h-full animate-slide-up"
                style={{
                  animationFillMode: 'forwards',
                  opacity: 0,
                  animationDelay: `${index * 75}ms`,
                }}
              >
                <div className="flex flex-col items-center text-center py-2">
                  <Icon size={28} className={`${action.iconColor} mb-2`} />
                  <h3 className="font-semibold text-text-primary text-sm">
                    {action.label}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    {action.description}
                  </p>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
