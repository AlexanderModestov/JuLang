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
      <div className="flex items-center gap-1.5 px-2 py-1">
        <span className="text-lg">{languageFlags[currentLanguage]}</span>
        <span className="text-xs font-semibold text-primary-400">{currentLevel}</span>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
        title="Сменить язык"
        aria-label={`Текущий язык: ${languageLabels[currentLanguage]} ${currentLevel}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg">{languageFlags[currentLanguage]}</span>
        <span className="text-xs font-semibold text-primary-400">{currentLevel}</span>
        <svg
          className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 py-1.5 w-52 bg-surface-700/95 backdrop-blur-2xl rounded-xl shadow-glass-lg border border-white/[0.10] z-50 animate-slide-up"
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
                  w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all
                  ${isCurrentLanguage
                    ? 'bg-primary-500/10 text-primary-300 border-l-2 border-primary-500'
                    : 'hover:bg-white/[0.05] border-l-2 border-transparent'
                  }
                `}
                role="option"
                aria-selected={isCurrentLanguage}
              >
                <span className="text-xl">{languageFlags[language]}</span>
                <span className="flex-1 text-sm text-white/90 font-medium">
                  {languageLabels[language]}
                </span>
                {level && (
                  <span className="text-xs font-semibold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-lg">
                    {level}
                  </span>
                )}
                {isCurrentLanguage && (
                  <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
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
