import { useState, useEffect } from 'react'
import type { VocabularyCard, VocabularyExerciseType } from '@/types'
import { useAuthContext } from '@/contexts/AuthContext'
import { languageLabels } from '@/types'
import {
  getMultipleChoiceOptions,
  generateFillBlankExercise,
  generateListeningExercise,
  checkWrittenAnswer,
  getWordWithArticle,
  getCardWord,
  getExampleText,
} from '@/modules/VocabularyEngine'
import { speak } from '@/modules/SpeechService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

interface ExerciseCardProps {
  card: VocabularyCard
  exerciseType: VocabularyExerciseType
  onResult: (correct: boolean) => void
}

export default function ExerciseCard({ card, exerciseType, onResult }: ExerciseCardProps) {
  const { currentLanguage } = useAuthContext()
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Generate options based on exercise type
  const [exerciseData] = useState(() => {
    const word = getCardWord(card)
    switch (exerciseType) {
      case 'multiple_choice':
        return { options: getMultipleChoiceOptions(card, 'russian') }
      case 'fr_to_ru':
        return { options: getMultipleChoiceOptions(card, 'russian') }
      case 'ru_to_fr':
        return { options: getMultipleChoiceOptions(card, 'word') }
      case 'listening':
        return generateListeningExercise(card)
      case 'fill_blank':
        return generateFillBlankExercise(card) || { sentence: `___ = ${card.russian}`, blankWord: word, options: getMultipleChoiceOptions(card, 'word') }
      case 'write_word':
        return { correctAnswer: word }
      default:
        return { options: [] }
    }
  })

  // Auto-play audio for listening exercises
  useEffect(() => {
    if (exerciseType === 'listening' && 'wordToSpeak' in exerciseData) {
      const timer = setTimeout(() => {
        speak(exerciseData.wordToSpeak)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [exerciseType, exerciseData])

  const langLabel = languageLabels[currentLanguage]

  const getPromptText = () => {
    switch (exerciseType) {
      case 'fr_to_ru':
        return 'Выберите перевод:'
      case 'ru_to_fr':
        return `Выберите слово (${langLabel}):`
      case 'multiple_choice':
        return 'Выберите перевод:'
      case 'listening':
        return 'Что вы услышали?'
      case 'fill_blank':
        return 'Вставьте слово:'
      case 'write_word':
        return `Напишите (${langLabel}):`
      default:
        return 'Переведите:'
    }
  }

  const getPromptWord = () => {
    switch (exerciseType) {
      case 'fr_to_ru':
      case 'multiple_choice':
        return getWordWithArticle(card)
      case 'ru_to_fr':
      case 'write_word':
        return card.russian
      case 'listening':
        return null // Hidden - user must listen
      case 'fill_blank':
        return 'sentence' in exerciseData ? exerciseData.sentence : ''
      default:
        return getCardWord(card)
    }
  }

  const handlePlayAudio = () => {
    if ('wordToSpeak' in exerciseData) {
      speak(exerciseData.wordToSpeak)
    } else {
      speak(getWordWithArticle(card))
    }
  }

  const handleSubmitText = () => {
    if (!userAnswer.trim()) return
    const correct = checkWrittenAnswer(userAnswer, card)
    setIsCorrect(correct)
    setShowResult(true)
  }

  const handleSelectOption = (option: string) => {
    if (showResult) return
    setSelectedOption(option)

    let correct = false
    const word = getCardWord(card)
    switch (exerciseType) {
      case 'fr_to_ru':
      case 'multiple_choice':
      case 'listening':
        correct = option === card.russian
        break
      case 'ru_to_fr':
      case 'fill_blank':
        correct = option === word
        break
    }

    setIsCorrect(correct)
    setShowResult(true)
  }

  const handleContinue = () => {
    onResult(isCorrect)
  }

  const getOptions = (): string[] => {
    if ('options' in exerciseData && Array.isArray(exerciseData.options)) {
      return exerciseData.options
    }
    return []
  }

  const isTextInput = exerciseType === 'write_word'
  const isOptionBased = ['fr_to_ru', 'ru_to_fr', 'multiple_choice', 'listening', 'fill_blank'].includes(exerciseType)
  const options = getOptions()

  return (
    <Card>
      <div className="space-y-5">
        {/* Prompt */}
        <div className="text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
            {getPromptText()}
          </p>

          {/* Listening: show play button instead of word */}
          {exerciseType === 'listening' ? (
            <button
              onClick={handlePlayAudio}
              className="mx-auto flex items-center justify-center gap-2 px-6 py-4 bg-accent-50 dark:bg-accent-900/20 rounded-xl hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-smooth"
            >
              <svg className="w-8 h-8 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
              <span className="text-lg text-accent-700 dark:text-accent-300">Прослушать</span>
            </button>
          ) : (
            <p className="font-display text-display-sm font-semibold text-stone-900 dark:text-stone-50">
              {getPromptWord()}
            </p>
          )}
        </div>

        {/* Options for choice-based exercises */}
        {isOptionBased && options.length > 0 && (
          <div className="space-y-2">
            {options.map((option) => {
              const correctAnswer = exerciseType === 'fill_blank' || exerciseType === 'ru_to_fr'
                ? getCardWord(card)
                : card.russian

              return (
                <button
                  key={option}
                  onClick={() => handleSelectOption(option)}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded-xl border transition-smooth ${
                    showResult
                      ? option === correctAnswer
                        ? 'bg-success-50 dark:bg-green-900/20 border-success-500'
                        : option === selectedOption && !isCorrect
                          ? 'bg-danger-50 dark:bg-red-900/20 border-danger-500'
                          : 'border-stone-200/60 dark:border-stone-800/60'
                      : 'border-stone-200/60 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <span className="text-stone-900 dark:text-stone-50">{option}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Text input for write_word */}
        {isTextInput && (
          <div className="space-y-3">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
              placeholder="Напишите слово..."
              disabled={showResult}
              disableAutoCorrect
              className="text-center text-lg"
            />
            {!showResult && (
              <Button onClick={handleSubmitText} disabled={!userAnswer.trim()} className="w-full">
                Проверить
              </Button>
            )}
          </div>
        )}

        {/* Result */}
        {showResult && (
          <div className={`p-3 rounded-xl animate-fade-in ${isCorrect ? 'bg-success-50 dark:bg-green-900/20' : 'bg-danger-50 dark:bg-red-900/20'}`}>
            <p className={`font-medium ${isCorrect ? 'text-success-600 dark:text-green-400' : 'text-danger-600 dark:text-red-400'}`}>
              {isCorrect ? '\u2713 Правильно!' : '\u2717 Неправильно'}
            </p>
            {!isCorrect && (
              <p className="text-sm text-stone-700 dark:text-stone-300 mt-1">
                Правильный ответ: <strong>{getWordWithArticle(card)}</strong> — {card.russian}
              </p>
            )}
            {/* Show first example */}
            {card.examples.length > 0 && (
              <div className="mt-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/40">
                <p className="text-sm text-stone-600 dark:text-stone-400 italic">
                  {getExampleText(card.examples[0])}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-500 italic">
                  {card.examples[0].ru}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Continue */}
        {showResult && (
          <Button onClick={handleContinue} className="w-full">
            Далее
          </Button>
        )}
      </div>
    </Card>
  )
}
