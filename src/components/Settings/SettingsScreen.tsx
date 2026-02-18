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
const IMPLEMENTED_LANGUAGES: Language[] = ['fr', 'en', 'es', 'de', 'pt']
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
      <h1 className="text-2xl font-bold text-white/90 tracking-wide">
        Настройки
      </h1>

      {/* Profile */}
      <Card>
        <h3 className="font-semibold text-white/90 mb-4 tracking-wide">
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
        <h3 className="font-semibold text-white/90 mb-4 tracking-wide">
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
                className="border border-white/[0.08] rounded-xl p-4 bg-white/[0.02]"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{languageFlags[lang]}</span>
                    <span className="font-medium text-white/90">
                      {languageLabels[lang]}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2.5 py-0.5 rounded-lg">
                    {setting.level}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex gap-4 text-sm text-white/40 mb-3">
                  <span>Слов: {setting.words_learned}</span>
                  <span>Грамматика: {setting.grammar_topics_completed}</span>
                </div>

                {/* Level editing */}
                {isEditing && (
                  <div className="mb-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                    <p className="text-sm text-white/40 mb-2">Выберите уровень:</p>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          onClick={() => handleLevelChange(setting.language, level)}
                          className={`
                            px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                            ${setting.level === level
                              ? 'bg-primary-500 text-surface-900 shadow-glow-cyan-sm'
                              : 'bg-white/[0.06] text-white/70 border border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.15]'
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
                  <div className="mb-3 p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl">
                    <p className="text-sm text-danger-400 mb-2">
                      Удалить {languageLabels[lang]}? Прогресс сохранится и будет доступен при повторном добавлении.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRemoveLanguage(setting.language)}
                        className="px-3 py-1.5 text-sm font-medium bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
                      >
                        Удалить
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-sm font-medium bg-white/[0.08] text-white/70 rounded-lg hover:bg-white/[0.12] transition-colors"
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
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {isEditing ? 'Отмена' : 'Изменить уровень'}
                  </button>
                  {languageSettings.length > 1 && (
                    <button
                      onClick={() => setDeleteConfirm(isDeleting ? null : setting.language)}
                      className="text-sm text-danger-400 hover:text-danger-500 transition-colors"
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
              className="w-full py-3 border-2 border-dashed border-white/[0.10] rounded-xl text-white/40 hover:border-primary-500/40 hover:text-primary-400 transition-all"
            >
              + Добавить язык
            </button>
          )}
        </div>
      </Card>

      {/* Add language modal */}
      {showAddLanguage && (
        <div className="fixed inset-0 bg-surface-900/80 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface-700/95 backdrop-blur-2xl border border-white/[0.10] rounded-t-3xl sm:rounded-3xl w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-glass-lg animate-slide-up">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white/90 tracking-wide">
                  {addLanguageStep === 'select' ? 'Добавить язык' : `Уровень ${languageLabels[selectedNewLanguage!]}`}
                </h3>
                <button
                  onClick={() => { setShowAddLanguage(false); setSelectedNewLanguage(null); setAddLanguageStep('select') }}
                  className="text-white/30 hover:text-white/60 p-1.5 hover:bg-white/[0.06] rounded-lg transition-all"
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
                          w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                          ${isImplemented
                            ? 'hover:bg-white/[0.06] cursor-pointer'
                            : 'opacity-30 cursor-not-allowed'
                          }
                        `}
                      >
                        <span className="text-2xl">{languageFlags[language]}</span>
                        <span className="flex-1 font-medium text-white/90">
                          {languageLabels[language]}
                        </span>
                        {!isImplemented && (
                          <span className="text-xs text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-lg">
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
                      className="w-full text-left p-3 rounded-xl border border-white/[0.08] hover:border-primary-500/30 hover:bg-primary-500/5 transition-all"
                    >
                      <span className="font-medium text-white/90">{level}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => { setAddLanguageStep('select'); setSelectedNewLanguage(null) }}
                    className="w-full text-center text-sm text-white/40 py-2 hover:text-white/60 transition-colors"
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
        <h3 className="font-semibold text-white/90 mb-4 tracking-wide">
          Озвучка
        </h3>

        <div className="space-y-4">
          {/* Voice selector */}
          <div>
            <label className="block text-sm font-medium text-white/50 mb-2 tracking-wide">
              Голос
            </label>
            <select
              value={profile.speech_settings.voiceName || ''}
              onChange={(e) => updateProfile({
                speech_settings: { ...profile.speech_settings, voiceName: e.target.value || null }
              })}
              className="w-full px-4 py-2.5 border border-white/[0.10] rounded-xl bg-white/[0.05] backdrop-blur-sm text-white/90 hover:bg-white/[0.07] hover:border-white/[0.15] transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50"
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
            <label className="block text-sm font-medium text-white/50 mb-2 tracking-wide">
              Скорость речи: <span className="text-primary-400">{profile.speech_settings.rate.toFixed(1)}x</span>
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
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>0.5x</span>
              <span>1.5x</span>
            </div>
          </div>

          {/* Pitch slider */}
          <div>
            <label className="block text-sm font-medium text-white/50 mb-2 tracking-wide">
              Высота голоса: <span className="text-primary-400">{profile.speech_settings.pitch.toFixed(1)}x</span>
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
            <div className="flex justify-between text-xs text-white/30 mt-1">
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
        <h3 className="font-semibold text-white/90 mb-4 tracking-wide">
          Голосовой ввод
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/50 mb-2 tracking-wide">
              Пауза для завершения записи: <span className="text-primary-400">{profile.speech_pause_timeout} сек</span>
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
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>1 сек</span>
              <span>15 сек</span>
            </div>
            <p className="text-sm text-white/30 mt-2">
              Чем больше значение, тем дольше можно думать между фразами.
            </p>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <h3 className="font-semibold text-white/90 mb-4 tracking-wide">
          Оформление
        </h3>

        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`
                flex-1 px-4 py-3 rounded-xl font-medium transition-all
                ${
                  settings.theme === theme
                    ? 'bg-primary-500 text-surface-900 shadow-glow-cyan-sm'
                    : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.10] hover:text-white/80 border border-white/[0.06]'
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
        <h3 className="font-semibold text-white/90 mb-4 tracking-wide">
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
      <div className="mt-8 pt-8 border-t border-white/[0.06]">
        <p className="text-sm text-white/30 mb-2">
          Вы вошли как {user?.email}
        </p>
        <button
          onClick={signOut}
          className="w-full px-4 py-3 bg-danger-500/10 border border-danger-500/20 text-danger-400 rounded-xl hover:bg-danger-500/20 hover:border-danger-500/30 transition-all"
        >
          Выйти из аккаунта
        </button>
      </div>

      {/* Version */}
      <div className="text-center text-sm text-white/20 font-medium tracking-wider">
        JULANG v0.1.0
      </div>
    </div>
  )
}
