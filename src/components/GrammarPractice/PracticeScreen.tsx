import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePracticeStore } from '@/store/usePracticeStore'
import { getCardById } from '@/modules/GrammarEngine'
import { createExercise, checkWrittenAnswer, checkSpokenAnswer, updatePracticeStats } from '@/modules/PracticeEngine'
import { scheduleCard } from '@/modules/SRSEngine'
import {
  startListening,
  stopListening,
  isSpeechRecognitionSupported,
} from '@/modules/SpeechService'
import { useSpeech } from '@/hooks/useSpeech'
import type { GrammarCard, PracticeType, PracticeExercise, PracticeResult } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs'
import {
  Loader2,
  PenLine,
  Mic,
  MicOff,
  MessageCircle,
  Volume2,
  CheckCircle,
  XCircle,
  Trophy,
  X,
} from 'lucide-react'

const PRACTICE_TYPES: { id: PracticeType; label: string; icon: React.ReactNode }[] = [
  { id: 'written_translation', label: 'Перевод', icon: <PenLine size={16} /> },
  { id: 'repeat_aloud', label: 'Повторить', icon: <Mic size={16} /> },
  { id: 'oral_translation', label: 'Устный', icon: <Volume2 size={16} /> },
  { id: 'grammar_dialog', label: 'Диалог', icon: <MessageCircle size={16} /> },
]

