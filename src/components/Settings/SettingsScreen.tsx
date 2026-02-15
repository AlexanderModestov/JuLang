import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/useAppStore'
import { getAvailableVoices, selectBestVoice, speakWithPauses } from '@/modules/SpeechService'
import type { FrenchLevel } from '@/types'
import { languageLabels } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

const LEVELS: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function SettingsScreen() {
  const { user, profile, signOut, updateProfile, currentLanguage } = useAuthContext()
  const { settings, updateSettings } = useAppStore()

  const [languageVoices, setLanguageVoices] = useState<SpeechSynthesisVoice[]>([])
  const [bestVoice, setBestVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    // Load voices for current language (may be async in some browsers)
    const loadVoices = () => {
      const voices = getAvailableVoices(currentLanguage)
      setLanguageVoices(voices)
      setBestVoice(selectBestVoice(voices, currentLanguage))
    }

    loadVoices()

    // Some browsers fire voiceschanged event when voices are loaded
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [currentLanguage])

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme })
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  if (!profile) return null

  return (
    <div className="space-y-8 stagger-children">
      {/* Header */}
      <div>
        <h1 className="font-display text-display-md font-semibold text-stone-900 dark:text-stone-50">
          Настройки
        </h1>
      </div>

      {/* Profile */}
      <Card>
        <h3 className="text-sm font-medium text-stone-900 dark:text-stone-50 mb-5">
          Профиль
        </h3>

        <div className="space-y-5">
          <Input
            label="Имя"
            value={profile.name || ''}
            onChange={(e) => updateProfile({ name: e.target.value })}
          />

          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400 mb-3">
              Уровень ({languageLabels[currentLanguage]})
            </label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => updateProfile({ french_level: level })}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-smooth active:scale-[0.98]
                    ${
                      profile.french_level === level
                        ? 'bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Voice settings (TTS) */}
      <Card>
        <h3 className="text-sm font-medium text-stone-900 dark:text-stone-50 mb-5">
          Озвучка
        </h3>

        <div className="space-y-5">
          {/* Voice selector */}
          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400 mb-2">
              Голос
            </label>
            <select
              value={profile.speech_settings.voiceName || ''}
              onChange={(e) => updateProfile({
                speech_settings: { ...profile.speech_settings, voiceName: e.target.value || null }
              })}
              className="w-full px-4 py-2.5 text-sm border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 transition-smooth hover:border-stone-300 dark:hover:border-stone-700 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
            >
              <option value="">
                Автовыбор{bestVoice ? ` (${bestVoice.name})` : ''}
              </option>
              {languageVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech rate slider */}
          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400 mb-2">
              Скорость речи: {profile.speech_settings.rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={profile.speech_settings.rate}
              onChange={(e) => updateProfile({
                speech_settings: { ...profile.speech_settings, rate: parseFloat(e.target.value) }
              })}
              className="w-full accent-accent-500"
            />
            <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500 mt-1.5">
              <span>0.5x</span>
              <span>1.5x</span>
            </div>
          </div>

          {/* Pitch slider */}
          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400 mb-2">
              Высота голоса: {profile.speech_settings.pitch.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={profile.speech_settings.pitch}
              onChange={(e) => updateProfile({
                speech_settings: { ...profile.speech_settings, pitch: parseFloat(e.target.value) }
              })}
              className="w-full accent-accent-500"
            />
            <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500 mt-1.5">
              <span>0.5x</span>
              <span>1.5x</span>
            </div>
          </div>

          {/* Listen to example button */}
          <Button
            variant="secondary"
            onClick={() => {
              const examples: Record<string, string> = {
                fr: "Bonjour! Comment allez-vous aujourd'hui? J'espère que vous passez une bonne journée.",
                en: "Hello! How are you doing today? I hope you are having a wonderful day.",
                es: "¡Hola! ¿Cómo estás hoy? Espero que estés teniendo un buen día.",
                de: "Hallo! Wie geht es Ihnen heute? Ich hoffe, Sie haben einen schönen Tag.",
                pt: "Olá! Como você está hoje? Espero que esteja tendo um bom dia.",
              }
              speakWithPauses(
                examples[currentLanguage] || examples.en,
                profile.speech_settings,
                currentLanguage
              )
            }}
          >
            Прослушать пример
          </Button>
        </div>
      </Card>

      {/* Voice input settings */}
      <Card>
        <h3 className="text-sm font-medium text-stone-900 dark:text-stone-50 mb-5">
          Голосовой ввод
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400 mb-2">
              Пауза для завершения записи: {profile.speech_pause_timeout} сек
            </label>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={profile.speech_pause_timeout}
              onChange={(e) => updateProfile({ speech_pause_timeout: parseInt(e.target.value) })}
              className="w-full accent-accent-500"
            />
            <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500 mt-1.5">
              <span>1 сек</span>
              <span>15 сек</span>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-3 leading-relaxed">
              Чем больше значение, тем дольше можно думать между фразами.
            </p>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <h3 className="text-sm font-medium text-stone-900 dark:text-stone-50 mb-5">
          Оформление
        </h3>

        <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`
                flex-1 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-smooth active:scale-[0.98]
                ${
                  settings.theme === theme
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-50 shadow-soft'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }
              `}
            >
              {theme === 'light' && 'Светлая'}
              {theme === 'dark' && 'Тёмная'}
              {theme === 'system' && 'Системная'}
            </button>
          ))}
        </div>
      </Card>

      {/* Data */}
      <Card>
        <h3 className="text-sm font-medium text-stone-900 dark:text-stone-50 mb-5">
          Данные
        </h3>

        <div className="space-y-2.5">
          <Button variant="secondary" className="w-full">
            Экспортировать данные
          </Button>
          <Button variant="secondary" className="w-full">
            Импортировать данные
          </Button>
          <Button variant="danger" className="w-full">
            Удалить все данные
          </Button>
        </div>
      </Card>

      {/* Sign out */}
      <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800/60">
        <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">
          Вы вошли как {user?.email}
        </p>
        <button
          onClick={signOut}
          className="w-full px-4 py-3 bg-danger-50 dark:bg-red-900/20 text-danger-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-smooth active:scale-[0.98]"
        >
          Выйти из аккаунта
        </button>
      </div>

      {/* Version */}
      <div className="text-center text-xs text-stone-400 dark:text-stone-500 pb-4">
        JuLang v0.1.0
      </div>
    </div>
  )
}
