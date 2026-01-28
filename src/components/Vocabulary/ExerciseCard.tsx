import { useState } from 'react'
import type { VocabularyCard, VocabularyExerciseType } from '@/types'
import { getMultipleChoiceOptions } from '@/modules/VocabularyEngine'
import { isEquivalent } from '@/utils/text'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

interface ExerciseCardProps {
  card: VocabularyCard
  exerciseType: VocabularyExerciseType
  onResult: (correct: boolean) => void
}

export default function ExerciseCard({ card, exerciseType, onResult }: ExerciseCardProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [options] = useState(() =>
    exerciseType === 'multiple_choice'
      ? getMultipleChoiceOptions(card, 'russian')
      : []
  )

  const prompt = exerciseType === 'fr_to_ru'
    ? card.french
    : exerciseType === 'ru_to_fr'
      ? card.russian
      : card.french

  const correctAnswer = exerciseType === 'fr_to_ru'
    ? card.russian
    : exerciseType === 'ru_to_fr'
      ? card.french
      : card.russian

  const handleSubmitText = () => {
    if (!userAnswer.trim()) return
    const correct = isEquivalent(userAnswer.trim(), correctAnswer)
    setIsCorrect(correct)
    setShowResult(true)
  }

  const handleSelectOption = (option: string) => {
    if (showResult) return
    setSelectedOption(option)
    const correct = option === card.russian
    setIsCorrect(correct)
    setShowResult(true)
  }

  const handleContinue = () => {
    onResult(isCorrect)
  }

  return (
    <Card>
      <div className="space-y-4">
        {/* Prompt */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {exerciseType === 'fr_to_ru' ? 'Переведите на русский:' :
             exerciseType === 'ru_to_fr' ? 'Переведите на французский:' :
             'Выберите перевод:'}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {prompt}
          </p>
          {card.gender && exerciseType !== 'ru_to_fr' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {card.gender === 'masculine' ? '(m)' : '(f)'}
            </p>
          )}
        </div>

        {/* Input or options */}
        {exerciseType === 'multiple_choice' ? (
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                disabled={showResult}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  showResult
                    ? option === card.russian
                      ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                      : option === selectedOption && !isCorrect
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
              placeholder={exerciseType === 'fr_to_ru' ? 'Ваш перевод...' : 'Votre traduction...'}
              disabled={showResult}
              disableAutoCorrect={exerciseType === 'ru_to_fr'}
              className="flex-1"
            />
            {!showResult && (
              <Button onClick={handleSubmitText} disabled={!userAnswer.trim()}>
                OK
              </Button>
            )}
          </div>
        )}

        {/* Result */}
        {showResult && (
          <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <p className={`font-medium ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {isCorrect ? 'Правильно!' : 'Неправильно'}
            </p>
            {!isCorrect && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Правильный ответ: <strong>{correctAnswer}</strong>
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
              {card.example}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              {card.exampleTranslation}
            </p>
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
