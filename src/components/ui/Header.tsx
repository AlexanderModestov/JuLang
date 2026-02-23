import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Settings } from 'lucide-react'
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
    <header className="bg-primary-900/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left side: Logo or back button + title */}
        <div className="flex items-center gap-2">
          {!isHome && showBack !== false && (
            <button
              onClick={handleBack}
              className="p-1 -ml-1 text-primary-400 hover:text-primary-500 transition-colors"
              aria-label="Назад"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2">
            {isHome ? (
              <span className="text-xl font-semibold tracking-tight text-gradient-cyber">
                JuLang
              </span>
            ) : (
              <span className="text-base font-medium text-primary-100">
                {title || 'JuLang'}
              </span>
            )}
          </Link>
        </div>

        {/* Right side: Language switcher, user name, settings */}
        {profile && (
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <span className="text-sm text-primary-400 hidden sm:inline">
              {profile.name}
            </span>

            <button
              onClick={handleSettingsClick}
              className="p-2 text-primary-400 hover:text-primary-500 hover:bg-white/5 rounded-lg transition-all"
              aria-label="Настройки"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
