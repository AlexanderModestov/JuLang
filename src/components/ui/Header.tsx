import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export default function Header({ title, showBack, onBack }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuthContext()

  const isHome = location.pathname === '/'

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {!isHome && showBack !== false && (
            <button
              onClick={handleBack}
              className="p-1.5 -ml-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-smooth"
              aria-label="Назад"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 group">
            {isHome ? (
              <span className="font-display text-xl font-semibold text-stone-900 dark:text-stone-50 tracking-tight">
                JuLang
              </span>
            ) : (
              <span className="text-base font-medium text-stone-900 dark:text-stone-50">
                {title || 'JuLang'}
              </span>
            )}
          </Link>
        </div>

        {/* Right side */}
        {profile && (
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <span className="text-xs text-stone-400 dark:text-stone-500 hidden sm:inline pl-1">
              {profile.name}
            </span>

            <button
              onClick={handleSettingsClick}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-smooth"
              aria-label="Настройки"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
