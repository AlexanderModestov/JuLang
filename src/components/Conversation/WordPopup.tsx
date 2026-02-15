import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
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
  const { user } = useAuthContext()
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
    try {
      await addCardFromConversation(
        user.id,
        translation.lemma,
        translation.russian,
        translation.article,
        translation.type,
        sentence,
        '' // exampleTranslation not available without extra AI call
      )
      setJustAdded(true)
    } catch {
      setError(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-950/30" onClick={onClose} />

      {/* Popup */}
      <div className="relative bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 space-y-4 shadow-soft-lg border border-stone-200/60 dark:border-stone-800/60 animate-scale-in">
        {loading ? (
          <div className="text-center py-4">
            <div className="w-5 h-5 mx-auto border-2 border-stone-200 dark:border-stone-800 border-t-accent-500 rounded-full animate-spin" />
            <p className="text-sm text-stone-400 dark:text-stone-500 mt-3">Перевод...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-danger-500">Не удалось перевести</p>
            <Button variant="ghost" size="sm" onClick={onClose} className="mt-2">
              Закрыть
            </Button>
          </div>
        ) : translation ? (
          <>
            <div className="text-center">
              <p className="font-display text-display-sm font-semibold text-stone-900 dark:text-stone-50">
                {translation.article && (
                  <span className="text-accent-500 dark:text-accent-400">
                    {translation.article}
                    {translation.article !== "l'" && ' '}
                  </span>
                )}
                {translation.lemma}
              </p>
              <p className="text-lg text-stone-600 dark:text-stone-300 mt-2">
                {translation.russian}
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
              <p className="text-sm text-stone-600 dark:text-stone-300 italic leading-relaxed">
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
