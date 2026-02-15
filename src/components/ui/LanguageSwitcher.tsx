import { useState, useRef, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { languageFlags, languageLabels, type Language } from '@/types'

const AVAILABLE_LANGUAGES: Language[] = ['fr', 'en', 'es', 'de', 'pt']
const IMPLEMENTED_LANGUAGES: Language[] = ['fr', 'en', 'es', 'de', 'pt']

export default function LanguageSwitcher() {
  const { currentLanguage, setCurrentLanguage, profile } = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const userLanguages = (profile?.languages as Language[]) || ['fr']

  const handleSelect = async (language: Language) => {
    await setCurrentLanguage(language)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-smooth"
        title="Сменить язык"
        aria-label={`Текущий язык: ${languageLabels[currentLanguage]}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base">{languageFlags[currentLanguage]}</span>
        <svg
          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 py-1.5 w-48 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800/60 shadow-soft-lg z-50 animate-scale-in origin-top-right"
          role="listbox"
          aria-label="Выберите язык"
        >
          {AVAILABLE_LANGUAGES.map((language) => {
            const isCurrentLanguage = language === currentLanguage
            const isUserLanguage = userLanguages.includes(language)
            const isImplemented = IMPLEMENTED_LANGUAGES.includes(language)
            const isEnabled = isImplemented || isUserLanguage

            return (
              <button
                key={language}
                onClick={() => handleSelect(language)}
                disabled={!isEnabled}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2 text-left transition-smooth
                  ${isCurrentLanguage
                    ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                  }
                  ${!isEnabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
                role="option"
                aria-selected={isCurrentLanguage}
              >
                <span className="text-lg">{languageFlags[language]}</span>
                <span className="flex-1 text-sm text-stone-900 dark:text-stone-50">
                  {languageLabels[language]}
                </span>
                {isCurrentLanguage && (
                  <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {!isEnabled && (
                  <span className="text-xs text-stone-400">Скоро</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
