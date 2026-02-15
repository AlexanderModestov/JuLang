import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/useAppStore'
import { getAvailableVoices, selectBestVoice } from '@/modules/SpeechService'
import { useSpeech } from '@/hooks/useSpeech'
import { userDataService } from '@/services/userDataService'
import type { Language, LanguageLevel } from '@/types'
import { languageLabels, languageFlags } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

const LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// Languages with full implementation
const IMPLEMENTED_LANGUAGES: Language[] = ['fr', 'en']
const ALL_LANGUAGES: Language[] = ['fr', 'en', 'es', 'de', 'pt']

export default function SettingsScreen() {
  const {
    user,
    profile,
    signOut,
    updateProfile,
    currentLanguage,
    languageSettings,
    refreshLanguageSettings,
  } = useAuthContext()
  const { speakWithPauses } = useSpeech()
  const { settings, updateSettings } = useAppStore()

  const [languageVoices, setLanguageVoices] = useState<SpeechSynthesisVoice[]>([])
  const [bestVoice, setBestVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [editingLevelFor, setEditingLevelFor] = useState<string | null>(null)
  const [showAddLanguage, setShowAddLanguage] = useState(false)
  const [addLanguageStep, setAddLanguageStep] = useState<'select' | 'level'>('select')
  const [selectedNewLanguage, setSelectedNewLanguage] = useState<Language | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const loadVoices = () => {
      const voices = getAvailableVoices(currentLanguage)
      setLanguageVoices(voices)
      setBestVoice(selectBestVoice(voices, currentLanguage))
    }

    loadVoices()

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
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const handleLevelChange = async (language: string, newLevel: LanguageLevel) => {
    if (!user) return
    await userDataService.updateLanguageLevel(user.id, language as Language, newLevel)
    await refreshLanguageSettings()
    setEditingLevelFor(null)
  }

  const handleAddLanguage = async (language: Language, level: LanguageLevel) => {
    if (!user) return
    await userDataService.addLanguage(user.id, language, level)
    // Also add to profile.languages array
    const currentLanguages = (profile?.languages || []) as string[]
    if (!currentLanguages.includes(language)) {
      await updateProfile({ languages: [...currentLanguages, language] })
    }
    await refreshLanguageSettings()
    setShowAddLanguage(false)
    setAddLanguageStep('select')
    setSelectedNewLanguage(null)
  }

  const handleRemoveLanguage = async (language: string) => {
    if (!user) return
    await userDataService.removeLanguage(user.id, language as Language)
    // Remove from profile.languages array
    const currentLanguages = (profile?.languages || []) as string[]
    await updateProfile({ languages: currentLanguages.filter((l) => l !== language) })
    await refreshLanguageSettings()
    setDeleteConfirm(null)
  }

  if (!profile) return null

  const userLanguageCodes = languageSettings.map((s) => s.language)
  const availableToAdd = ALL_LANGUAGES.filter((l) => !userLanguageCodes.includes(l))

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
        <Input
          label="Имя"
          value={profile.name || ''}
          onChange={(e) => updateProfile({ name: e.target.value })}
        />
      </Card>

      {/* My Languages */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Мои языки
        </h3>

        <div className="space-y-3">
          {languageSettings.map((setting) => {
            const lang = setting.language as Language
            const isEditing = editingLevelFor === setting.language
            const isDeleting = deleteConfirm === setting.language

            return (
              <div
                key={setting.language}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{languageFlags[lang]}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {languageLabels[lang]}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">
                    {setting.level}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span>Слов: {setting.words_learned}</span>
                  <span>Грамматика: {setting.grammar_topics_completed}</span>
                </div>

                {/* Level editing */}
                {isEditing && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Выберите уровень:</p>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          onClick={() => handleLevelChange(setting.language, level)}
                          className={`
                            px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                            ${setting.level === level
                              ? 'bg-primary-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }
                          `}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delete confirmation */}
                {isDeleting && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                      Удалить {languageLabels[lang]}? Прогресс сохранится и будет доступен при повторном добавлении.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRemoveLanguage(setting.language)}
                        className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Удалить
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingLevelFor(isEditing ? null : setting.language)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    {isEditing ? 'Отмена' : 'Изменить уровень'}
                  </button>
                  {languageSettings.length > 1 && (
                    <button
                      onClick={() => setDeleteConfirm(isDeleting ? null : setting.language)}
                      className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add language button */}
          {availableToAdd.length > 0 && (
            <button
              onClick={() => { setShowAddLanguage(true); setAddLanguageStep('select') }}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              + Добавить язык
            </button>
          )}
        </div>
      </Card>

      {/* Add language modal */}
      {showAddLanguage && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {addLanguageStep === 'select' ? 'Добавить язык' : `Уровень ${languageLabels[selectedNewLanguage!]}`}
                </h3>
                <button
                  onClick={() => { setShowAddLanguage(false); setSelectedNewLanguage(null); setAddLanguageStep('select') }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {addLanguageStep === 'select' && (
                <div className="space-y-2">
                  {ALL_LANGUAGES.filter((l) => !userLanguageCodes.includes(l)).map((language) => {
                    const isImplemented = IMPLEMENTED_LANGUAGES.includes(language)
                    return (
                      <button
                        key={language}
                        onClick={() => {
                          if (isImplemented) {
                            setSelectedNewLanguage(language)
                            setAddLanguageStep('level')
                          }
                        }}
                        disabled={!isImplemented}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors
                          ${isImplemented
                            ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                          }
                        `}
                      >
                        <span className="text-2xl">{languageFlags[language]}</span>
                        <span className="flex-1 font-medium text-gray-900 dark:text-white">
                          {languageLabels[language]}
                        </span>
                        {!isImplemented && (
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            Скоро
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {addLanguageStep === 'level' && selectedNewLanguage && (
                <div className="space-y-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => handleAddLanguage(selectedNewLanguage, level)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{level}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => { setAddLanguageStep('select'); setSelectedNewLanguage(null) }}
                    className="w-full text-center text-sm text-gray-500 dark:text-gray-400 py-2"
                  >
                    Назад к выбору языка
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              {languageVoices.map((voice) => (
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
            onClick={() => {
              const examples: Record<string, string> = {
                fr: "Bonjour! Comment allez-vous aujourd'hui? J'espère que vous passez une bonne journée.",
                en: "Hello! How are you doing today? I hope you are having a wonderful day.",
                es: "¡Hola! ¿Cómo estás hoy? Espero que estés teniendo un buen día.",
                de: "Hallo! Wie geht es Ihnen heute? Ich hoffe, Sie haben einen schönen Tag.",
                pt: "Olá! Como você está hoje? Espero que esteja tendo um bom dia.",
              }
              speakWithPauses(
                examples[currentLanguage] || examples.en
              )
            }}
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
