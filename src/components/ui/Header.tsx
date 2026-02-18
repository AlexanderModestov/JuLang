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
    <header className="bg-surface-800/60 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left side: Logo or back button + title */}
        <div className="flex items-center gap-2">
          {!isHome && showBack !== false && (
            <button
              onClick={handleBack}
              className="p-1.5 -ml-1 text-white/40 hover:text-primary-400 hover:bg-white/[0.06] rounded-lg transition-all"
              aria-label="Назад"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <Link to="/" className="flex items-center gap-2">
            {isHome ? (
              <span className="text-xl font-bold gradient-text-cyber tracking-wider">
                JULANG
              </span>
            ) : (
              <span className="text-lg font-semibold text-white/90 tracking-wide">
                {title || 'JuLang'}
              </span>
            )}
          </Link>
        </div>

        {/* Right side: Language switcher, user name, settings */}
        {profile && (
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* User name */}
            <span className="text-sm text-white/40 hidden sm:inline font-medium">
              {profile.name}
            </span>

            {/* Settings icon */}
            <button
              onClick={handleSettingsClick}
              className="p-2 text-white/40 hover:text-primary-400 hover:bg-white/[0.06] rounded-lg transition-all"
              aria-label="Настройки"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
