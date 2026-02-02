import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { userDataService } from '@/services/userDataService'
import { ensureCardsForLevel } from '@/modules/GrammarEngine'
import { getDefaultPauseTimeout, DEFAULT_SPEECH_SETTINGS } from '@/types'
import type { FrenchLevel } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

type Step = 'welcome' | 'name' | 'level' | 'creating'

const LEVELS: { value: FrenchLevel; label: string; description: string }[] = [
  { value: 'A1', label: 'A1 - Начинающий', description: 'Знаю базовые фразы и слова' },
  { value: 'A2', label: 'A2 - Элементарный', description: 'Могу общаться на простые темы' },
  { value: 'B1', label: 'B1 - Средний', description: 'Понимаю основное содержание' },
  { value: 'B2', label: 'B2 - Выше среднего', description: 'Свободно общаюсь на большинство тем' },
  { value: 'C1', label: 'C1 - Продвинутый', description: 'Понимаю сложные тексты' },
  { value: 'C2', label: 'C2 - Владение в совершенстве', description: 'Понимаю практически всё' },
]

export default function OnboardingFlow() {
  const { user, refreshProfile } = useAuthContext()
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [level, setLevel] = useState<FrenchLevel>('A1')
  const [error, setError] = useState('')

  const handleComplete = async () => {
    if (!user) return

    setStep('creating')

    try {
      // Create user profile in Supabase
      await userDataService.createProfile(user.id, {
        name: name.trim() || 'Пользователь',
        native_language: 'ru',
        french_level: level,
        preferred_ai_provider: 'openai',
        speech_pause_timeout: getDefaultPauseTimeout(level),
        speech_settings: DEFAULT_SPEECH_SETTINGS,
        is_onboarded: true,
      })

      // Create user progress
      await userDataService.createProgress(user.id)

      // Create initial grammar cards (still uses Dexie, will be updated in Task 12)
      await ensureCardsForLevel(user.id, level)

      // Refresh the auth context to pick up the new profile
      await refreshProfile()
    } catch (err) {
      console.error('Onboarding error:', err)
      setError('Ошибка при настройке. Попробуйте ещё раз.')
      setStep('level')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {step === 'welcome' && (
          <div className="text-center">
            <span className="text-6xl mb-4 block">🇫🇷</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Добро пожаловать в JuLang!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ваш персональный помощник для изучения французского языка
            </p>
            <Button onClick={() => setStep('name')} size="lg" className="w-full">
              Начать
            </Button>
          </div>
        )}

        {step === 'name' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Как вас зовут?
            </h2>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('welcome')}>
                Назад
              </Button>
              <Button onClick={() => setStep('level')} className="flex-1">
                Далее
              </Button>
            </div>
          </div>
        )}

        {step === 'level' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Ваш уровень французского
            </h2>
            <div className="space-y-2 mb-6">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`
                    w-full text-left p-3 rounded-lg border-2 transition-colors
                    ${
                      level === l.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {l.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {l.description}
                  </div>
                </button>
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('name')}>
                Назад
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Завершить
              </Button>
            </div>
          </div>
        )}

        {step === 'creating' && (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600 dark:text-gray-400">
              Создаём карточки грамматики...
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
