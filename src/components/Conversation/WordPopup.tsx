import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { translateWord } from '@/modules/AIService'
import type { WordTranslation } from '@/modules/AIService'
import { isLemmaInProgress, addCardFromConversation } from '@/modules/VocabularyEngine'
import Button from '@/components/ui/Button'

interface WordPopupProps {
  word: string
  sentence: string
  onClose: () => void
}

export default function WordPopup({ word, sentence, onClose }: WordPopupProps) {
  const { user } = useAppStore()
  const [translation, setTranslation] = useState<WordTranslation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [alreadyAdded, setAlreadyAdded] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    loadTranslation()
  }, [word])

  const loadTranslation = async () => {
    setLoading(true)
    setError(false)
    try {
      const result = await translateWord(word, sentence)
      setTranslation(result)

      if (user) {
        const exists = await isLemmaInProgress(user.id, result.lemma)
        setAlreadyAdded(exists)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!user || !translation) return
    await addCardFromConversation(
      user.id,
      translation.lemma,
      translation.russian,
      translation.gender,
      translation.type,
      sentence,
      '' // exampleTranslation not available without extra AI call
    )
    setJustAdded(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Popup */}
      <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 space-y-4 shadow-xl">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">Перевод...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500">Не удалось перевести</p>
            <Button variant="ghost" size="sm" onClick={onClose} className="mt-2">
              Закрыть
            </Button>
          </div>
        ) : translation ? (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {translation.lemma}
              </p>
              {translation.gender && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {translation.gender === 'masculine' ? '(m)' : '(f)'}
                </p>
              )}
              <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
                {translation.russian}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {sentence}
              </p>
            </div>

            <div className="flex gap-2">
              {justAdded ? (
                <Button disabled className="flex-1">
                  Добавлено
                </Button>
              ) : alreadyAdded ? (
                <Button disabled className="flex-1">
                  Уже в словаре
                </Button>
              ) : (
                <Button onClick={handleAdd} className="flex-1">
                  Добавить в словарь
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
