import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { languageFlags, languageLabels, type Language } from '@/types'

export default function LanguageSwitcher() {
  const { currentLanguage, currentLevel, setCurrentLanguage, languageSettings } = useAuthContext()
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

  const userLanguages = languageSettings.map((s) => s.language as Language)
  const displayLanguages = userLanguages.length > 0 ? userLanguages : [currentLanguage]

  const handleSelect = async (language: Language) => {
    await setCurrentLanguage(language)
    setIsOpen(false)
  }

  const getLevelForLanguage = (language: Language): string | null => {
    const setting = languageSettings.find((s) => s.language === language)
    return setting ? setting.level : null
  }

  if (displayLanguages.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1">
        <span className="text-base">{languageFlags[currentLanguage]}</span>
        <span className="text-xs font-medium text-primary-400">{currentLevel}</span>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
        title="Сменить язык"
        aria-label={`Текущий язык: ${languageLabels[currentLanguage]} ${currentLevel}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base">{languageFlags[currentLanguage]}</span>
        <span className="text-xs font-medium text-primary-400">{currentLevel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-primary-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 py-1 w-48 bg-primary-800/90 backdrop-blur-xl rounded-lg shadow-glass-lg border border-white/[0.08] z-50 animate-fade-in-down"
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
                  w-full flex items-center gap-3 px-3 py-2 text-left transition-all
                  ${isCurrentLanguage
                    ? 'bg-primary-500/10 text-primary-200'
                    : 'hover:bg-white/5 text-primary-100'
                  }
                `}
                role="option"
                aria-selected={isCurrentLanguage}
              >
                <span className="text-lg">{languageFlags[language]}</span>
                <span className="flex-1 text-sm">
                  {languageLabels[language]}
                </span>
                {level && (
                  <span className="text-xs font-medium text-primary-400 bg-white/5 px-1.5 py-0.5 rounded">
                    {level}
                  </span>
                )}
                {isCurrentLanguage && (
                  <Check className="w-4 h-4 text-primary-500" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
