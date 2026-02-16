import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { translateWord } from '@/modules/AIService'
import type { WordTranslation } from '@/modules/AIService'
import { isLemmaInProgress, addCardFromConversation } from '@/modules/VocabularyEngine'
import Button from '@/components/ui/Button'
import { Loader2, BookPlus, CheckCircle, X } from 'lucide-react'

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
      <div className="absolute inset-0 bg-surface-0/80 backdrop-blur-sm" onClick={onClose} />

      {/* Popup */}
      <div className="relative bg-surface-1 border border-border-subtle rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 space-y-4 shadow-2xl shadow-black/20 animate-slide-up">
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto mb-2" />
            <p className="text-text-muted">Перевод...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-error">Не удалось перевести</p>
            <Button variant="ghost" size="sm" onClick={onClose} className="mt-2">
              Закрыть
            </Button>
          </div>
        ) : translation ? (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">
                {translation.article && (
                  <span className="text-accent">
                    {translation.article}
                    {translation.article !== "l'" && ' '}
                  </span>
                )}
                {translation.lemma}
              </p>
              <p className="text-lg text-text-secondary mt-2">
                {translation.russian}
              </p>
            </div>

            <div className="bg-surface-2 rounded-lg p-3">
              <p className="text-sm text-text-secondary italic">
                {sentence}
              </p>
            </div>

            <div className="flex gap-2">
              {justAdded ? (
                <Button disabled className="flex-1">
                  <CheckCircle size={16} className="mr-2" />
                  Добавлено
                </Button>
              ) : alreadyAdded ? (
                <Button disabled className="flex-1">
                  <BookPlus size={16} className="mr-2" />
                  Уже в словаре
                </Button>
              ) : (
                <Button onClick={handleAdd} className="flex-1">
                  <BookPlus size={16} className="mr-2" />
                  Добавить в словарь
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
