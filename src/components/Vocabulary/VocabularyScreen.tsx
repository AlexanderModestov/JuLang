import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import type { VocabularyCard, VocabularyProgress } from '@/types'
import { getNewCards, getReviewQueue, addCardToProgress } from '@/modules/VocabularyEngine'
import NewCardView from './NewCardView'
import ReviewSession from './ReviewSession'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type Mode = 'menu' | 'new' | 'review'

export default function VocabularyScreen() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [mode, setMode] = useState<Mode>('menu')
  const [newCards, setNewCards] = useState<VocabularyCard[]>([])
  const [reviewQueue, setReviewQueue] = useState<VocabularyProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    const [nc, rq] = await Promise.all([
      getNewCards(user.id, user.frenchLevel),
      getReviewQueue(user.id),
    ])
    setNewCards(nc)
    setReviewQueue(rq)
    setLoading(false)
  }

  const handleCardLearned = async (cardId: string) => {
    if (!user) return
    await addCardToProgress(user.id, cardId)
  }

  const handleComplete = () => {
    setMode('menu')
    loadData()
  }

  if (!user || loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Загрузка...</p>
      </div>
    )
  }

  if (mode === 'new') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMode('menu')}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Новые слова
          </h1>
        </div>
        <NewCardView
          cards={newCards}
          onCardLearned={handleCardLearned}
          onComplete={handleComplete}
        />
      </div>
    )
  }

  if (mode === 'review') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMode('menu')}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Повторение
          </h1>
        </div>
        <ReviewSession queue={reviewQueue} onComplete={handleComplete} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Словарь
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Уровень: {user.frenchLevel}
        </p>
      </div>

      <div className="grid gap-4">
        <Card
          variant="elevated"
          className="cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => newCards.length > 0 && setMode('new')}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🆕</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Новые слова
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {newCards.length > 0
                  ? `${newCards.length} слов для изучения`
                  : 'Все слова изучены!'}
              </p>
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          className="cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => reviewQueue.length > 0 && setMode('review')}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔄</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Повторение
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reviewQueue.length > 0
                  ? `${reviewQueue.length} слов на повторение`
                  : 'Нет слов для повторения'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
        ← На главную
      </Button>
    </div>
  )
}
