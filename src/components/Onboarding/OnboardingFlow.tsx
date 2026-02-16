import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { userDataService } from '@/services/userDataService'
import { ensureCardsForLevel } from '@/modules/GrammarEngine'
import { getDefaultPauseTimeout, DEFAULT_SPEECH_SETTINGS, languageLabels } from '@/types'
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
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="bg-surface-1 border border-border-subtle rounded-2xl p-8 w-full max-w-md">
        {step === 'welcome' && (
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-accent mb-2 font-sora tracking-tight">
              JuLang
            </h1>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Добро пожаловать!
            </h2>
            <p className="text-text-secondary text-sm mb-8">
              Ваш персональный помощник для изучения языков
            </p>
            <Button onClick={() => setStep('name')} size="lg" className="w-full">
              Начать
            </Button>
          </div>
        )}

        {step === 'name' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Как вас зовут?
            </h2>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              className="mb-6"
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
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Ваш уровень ({languageLabels[currentLanguage]})
            </h2>
            <div className="space-y-2 mb-6">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`
                    w-full text-left p-3 rounded-xl border transition-all duration-200
                    ${
                      level === l.value
                        ? 'border-accent bg-accent/10'
                        : 'border-border-subtle hover:border-border'
                    }
                  `}
                >
                  <div className="font-medium text-text-primary text-sm">
                    {l.label}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {l.description}
                  </div>
                </button>
              ))}
            </div>
            {error && (
              <p className="text-error text-sm mb-4">{error}</p>
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
          <div className="text-center py-8 animate-fade-in">
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
            <p className="text-text-secondary text-sm">
              Создаём карточки грамматики...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
