import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import type { VocabularyCard, VocabularyProgress, VocabularyExerciseType } from '@/types'
import {
  getNewCards,
  getReviewQueue,
  addCardToProgress,
  getCardsUpToLevel,
  scheduleVocabularyCard,
} from '@/modules/VocabularyEngine'
import { getQualityLabel } from '@/modules/SRSEngine'
import { db } from '@/db'
import { useVocabularyFilters } from '@/hooks/useVocabularyFilters'
import NewCardView from './NewCardView'
import ReviewSession from './ReviewSession'
import VocabularyFilters from './VocabularyFilters'
import VocabularyList, { getLearningStatus } from './VocabularyList'
import WordCard from './WordCard'
import ExerciseCard from './ExerciseCard'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { SRSQuality } from '@/types'

type Mode = 'menu' | 'new' | 'review' | 'list' | 'detail' | 'practice'

const EXERCISE_TYPES: VocabularyExerciseType[] = ['fr_to_ru', 'ru_to_fr', 'multiple_choice']

function pickExerciseType(): VocabularyExerciseType {
  return EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)]
}

export default function VocabularyScreen() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [mode, setMode] = useState<Mode>('menu')
  const [newCards, setNewCards] = useState<VocabularyCard[]>([])
  const [reviewQueue, setReviewQueue] = useState<VocabularyProgress[]>([])
  const [allCards, setAllCards] = useState<VocabularyCard[]>([])
  const [allProgress, setAllProgress] = useState<VocabularyProgress[]>([])
  const [loading, setLoading] = useState(true)

  // Detail/practice mode state
  const [selectedWord, setSelectedWord] = useState<VocabularyCard | null>(null)
  const [filteredWordsIndex, setFilteredWordsIndex] = useState(0)
  const [exerciseType, setExerciseType] = useState<VocabularyExerciseType>(pickExerciseType)
  const [showPracticeRating, setShowPracticeRating] = useState(false)
  const [lastPracticeCorrect, setLastPracticeCorrect] = useState(false)

  // Filters
  const { filters, setFilter, clearFilters, applyFilters, activeFilterCount } =
    useVocabularyFilters()

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    const [nc, rq, progress] = await Promise.all([
      getNewCards(user.id, user.frenchLevel),
      getReviewQueue(user.id),
      db.vocabularyProgress.where('userId').equals(user.id).toArray(),
    ])
    setNewCards(nc)
    setReviewQueue(rq)
    setAllCards(getCardsUpToLevel(user.frenchLevel))
    setAllProgress(progress)
    setLoading(false)
  }

  // Apply filters to get the filtered list
  const filteredWords = useMemo(() => {
    return applyFilters(allCards, allProgress)
  }, [allCards, allProgress, applyFilters])

  const handleCardLearned = async (cardId: string) => {
    if (!user) return
    await addCardToProgress(user.id, cardId)
  }

  const handleComplete = () => {
    setMode('menu')
    loadData()
  }

  const handleWordClick = (word: VocabularyCard) => {
    const index = filteredWords.findIndex((w) => w.id === word.id)
    setSelectedWord(word)
    setFilteredWordsIndex(index >= 0 ? index : 0)
    setMode('detail')
  }

  const handleNextWord = () => {
    const nextIndex = filteredWordsIndex + 1
    if (nextIndex < filteredWords.length) {
      setFilteredWordsIndex(nextIndex)
      setSelectedWord(filteredWords[nextIndex])
    } else {
      // No more words, go back to list
      setMode('list')
      setSelectedWord(null)
    }
  }

  const handlePractice = () => {
    setExerciseType(pickExerciseType())
    setShowPracticeRating(false)
    setMode('practice')
  }

  const handlePracticeResult = (correct: boolean) => {
    setLastPracticeCorrect(correct)
    setShowPracticeRating(true)
  }

  const handlePracticeRate = async (quality: SRSQuality) => {
    if (!user || !selectedWord) return

    // Find or create progress entry
    let progressEntry = allProgress.find((p) => p.cardId === selectedWord.id)

    if (!progressEntry) {
      // Add to progress first
      progressEntry = await addCardToProgress(user.id, selectedWord.id)
    }

    // Schedule the card
    await scheduleVocabularyCard(progressEntry.id, quality)

    // Reload progress data
    const updatedProgress = await db.vocabularyProgress
      .where('userId')
      .equals(user.id)
      .toArray()
    setAllProgress(updatedProgress)

    // Go back to detail view
    setShowPracticeRating(false)
    setMode('detail')
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedWord(null)
  }

  const handleBackToMenu = () => {
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

  // New words session mode
  if (mode === 'new') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToMenu}>
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

  // Review session mode
  if (mode === 'review') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToMenu}>
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

  // Practice mode (single word exercise)
  if (mode === 'practice' && selectedWord) {
    const ratingButtons: { quality: SRSQuality; label: string; color: string }[] = [
      { quality: 0, ...getQualityLabel(0) },
      { quality: 3, ...getQualityLabel(3) },
      { quality: 4, ...getQualityLabel(4) },
      { quality: 5, ...getQualityLabel(5) },
    ]

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMode('detail')}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Практика
          </h1>
        </div>

        {!showPracticeRating ? (
          <ExerciseCard
            key={`${selectedWord.id}-${exerciseType}`}
            card={selectedWord}
            exerciseType={exerciseType}
            onResult={handlePracticeResult}
          />
        ) : (
          <Card>
            <div className="space-y-4 text-center">
              <p
                className={`text-lg font-medium ${
                  lastPracticeCorrect
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {lastPracticeCorrect ? 'Правильно!' : 'Неправильно'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Оцените, насколько легко было вспомнить:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ratingButtons.map(({ quality, label }) => (
                  <Button
                    key={quality}
                    variant={
                      quality === 0 ? 'danger' : quality >= 4 ? 'primary' : 'secondary'
                    }
                    size="sm"
                    onClick={() => handlePracticeRate(quality)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Detail mode (WordCard view)
  if (mode === 'detail' && selectedWord) {
    const hasNextWord = filteredWordsIndex < filteredWords.length - 1

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedWord.french}
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            {filteredWordsIndex + 1} / {filteredWords.length}
          </span>
        </div>

        <WordCard
          word={selectedWord}
          learningStatus={getLearningStatus(selectedWord.id, allProgress)}
          onPractice={handlePractice}
          onNext={hasNextWord ? handleNextWord : undefined}
        />
      </div>
    )
  }

  // List mode (browsable catalog)
  if (mode === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToMenu}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Каталог слов
          </h1>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => newCards.length > 0 && setMode('new')}
            disabled={newCards.length === 0}
            className="justify-center"
          >
            🆕 Новые ({newCards.length})
          </Button>
          <Button
            variant="secondary"
            onClick={() => reviewQueue.length > 0 && setMode('review')}
            disabled={reviewQueue.length === 0}
            className="justify-center"
          >
            🔄 Повторить ({reviewQueue.length})
          </Button>
        </div>

        {/* Filters */}
        <VocabularyFilters
          filters={filters}
          onFilterChange={setFilter}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Word count */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Показано: {filteredWords.length} из {allCards.length} слов
        </p>

        {/* Word list */}
        <VocabularyList
          words={filteredWords}
          progress={allProgress}
          onWordClick={handleWordClick}
        />
      </div>
    )
  }

  // Menu mode (default)
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

      {/* Action buttons at top */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => newCards.length > 0 && setMode('new')}
          disabled={newCards.length === 0}
          size="lg"
          className="justify-center py-4"
        >
          🆕 Новые ({newCards.length})
        </Button>
        <Button
          variant="secondary"
          onClick={() => reviewQueue.length > 0 && setMode('review')}
          disabled={reviewQueue.length === 0}
          size="lg"
          className="justify-center py-4"
        >
          🔄 Повторить ({reviewQueue.length})
        </Button>
      </div>

      {/* Browse catalog card */}
      <Card
        variant="elevated"
        className="cursor-pointer hover:scale-[1.02] transition-transform"
        onClick={() => setMode('list')}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">📖</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Каталог слов
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {allCards.length} слов с фильтрами и поиском
            </p>
          </div>
        </div>
      </Card>

      <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
        ← На главную
      </Button>
    </div>
  )
}
