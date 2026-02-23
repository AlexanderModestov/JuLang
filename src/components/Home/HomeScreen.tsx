import { Link } from 'react-router-dom'
import {
  MessageCircle,
  BookOpen,
  BookText,
  PenLine,
  Clock,
  BarChart3,
} from 'lucide-react'
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
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gradient-cyber">
          {greetings[currentLanguage]}, {profile.name}!
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
            icon={<BookOpen className="w-5 h-5 text-primary-500" />}
            value={stats.wordsLearned}
            label="Слов изучено"
          />
          <StatsCard
            icon={<Clock className="w-5 h-5 text-primary-400" />}
            value={formatTotalTime(stats.totalDialogueMinutes)}
            label="Всего диалогов"
          />
          <StatsCard
            icon={<BarChart3 className="w-5 h-5 text-primary-300" />}
            value={`${stats.averageDialogueMinutes} мин`}
            label="Средняя длина"
          />
        </div>
      )}

      {/* Per-language progress */}
      {hasMultipleLanguages && languageStats.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-primary-400/60 uppercase tracking-wide px-1">
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
          <div className="animate-pulse text-primary-400/60">Загрузка...</div>
        </div>
      )}

      {/* Quick actions - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/topics">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform h-full animate-fade-in-up"
          >
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-2">
                <MessageCircle className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-semibold text-white text-sm">
                Разговор
              </h3>
              <p className="text-xs text-primary-400 mt-1">
                Практика с AI
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/vocabulary">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform h-full animate-fade-in-up [animation-delay:75ms]"
          >
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-semibold text-white text-sm">
                Словарь
              </h3>
              <p className="text-xs text-primary-400 mt-1">
                Новые слова
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/grammar">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform h-full animate-fade-in-up [animation-delay:150ms]"
          >
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-2">
                <BookText className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-semibold text-white text-sm">
                Грамматика
              </h3>
              <p className="text-xs text-primary-400 mt-1">
                Справочник
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/exercises">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform h-full animate-fade-in-up [animation-delay:225ms]"
          >
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-2">
                <PenLine className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-semibold text-white text-sm">
                Упражнения
              </h3>
              <p className="text-xs text-primary-400 mt-1">
                Повторение
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
