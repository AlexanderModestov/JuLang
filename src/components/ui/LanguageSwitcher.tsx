import { useState, useRef, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { languageFlags, languageLabels, type Language } from '@/types'

const AVAILABLE_LANGUAGES: Language[] = ['fr', 'en', 'es', 'de', 'pt']

// Languages with full implementation (vocabulary + grammar data)
const IMPLEMENTED_LANGUAGES: Language[] = ['fr', 'en', 'es', 'de', 'pt']

export default function LanguageSwitcher() {
  const { currentLanguage, setCurrentLanguage, profile } = useAuthContext()
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

  // Get user's languages (or default to all if not set)
  const userLanguages = (profile?.languages as Language[]) || ['fr']

  const handleSelect = async (language: Language) => {
    await setCurrentLanguage(language)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Сменить язык"
        aria-label={`Текущий язык: ${languageLabels[currentLanguage]}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg">{languageFlags[currentLanguage]}</span>
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
          {AVAILABLE_LANGUAGES.map((language) => {
            const isCurrentLanguage = language === currentLanguage
            const isUserLanguage = userLanguages.includes(language)
            const isImplemented = IMPLEMENTED_LANGUAGES.includes(language)
            // Allow selection if language is implemented OR user has it in their profile
            const isEnabled = isImplemented || isUserLanguage

            return (
              <button
                key={language}
                onClick={() => handleSelect(language)}
                disabled={!isEnabled}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                  ${isCurrentLanguage
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                  ${!isEnabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
                role="option"
                aria-selected={isCurrentLanguage}
              >
                <span className="text-xl">{languageFlags[language]}</span>
                <span className="flex-1 text-sm text-gray-900 dark:text-white">
                  {languageLabels[language]}
                </span>
                {isCurrentLanguage && (
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {!isEnabled && (
                  <span className="text-xs text-gray-400">Скоро</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
