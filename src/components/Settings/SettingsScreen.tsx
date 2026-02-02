import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/useAppStore'
import { getAvailableVoices, selectBestFrenchVoice, speakWithPauses } from '@/modules/SpeechService'
import type { FrenchLevel } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

const LEVELS: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function SettingsScreen() {
  const { user, profile, signOut, updateProfile } = useAuthContext()
  const { settings, updateSettings } = useAppStore()

  const [frenchVoices, setFrenchVoices] = useState<SpeechSynthesisVoice[]>([])
  const [bestVoice, setBestVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    // Load voices (may be async in some browsers)
    const loadVoices = () => {
      const voices = getAvailableVoices('fr')
      setFrenchVoices(voices)
      setBestVoice(selectBestFrenchVoice(voices))
    }

    loadVoices()

    // Some browsers fire voiceschanged event when voices are loaded
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Настройки
      </h1>

      {/* Profile */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Профиль
        </h3>

        <div className="space-y-4">
          <Input
            label="Имя"
            value={profile.name || ''}
            onChange={(e) => updateProfile({ name: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Уровень французского
            </label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => updateProfile({ french_level: level })}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      profile.french_level === level
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Озвучка
        </h3>

        <div className="space-y-4">
          {/* Voice selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Голос
            </label>
            <select
              value={profile.speech_settings.voiceName || ''}
              onChange={(e) => updateProfile({
                speech_settings: { ...profile.speech_settings, voiceName: e.target.value || null }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">
                Автовыбор{bestVoice ? ` (${bestVoice.name})` : ''}
              </option>
              {frenchVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech rate slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5x</span>
              <span>1.5x</span>
            </div>
          </div>

          {/* Pitch slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5x</span>
              <span>1.5x</span>
            </div>
          </div>

          {/* Listen to example button */}
          <Button
            variant="secondary"
            onClick={() => speakWithPauses(
              "Bonjour! Comment allez-vous aujourd'hui? J'espère que vous passez une bonne journée.",
              profile.speech_settings
            )}
          >
            Прослушать пример
          </Button>
        </div>
      </Card>

      {/* Voice input settings */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Голосовой ввод
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Пауза для завершения записи: {profile.speech_pause_timeout} сек
            </label>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={profile.speech_pause_timeout}
              onChange={(e) => updateProfile({ speech_pause_timeout: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 сек</span>
              <span>15 сек</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Чем больше значение, тем дольше можно думать между фразами.
            </p>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Оформление
        </h3>

        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`
                flex-1 px-4 py-3 rounded-lg font-medium transition-colors
                ${
                  settings.theme === theme
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Данные
        </h3>

        <div className="space-y-3">
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
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Вы вошли как {user?.email}
        </p>
        <button
          onClick={signOut}
          className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          Выйти из аккаунта
        </button>
      </div>

      {/* Version */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        JuLang v0.1.0
      </div>
    </div>
  )
}
