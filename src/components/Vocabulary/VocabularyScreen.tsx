import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
  toLocalVocabularyProgress,
} from '@/modules/VocabularyEngine'
import { userDataService } from '@/services/userDataService'
import { useVocabularyFilters } from '@/hooks/useVocabularyFilters'
import NewCardView from './NewCardView'
import ReviewSession from './ReviewSession'
import VocabularyFilters from './VocabularyFilters'
import VocabularyList, { getLearningStatus } from './VocabularyList'
import WordCard from './WordCard'
import ExerciseCard from './ExerciseCard'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

// Removed 'menu' mode - list is shown by default
type Mode = 'new' | 'review' | 'list' | 'detail' | 'practice'

export default function VocabularyScreen() {
  const navigate = useNavigate()
  const { user, profile, currentLanguage, currentLevel, incrementLanguageStats } = useAuthContext()
  const [mode, setMode] = useState<Mode>('list')
  const [newCards, setNewCards] = useState<VocabularyCard[]>([])
  const [reviewQueue, setReviewQueue] = useState<VocabularyProgress[]>([])
  const [allCards, setAllCards] = useState<VocabularyCard[]>([])
  const [allProgress, setAllProgress] = useState<VocabularyProgress[]>([])
  const [loading, setLoading] = useState(true)

  // Detail/practice mode state
  const [selectedWord, setSelectedWord] = useState<VocabularyCard | null>(null)
  const [filteredWordsIndex, setFilteredWordsIndex] = useState(0)
  const [exerciseType, setExerciseType] = useState<VocabularyExerciseType>(pickRandomExerciseType)
  const [showPracticeRating, setShowPracticeRating] = useState(false)
  const [lastPracticeCorrect, setLastPracticeCorrect] = useState(false)

  // Filters
  const { filters, setFilter, clearFilters, applyFilters, activeFilterCount } =
    useVocabularyFilters()

  // Set teacher chat context - updates when viewing specific word
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
    try {
      const [nc, rq, supabaseProgress] = await Promise.all([
        getNewCards(user.id, currentLevel, currentLanguage),
        getReviewQueue(user.id, currentLanguage),
        userDataService.getVocabularyProgress(user.id),
      ])
      // Filter by language in JS (matching pattern used by useHomeStats and getNewCards)
      const progress = supabaseProgress
        .filter((p) => (p as any).language === currentLanguage)
        .map(toLocalVocabularyProgress)
      setNewCards(nc)
      setReviewQueue(rq)
      setAllCards(getCardsUpToLevel(currentLevel, currentLanguage))
      setAllProgress(progress)
    } catch (error) {
      console.error('Failed to load vocabulary data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters to get the filtered list
  const filteredWords = useMemo(() => {
    return applyFilters(allCards, allProgress)
  }, [allCards, allProgress, applyFilters])

  const handleCardLearned = async (cardId: string) => {
    if (!user) return undefined
    const progress = await addCardToProgress(user.id, cardId, currentLanguage)
    if (progress) {
      incrementLanguageStats({ wordsLearned: 1 })
    }
    return progress
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
      // No more words, go back to list
      setMode('list')
      setSelectedWord(null)
    }
  }

  const handlePractice = () => {
    setExerciseType(pickRandomExerciseType())
    setShowPracticeRating(false)
    setMode('practice')
  }

  // Auto-SRS: schedule card based on correct/incorrect, then auto-transition
  const handlePracticeResult = async (correct: boolean) => {
    if (!user || !selectedWord) return

    // Find or create progress entry
    let progressEntry = allProgress.find((p) => p.cardId === selectedWord.id)

    if (!progressEntry) {
      // Add to progress first
      progressEntry = await addCardToProgress(user.id, selectedWord.id)
    }

    // Schedule the card automatically (correct=4, incorrect=0)
    await scheduleVocabularyCardAuto(progressEntry.id, correct)

    // Reload progress data from Supabase
    const updatedSupabase = await userDataService.getVocabularyProgress(user.id)
    setAllProgress(
      updatedSupabase
        .filter((p) => (p as any).language === currentLanguage)
        .map(toLocalVocabularyProgress)
    )

    // Show result briefly, then auto-transition
    setLastPracticeCorrect(correct)
    setShowPracticeRating(true)

    // Auto-transition after delay
    setTimeout(() => {
      setShowPracticeRating(false)
      setMode('detail')
    }, 1500)
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedWord(null)
  }

  const handleBackToMain = () => {
    navigate('/')
  }

  if (!user || !profile || loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-white/40 font-medium">Загрузка...</p>
        </div>
      </div>
    )
  }

  // New words session mode
  if (mode === 'new') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-white/90 tracking-wide">
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
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-white/90 tracking-wide">
            Повторение
          </h1>
        </div>
        <ReviewSession queue={reviewQueue} onComplete={handleComplete} />
      </div>
    )
  }

  // Practice mode (single word exercise with auto-SRS)
  if (mode === 'practice' && selectedWord) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMode('detail')}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-white/90 tracking-wide">
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
            <div className="space-y-4 text-center py-8">
              <p
                className={`text-2xl font-bold ${
                  lastPracticeCorrect
                    ? 'text-success-500 text-glow-cyan'
                    : 'text-danger-400'
                }`}
              >
                {lastPracticeCorrect ? '✓ Правильно!' : '✗ Неправильно'}
              </p>
              <p className="text-sm text-white/30">
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
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-white/90 tracking-wide">
            {getCardWord(selectedWord)}
          </h1>
          <span className="text-sm text-white/30 ml-auto font-medium">
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

  // List mode (default - shown immediately on entering Vocabulary)
  return (
    <div className="space-y-4">
      {/* Header with title and level */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90 tracking-wide">
            Словарь
          </h1>
          <p className="text-sm text-white/40">
            Уровень: <span className="text-primary-400 font-semibold">{currentLevel}</span>
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBackToMain}>
          На главную
        </Button>
      </div>

      {/* Compact action buttons at top */}
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
      <p className="text-sm text-white/30">
        Показано: <span className="text-white/60 font-medium">{filteredWords.length}</span> из {allCards.length} слов
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
