import { useState } from 'react'
import type { VocabularyCard } from '@/types'
import { speak } from '@/modules/SpeechService'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface NewCardViewProps {
  cards: VocabularyCard[]
  onCardLearned: (cardId: string) => void
  onComplete: () => void
}

export default function NewCardView({ cards, onCardLearned, onComplete }: NewCardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (cards.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Нет новых слов для изучения на вашем уровне.
          </p>
        </div>
      </Card>
    )
  }

  const card = cards[currentIndex]
  const isLast = currentIndex >= cards.length - 1

  const handleSpeak = (text: string) => {
    speak(text)
  }

  const handleNext = () => {
    onCardLearned(card.id)
    if (isLast) {
      onComplete()
    } else {
      setCurrentIndex((i) => i + 1)
      setFlipped(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {currentIndex + 1} / {cards.length}
      </p>

      <Card>
        <div className="text-center space-y-4 py-4">
          {/* French word */}
          <div>
            <button
              onClick={() => handleSpeak(card.french)}
              className="text-3xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {card.french} 🔊
            </button>
            {card.gender && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {card.gender === 'masculine' ? '(masculin)' : '(féminin)'}
              </p>
            )}
          </div>

          {/* Flip to reveal */}
          {!flipped ? (
            <Button variant="secondary" onClick={() => setFlipped(true)}>
              Показать перевод
            </Button>
          ) : (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xl text-gray-800 dark:text-gray-200">
                  {card.russian}
                </p>
              </div>

              {/* Example */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-left">
                <button
                  onClick={() => handleSpeak(card.example)}
                  className="text-sm text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  🔊 {card.example}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {card.exampleTranslation}
                </p>
              </div>

              <Button onClick={handleNext} className="w-full">
                {isLast ? 'Завершить' : 'Далее'}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
