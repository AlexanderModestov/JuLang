import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { getCardsDueToday, getAllCards } from '@/db'
import type { GrammarCard } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function HomeScreen() {
  const { user, progress } = useAppStore()
  const [cardsDue, setCardsDue] = useState<GrammarCard[]>([])
  const [totalCards, setTotalCards] = useState(0)

  useEffect(() => {
    if (user) {
      loadCards()
    }
  }, [user])

  const loadCards = async () => {
    if (!user) return
    const due = await getCardsDueToday(user.id)
    const all = await getAllCards(user.id)
    setCardsDue(due)
    setTotalCards(all.length)
  }

  if (!user || !progress) return null

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonjour, {user.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Готовы практиковать французский?
        </p>
      </div>

      {/* Streak card */}
      {progress.currentStreak > 0 && (
        <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 border-0">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔥</span>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {progress.currentStreak} {progress.currentStreak === 1 ? 'день' : 'дней'}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Ваш текущий стрик!
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cards due */}
      {cardsDue.length > 0 && (
        <Card variant="outlined">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                📚 Карточки на сегодня
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cardsDue.length} {cardsDue.length === 1 ? 'карточка' : 'карточек'} для повторения
              </p>
            </div>
            <Link to="/review">
              <Button size="sm">Повторить</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Main actions */}
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

        <Link to="/review">
          <Card
            variant="elevated"
            className="cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📖</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Повторить грамматику
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalCards} {totalCards === 1 ? 'карточка' : 'карточек'} в вашей коллекции
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          📊 Ваша статистика
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {progress.totalConversations}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Диалогов
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {progress.grammarCardsMastered}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Освоено правил
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {progress.totalMessagesSent}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Сообщений
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {user.frenchLevel}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Ваш уровень
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
