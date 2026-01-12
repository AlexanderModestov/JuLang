import { useAppStore } from '@/store/useAppStore'
import { getAvailableVoices } from '@/modules/SpeechService'
import type { FrenchLevel } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

const LEVELS: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function SettingsScreen() {
  const { user, settings, updateUser, updateSettings } = useAppStore()

  const frenchVoices = getAvailableVoices('fr')

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

  if (!user) return null

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
            value={user.name}
            onChange={(e) => updateUser({ name: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Уровень французского
            </label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => updateUser({ frenchLevel: level })}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      user.frenchLevel === level
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

      {/* Voice settings */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Голосовые настройки
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Скорость речи: {settings.voiceSpeed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voiceSpeed}
              onChange={(e) => updateSettings({ voiceSpeed: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {frenchVoices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Голос
              </label>
              <select
                value={settings.selectedVoice || ''}
                onChange={(e) => updateSettings({ selectedVoice: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">По умолчанию</option>
                {frenchVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
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

      {/* Version */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        JuLang v0.1.0
      </div>
    </div>
  )
}