export default function PracticeScreen() {
  const { cardId } = useParams<{ cardId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const { speak } = useSpeech()
  const {
    currentType,
    setCurrentType,
    exercisesCompleted,
    correctAnswers,
    pronunciationScores,
    addResult,
    resetSession,
  } = usePracticeStore()

  const [card, setCard] = useState<GrammarCard | null>(null)
  const [exercise, setExercise] = useState<PracticeExercise | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [result, setResult] = useState<PracticeResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    loadCard()
    return () => resetSession()
  }, [cardId])

  useEffect(() => {
    if (card) {
      loadExercise()
    }
  }, [card, currentType])

  const loadCard = async () => {
    if (!cardId) return
    const loadedCard = await getCardById(cardId)
    if (loadedCard) {
      setCard(loadedCard)
    } else {
      navigate('/review')
    }
  }

  const loadExercise = async () => {
    if (!card) return
    setIsLoading(true)
    setResult(null)
    setUserAnswer('')

    try {
      const newExercise = await createExercise(card, currentType)
      setExercise(newExercise)
    } catch (error) {
      console.error('Failed to create exercise:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitWritten = async () => {
    if (!exercise || !userAnswer.trim() || !profile) return

    setIsLoading(true)
    try {
      const checkResult = await checkWrittenAnswer(exercise, userAnswer, profile.french_level || 'A1')
      setResult(checkResult)
      addResult(checkResult)
      await updatePracticeStats(cardId!, currentType, checkResult)
    } catch (error) {
      console.error('Failed to check answer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
      return
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Распознавание речи не поддерживается')
      return
    }

    setIsListening(true)
    startListening(
      async (recognitionResult) => {
        setUserAnswer(recognitionResult.transcript)
        if (recognitionResult.isFinal && exercise && profile) {
          setIsListening(false)
          setIsLoading(true)
          try {
            const checkResult = await checkSpokenAnswer(
              exercise,
              recognitionResult.transcript,
              profile.french_level || 'A1'
            )
            setResult(checkResult)
            addResult(checkResult)
            await updatePracticeStats(cardId!, currentType, checkResult)
          } catch (error) {
            console.error('Failed to check spoken answer:', error)
          } finally {
            setIsLoading(false)
          }
        }
      },
      (error) => {
        console.error('Speech recognition error:', error)
        setIsListening(false)
      },
      'fr-FR'
    )
  }

  const handleNext = () => {
    if (exercisesCompleted >= 10) {
      setIsComplete(true)
    } else {
      loadExercise()
    }
  }

  const handleFinish = async () => {
    if (!cardId) return

    // Calculate quality based on results
    const accuracy = exercisesCompleted > 0 ? correctAnswers / exercisesCompleted : 0
    let quality: 0 | 1 | 2 | 3 | 4 | 5 = 3
    if (accuracy >= 0.9) quality = 5
    else if (accuracy >= 0.7) quality = 4
    else if (accuracy >= 0.5) quality = 3
    else if (accuracy >= 0.3) quality = 2
    else quality = 1

    await scheduleCard(cardId, quality)
    navigate('/review')
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    )
  }

  if (isComplete) {
    const avgPronunciation =
      pronunciationScores.length > 0
        ? Math.round(
            pronunciationScores.reduce((a, b) => a + b, 0) / pronunciationScores.length
          )
        : null

    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <Trophy className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Практика завершена!
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-surface-2 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {correctAnswers}/{exercisesCompleted}
              </div>
              <div className="text-sm text-text-muted">Правильных</div>
            </div>
            {avgPronunciation !== null && (
              <div className="p-4 bg-surface-2 rounded-lg">
                <div className="text-2xl font-bold text-accent">
                  {avgPronunciation}%
                </div>
                <div className="text-sm text-text-muted">Произношение</div>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/review')}>
              К карточкам
            </Button>
            <Button onClick={handleFinish}>Завершить</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {card.topic}
          </h1>
          <p className="text-sm text-text-muted">
            {exercisesCompleted}/10 упражнений
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/review')}>
          <X size={18} />
        </Button>
      </div>

      {/* Practice type tabs */}
      <Tabs defaultTab={currentType} onChange={(id) => setCurrentType(id as PracticeType)}>
        <TabList>
          {PRACTICE_TYPES.map((type) => (
            <Tab key={type.id} id={type.id} icon={type.icon}>
              {type.label}
            </Tab>
          ))}
        </TabList>

        {/* Written Translation */}
        <TabPanel id="written_translation" className="pt-6">
          {isLoading && !result ? (
            <Card className="text-center py-8">
              <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
            </Card>
          ) : (
            <Card>
              {exercise?.sourceText && (
                <div className="mb-6">
                  <p className="text-sm text-text-muted mb-2">Переведите на французский:</p>
                  <p className="text-xl text-text-primary">
                    {exercise.sourceText}
                  </p>
                </div>
              )}

              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitWritten()}
                placeholder="Введите перевод..."
                className="w-full px-4 py-3 text-lg border border-border rounded-xl bg-surface-1 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 mb-4"
                disabled={!!result}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
              />

              {result && (
                <div className={`p-4 rounded-lg mb-4 ${result.isCorrect ? 'bg-success-subtle' : 'bg-error-subtle'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.isCorrect
                      ? <CheckCircle className="w-5 h-5 text-success" />
                      : <XCircle className="w-5 h-5 text-error" />
                    }
                    <span className="font-medium text-text-primary">{result.feedback}</span>
                  </div>
                  {!result.isCorrect && result.correctAnswer && (
                    <p className="text-sm text-text-secondary">
                      Правильный ответ: <strong>{result.correctAnswer}</strong>
                    </p>
                  )}
                  {result.grammarNotes && (
                    <p className="text-sm text-text-secondary mt-2">
                      {result.grammarNotes}
                    </p>
                  )}
                </div>
              )}

              {!result ? (
                <Button onClick={handleSubmitWritten} className="w-full" disabled={!userAnswer.trim() || isLoading}>
                  Проверить
                </Button>
              ) : (
                <Button onClick={handleNext} className="w-full">
                  Следующее
                </Button>
              )}
            </Card>
          )}
        </TabPanel>

        {/* Repeat Aloud */}
        <TabPanel id="repeat_aloud" className="pt-6">
          <Card>
            {exercise?.targetText && (
              <div className="text-center mb-6">
                <p className="text-sm text-text-muted mb-4">Прослушайте и повторите:</p>
                <p className="text-2xl text-text-primary mb-4">
                  {exercise.targetText}
                </p>
                <Button variant="secondary" onClick={() => speak(exercise.targetText!)}>
                  <Volume2 size={16} className="mr-2" />
                  Прослушать
                </Button>
              </div>
            )}

            {!result && (
              <Button
                onClick={handleVoiceInput}
                className={`w-full ${isListening ? 'bg-error hover:bg-error' : ''}`}
                size="lg"
              >
                {isListening
                  ? <><MicOff size={18} className="mr-2" /> Запись...</>
                  : <><Mic size={18} className="mr-2" /> Записать</>
                }
              </Button>
            )}

            {userAnswer && (
              <p className="text-center text-text-secondary mt-4">
                Распознано: {userAnswer}
              </p>
            )}

            {result && (
              <div className="mt-4">
                <div className={`p-4 rounded-lg ${result.isCorrect ? 'bg-success-subtle' : 'bg-warm/10'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-text-primary">{result.feedback}</span>
                    {result.pronunciationScore !== undefined && (
                      <span className="text-2xl font-bold text-accent">
                        {result.pronunciationScore}%
                      </span>
                    )}
                  </div>
                </div>
                <Button onClick={handleNext} className="w-full mt-4">
                  Следующее
                </Button>
              </div>
            )}
          </Card>
        </TabPanel>

        {/* Oral Translation */}
        <TabPanel id="oral_translation" className="pt-6">
          <Card>
            {exercise?.sourceText && (
              <div className="text-center mb-6">
                <p className="text-sm text-text-muted mb-4">Переведите устно:</p>
                <p className="text-2xl text-text-primary mb-4">
                  {exercise.sourceText}
                </p>
              </div>
            )}

            {!result && (
              <Button
                onClick={handleVoiceInput}
                className={`w-full ${isListening ? 'bg-error hover:bg-error' : ''}`}
                size="lg"
              >
                {isListening
                  ? <><MicOff size={18} className="mr-2" /> Запись...</>
                  : <><Mic size={18} className="mr-2" /> Ответить</>
                }
              </Button>
            )}

            {userAnswer && (
              <p className="text-center text-text-secondary mt-4">
                Вы сказали: {userAnswer}
              </p>
            )}

            {result && (
              <div className="mt-4">
                <div className={`p-4 rounded-lg ${result.isCorrect ? 'bg-success-subtle' : 'bg-error-subtle'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.isCorrect
                      ? <CheckCircle className="w-5 h-5 text-success" />
                      : <XCircle className="w-5 h-5 text-error" />
                    }
                    <span className="font-medium text-text-primary">{result.feedback}</span>
                  </div>
                  {result.correctAnswer && (
                    <p className="text-sm text-text-secondary">
                      Эталон: <strong>{result.correctAnswer}</strong>
                    </p>
                  )}
                  {result.pronunciationScore !== undefined && (
                    <p className="text-sm text-text-secondary mt-2">
                      Произношение: {result.pronunciationScore}%
                    </p>
                  )}
                </div>
                <Button onClick={handleNext} className="w-full mt-4">
                  Следующее
                </Button>
              </div>
            )}
          </Card>
        </TabPanel>

        {/* Grammar Dialog */}
        <TabPanel id="grammar_dialog" className="pt-6">
          <Card className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-accent mx-auto mb-4" />
            <p className="text-text-secondary mb-4">
              Мини-диалог с фокусом на {card.topic}
            </p>
            <Button onClick={() => navigate(`/conversation?topic=${encodeURIComponent(card.topic)}`)}>
              Начать диалог
            </Button>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  )
}
