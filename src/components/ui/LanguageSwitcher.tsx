import { useState, useRef, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { languageFlags, languageLabels, type Language } from '@/types'

export default function LanguageSwitcher() {
  const { currentLanguage, currentLevel, setCurrentLanguage, languageSettings } = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show only languages the user has added
  const userLanguages = languageSettings.map((s) => s.language as Language)
  // Fallback: if no language settings yet, show current language
  const displayLanguages = userLanguages.length > 0 ? userLanguages : [currentLanguage]

  const handleSelect = async (language: Language) => {
    await setCurrentLanguage(language)
    setIsOpen(false)
  }

  // Get level for a specific language from settings
  const getLevelForLanguage = (language: Language): string | null => {
    const setting = languageSettings.find((s) => s.language === language)
    return setting ? setting.level : null
  }

  // Don't show dropdown if user has only one language
  if (displayLanguages.length <= 1) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <span className="text-lg">{languageFlags[currentLanguage]}</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{currentLevel}</span>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Сменить язык"
        aria-label={`Текущий язык: ${languageLabels[currentLanguage]} ${currentLevel}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg">{languageFlags[currentLanguage]}</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{currentLevel}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 py-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          role="listbox"
          aria-label="Выберите язык"
        >
          {displayLanguages.map((language) => {
            const isCurrentLanguage = language === currentLanguage
            const level = getLevelForLanguage(language)

            return (
              <button
                key={language}
                onClick={() => handleSelect(language)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                  ${isCurrentLanguage
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
                role="option"
                aria-selected={isCurrentLanguage}
              >
                <span className="text-xl">{languageFlags[language]}</span>
                <span className="flex-1 text-sm text-gray-900 dark:text-white">
                  {languageLabels[language]}
                </span>
                {level && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    {level}
                  </span>
                )}
                {isCurrentLanguage && (
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
