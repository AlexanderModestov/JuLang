import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { userDataService } from '@/services/userDataService'
import { ensureCardsForLevel } from '@/modules/GrammarEngine'
import { getDefaultPauseTimeout, DEFAULT_SPEECH_SETTINGS, languageLabels, languageFlags } from '@/types'
import type { FrenchLevel } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

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
  const { user, refreshProfile, currentLanguage } = useAuthContext()
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [level, setLevel] = useState<FrenchLevel>('A1')
  const [error, setError] = useState('')

  const handleComplete = async () => {
    if (!user) return

    setStep('creating')

    try {
      await userDataService.createProfile(user.id, {
        name: name.trim() || 'Пользователь',
        native_language: 'ru',
        french_level: level,
        preferred_ai_provider: 'openai',
        speech_pause_timeout: getDefaultPauseTimeout(level),
        speech_settings: DEFAULT_SPEECH_SETTINGS,
        is_onboarded: true,
      })

      await userDataService.createProgress(user.id)
      await ensureCardsForLevel(user.id, level)
      await refreshProfile()
    } catch (err) {
      console.error('Onboarding error:', err)
      setError('Ошибка при настройке. Попробуйте ещё раз.')
      setStep('level')
    }
  }

  // Progress indicator
  const stepIndex = step === 'welcome' ? 0 : step === 'name' ? 1 : step === 'level' ? 2 : 3
  const totalSteps = 3

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        {step !== 'creating' && (
          <div className="flex gap-1.5 mb-8 px-1 animate-fade-in">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                  i <= stepIndex
                    ? 'bg-stone-900 dark:bg-stone-50'
                    : 'bg-stone-200 dark:bg-stone-800'
                }`}
              />
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-2xl p-6 shadow-soft-md">
          {step === 'welcome' && (
            <div className="text-center animate-fade-in-up">
              <div className="text-4xl mb-5">{languageFlags[currentLanguage]}</div>
              <h1 className="font-display text-display-sm font-semibold text-stone-900 dark:text-stone-50 mb-2">
                Добро пожаловать
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
                Ваш персональный помощник для изучения языков
              </p>
              <Button onClick={() => setStep('name')} size="lg" className="w-full">
                Начать
              </Button>
            </div>
          )}

          {step === 'name' && (
            <div className="animate-fade-in-up">
              <h2 className="font-display text-display-sm font-semibold text-stone-900 dark:text-stone-50 mb-1">
                Как вас зовут?
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                Мы будем обращаться к вам по имени
              </p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
                className="mb-6"
              />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('welcome')}>
                  Назад
                </Button>
                <Button onClick={() => setStep('level')} className="flex-1">
                  Далее
                </Button>
              </div>
            </div>
          )}

          {step === 'level' && (
            <div className="animate-fade-in-up">
              <h2 className="font-display text-display-sm font-semibold text-stone-900 dark:text-stone-50 mb-1">
                Ваш уровень
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-5">
                {languageLabels[currentLanguage]}
              </p>
              <div className="space-y-2 mb-6">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`
                      w-full text-left p-3.5 rounded-xl border transition-smooth
                      ${
                        level === l.value
                          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                      }
                    `}
                  >
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-50">
                      {l.label}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {l.description}
                    </div>
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-danger-500 text-sm mb-4">{error}</p>
              )}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('name')}>
                  Назад
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Завершить
                </Button>
              </div>
            </div>
          )}

          {step === 'creating' && (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-10 h-10 mx-auto border-2 border-stone-200 dark:border-stone-800 border-t-accent-500 rounded-full animate-spin mb-5" />
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Создаём карточки грамматики...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
