import { Link } from 'react-router-dom'
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

// Geometric SVG icons for each action
const icons = {
  conversation: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <path d="M6 8h20v14H18l-6 4v-4H6V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
      <circle cx="16" cy="15" r="1" fill="currentColor" />
      <circle cx="20" cy="15" r="1" fill="currentColor" />
    </svg>
  ),
  vocabulary: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M10 10h12M10 14h8M10 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  grammar: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <path d="M8 6l8 20M24 6l-8 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 18h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  exercises: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <path d="M16 4l3 6h7l-5.5 4.5 2 7L16 17l-6.5 4.5 2-7L6 10h7l3-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
}

const actionCards = [
  { to: '/topics', icon: icons.conversation, label: 'Разговор', sub: 'Практика с AI', color: 'from-primary-500/20 to-primary-500/5', borderColor: 'hover:border-primary-500/30', iconColor: 'text-primary-400' },
  { to: '/vocabulary', icon: icons.vocabulary, label: 'Словарь', sub: 'Новые слова', color: 'from-accent-500/20 to-accent-500/5', borderColor: 'hover:border-accent-500/30', iconColor: 'text-accent-400' },
  { to: '/grammar', icon: icons.grammar, label: 'Грамматика', sub: 'Справочник', color: 'from-neon-400/20 to-neon-400/5', borderColor: 'hover:border-neon-400/30', iconColor: 'text-neon-300' },
  { to: '/exercises', icon: icons.exercises, label: 'Упражнения', sub: 'Повторение', color: 'from-warning-500/20 to-warning-500/5', borderColor: 'hover:border-warning-500/30', iconColor: 'text-warning-400' },
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
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          <span className="gradient-text-cyber">{greetings[currentLanguage]}</span>, {profile.name}!
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
        <div className="flex gap-3">
          <StatsCard
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 7h10M7 11h6M7 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            value={stats.wordsLearned}
            label="Слов изучено"
            accentColor="text-success-500"
          />
          <StatsCard
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            value={formatTotalTime(stats.totalDialogueMinutes)}
            label="Всего диалогов"
            accentColor="text-primary-400"
          />
          <StatsCard
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            value={`${stats.averageDialogueMinutes} мин`}
            label="Средняя длина"
            accentColor="text-warning-400"
          />
        </div>
      )}

      {/* Per-language progress */}
      {hasMultipleLanguages && languageStats.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] px-1">
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
          <div className="animate-pulse text-white/30 font-medium">Загрузка...</div>
        </div>
      )}

      {/* Quick actions - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {actionCards.map((card, i) => (
          <Link key={card.to} to={card.to}>
            <Card
              variant="elevated"
              className={`cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 h-full bg-gradient-to-br ${card.color} ${card.borderColor} animate-slide-up`}
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards' }}
            >
              <div className="flex flex-col items-center text-center py-2 gap-2">
                <div className={card.iconColor}>
                  {card.icon}
                </div>
                <h3 className="font-semibold text-white/90 text-sm tracking-wide">
                  {card.label}
                </h3>
                <p className="text-xs text-white/40">
                  {card.sub}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
