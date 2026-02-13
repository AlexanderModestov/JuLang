import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import type { Language } from '@/types'
import { useTeacherContext } from '@/store/teacherChatStore'
import Card from '@/components/ui/Card'
import MainProgressCard from './MainProgressCard'
import StatsCard from './StatsCard'
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
  const { profile, progress, currentLanguage } = useAuthContext()
  const { stats, loading: statsLoading } = useHomeStats()

  // Set teacher chat context for home screen
  useTeacherContext({ screen: 'home' })

  if (!profile || !progress) return null

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
            icon="📚"
            value={stats.wordsLearned}
            label="Слов изучено"
            iconColor="#10B981"
          />
          <StatsCard
            icon="⏱"
            value={formatTotalTime(stats.totalDialogueMinutes)}
            label="Всего диалогов"
            iconColor="#3B82F6"
          />
          <StatsCard
            icon="💬"
            value={`${stats.averageDialogueMinutes} мин`}
            label="Средняя длина"
            iconColor="#F59E0B"
          />
        </div>
      )}

      {/* Loading state */}
      {statsLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-pulse text-gray-400">Загрузка...</div>
        </div>
      )}

      {/* Quick actions - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/topics">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform h-full"
          >
            <div className="flex flex-col items-center text-center py-2">
              <span className="text-4xl mb-2">💬</span>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Разговор
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Практика с AI
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/vocabulary">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform h-full"
          >
            <div className="flex flex-col items-center text-center py-2">
              <span className="text-4xl mb-2">🔤</span>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Словарь
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Новые слова
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/grammar">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform h-full"
          >
            <div className="flex flex-col items-center text-center py-2">
              <span className="text-4xl mb-2">📖</span>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Грамматика
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Справочник
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/exercises">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform h-full"
          >
            <div className="flex flex-col items-center text-center py-2">
              <span className="text-4xl mb-2">✏️</span>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Упражнения
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Повторение
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
