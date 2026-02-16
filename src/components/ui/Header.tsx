import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { ChevronLeft, Settings } from 'lucide-react'
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
    <header className="bg-surface-1 border-b border-border-subtle px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left side: Logo or back button + title */}
        <div className="flex items-center gap-1.5">
          {!isHome && showBack !== false && (
            <button
              onClick={handleBack}
              className="p-1.5 -ml-1.5 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
              aria-label="Назад"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2">
            {isHome ? (
              <span className="text-lg font-semibold text-text-primary tracking-tight">
                JuLang
              </span>
            ) : (
              <span className="text-sm font-medium text-text-primary">
                {title || 'JuLang'}
              </span>
            )}
          </Link>
        </div>

        {/* Right side: Language switcher, user name, settings */}
        {profile && (
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <span className="text-xs text-text-muted hidden sm:inline">
              {profile.name}
            </span>

            <button
              onClick={handleSettingsClick}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
              aria-label="Настройки"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
