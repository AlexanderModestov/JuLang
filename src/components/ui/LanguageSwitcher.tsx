import { useState, useRef, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { languageFlags, languageLabels, type Language } from '@/types'
import { ChevronDown, Check } from 'lucide-react'

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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors text-sm"
        title="Сменить язык"
        aria-label={`Текущий язык: ${languageLabels[currentLanguage]}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base">{languageFlags[currentLanguage]}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 py-1 w-48 bg-surface-1 rounded-xl border border-border-subtle shadow-xl shadow-black/10 z-50 animate-slide-down"
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
                  w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                  ${isCurrentLanguage
                    ? 'bg-accent-subtle text-accent'
                    : 'hover:bg-surface-2'
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
                <span className="flex-1 text-sm text-text-primary">
                  {languageLabels[language]}
                </span>
                {isCurrentLanguage && (
                  <Check className="w-4 h-4 text-accent" />
                )}
                {!isEnabled && (
                  <span className="text-xs text-text-muted">Скоро</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
