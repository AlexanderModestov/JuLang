import { useState, useEffect, useMemo } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTeacherContext } from '@/store/teacherChatStore'
import type { VocabularyCard, VocabularyProgress, VocabularyExerciseType } from '@/types'
import {
  getNewCards,
  getReviewQueue,
  addCardToProgress,
  getCardsUpToLevel,
  scheduleVocabularyCardAuto,
  pickRandomExerciseType,
  getCardWord,
} from '@/modules/VocabularyEngine'
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

type Mode = 'new' | 'review' | 'list' | 'detail' | 'practice'

export default function VocabularyScreen() {
  const { user, profile, currentLanguage } = useAuthContext()
  const [mode, setMode] = useState<Mode>('list')
  const [newCards, setNewCards] = useState<VocabularyCard[]>([])
  const [reviewQueue, setReviewQueue] = useState<VocabularyProgress[]>([])
  const [allCards, setAllCards] = useState<VocabularyCard[]>([])
  const [allProgress, setAllProgress] = useState<VocabularyProgress[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedWord, setSelectedWord] = useState<VocabularyCard | null>(null)
  const [filteredWordsIndex, setFilteredWordsIndex] = useState(0)
  const [exerciseType, setExerciseType] = useState<VocabularyExerciseType>(pickRandomExerciseType)
  const [showPracticeRating, setShowPracticeRating] = useState(false)
  const [lastPracticeCorrect, setLastPracticeCorrect] = useState(false)

  const { filters, setFilter, clearFilters, applyFilters, activeFilterCount } =
    useVocabularyFilters()

  useTeacherContext({
    screen: 'vocabulary',
    itemId: selectedWord?.id,
    itemPreview: selectedWord ? `${getCardWord(selectedWord)} - ${selectedWord.russian}` : undefined,
  })

  useEffect(() => {
    if (user && profile) loadData()
  }, [user, profile, currentLanguage])

  const loadData = async () => {
    if (!user || !profile) return
    setLoading(true)
    const frenchLevel = profile.french_level || 'A1'
    const [nc, rq, progress] = await Promise.all([
      getNewCards(user.id, frenchLevel, currentLanguage),
      getReviewQueue(user.id, currentLanguage),
      db.vocabularyProgress.where('userId').equals(user.id).toArray(),
    ])
    setNewCards(nc)
    setReviewQueue(rq)
    setAllCards(getCardsUpToLevel(frenchLevel, currentLanguage))
    setAllProgress(progress)
    setLoading(false)
  }

  const filteredWords = useMemo(() => {
    return applyFilters(allCards, allProgress)
  }, [allCards, allProgress, applyFilters])

  const handleCardLearned = async (cardId: string) => {
    if (!user) return
    await addCardToProgress(user.id, cardId)
  }

  const handleComplete = () => {
    setMode('list')
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
      setMode('list')
      setSelectedWord(null)
    }
  }

  const handlePractice = () => {
    setExerciseType(pickRandomExerciseType())
    setShowPracticeRating(false)
    setMode('practice')
  }

  const handlePracticeResult = async (correct: boolean) => {
    if (!user || !selectedWord) return

    let progressEntry = allProgress.find((p) => p.cardId === selectedWord.id)

    if (!progressEntry) {
      progressEntry = await addCardToProgress(user.id, selectedWord.id)
    }

    await scheduleVocabularyCardAuto(progressEntry.id, correct)

    const updatedProgress = await db.vocabularyProgress
      .where('userId')
      .equals(user.id)
      .toArray()
    setAllProgress(updatedProgress)

    setLastPracticeCorrect(correct)
    setShowPracticeRating(true)

    setTimeout(() => {
      setShowPracticeRating(false)
      setMode('detail')
    }, 1500)
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedWord(null)
  }

  if (!user || !profile || loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-stone-200 dark:border-stone-800 border-t-accent-500 rounded-full animate-spin" />
      </div>
    )
  }

  // New words session mode
  if (mode === 'new') {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Назад
          </Button>
          <h1 className="text-lg font-medium text-stone-900 dark:text-stone-50">
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
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Назад
          </Button>
          <h1 className="text-lg font-medium text-stone-900 dark:text-stone-50">
            Повторение
          </h1>
        </div>
        <ReviewSession queue={reviewQueue} onComplete={handleComplete} />
      </div>
    )
  }

  // Practice mode
  if (mode === 'practice' && selectedWord) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMode('detail')}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Назад
          </Button>
          <h1 className="text-lg font-medium text-stone-900 dark:text-stone-50">
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
            <div className="space-y-3 text-center py-8">
              <p
                className={`text-xl font-semibold ${
                  lastPracticeCorrect
                    ? 'text-success-500'
                    : 'text-danger-500'
                }`}
              >
                {lastPracticeCorrect ? 'Правильно' : 'Неправильно'}
              </p>
              <p className="text-sm text-stone-400 dark:text-stone-500">
                Переход к карточке...
              </p>
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
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Назад
          </Button>
          <h1 className="text-lg font-medium text-stone-900 dark:text-stone-50 flex-1">
            {getCardWord(selectedWord)}
          </h1>
          <span className="text-xs text-stone-400 dark:text-stone-500">
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

  // List mode (default)
  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-sm font-semibold text-stone-900 dark:text-stone-50">
            Словарь
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            Уровень: {profile.french_level || 'A1'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => newCards.length > 0 && setMode('new')}
          disabled={newCards.length === 0}
          className="justify-center"
        >
          Новые ({newCards.length})
        </Button>
        <Button
          variant="secondary"
          onClick={() => reviewQueue.length > 0 && setMode('review')}
          disabled={reviewQueue.length === 0}
          className="justify-center"
        >
          Повторить ({reviewQueue.length})
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
      <p className="text-xs text-stone-400 dark:text-stone-500">
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
