import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
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

export default function HomeScreen() {
  const { profile, progress } = useAuthContext()
  const { stats, loading: statsLoading } = useHomeStats()

  // Set teacher chat context for home screen
  useTeacherContext({ screen: 'home' })

  if (!profile || !progress) return null

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Priviet, {profile.name}!
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

      {/* Quick actions */}
      <div className="grid gap-4">
        <Link to="/topics">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">💬</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Начать разговор
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Практикуйте французский с AI учителем
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/vocabulary">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🔤</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Словарь
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Изучайте новые слова и выражения
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/grammar">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📖</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Грамматика
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Справочник по грамматике французского
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/exercises">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">✏️</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Упражнения
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Практикуйте грамматику с упражнениями
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
