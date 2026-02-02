import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/useAppStore'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { profile, progress } = useAuthContext()
  const { settings } = useAppStore()

  const navItems = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/topics', label: 'Диалог', icon: '💬' },
    { path: '/grammar', label: 'Грамматика', icon: '📖' },
    { path: '/settings', label: 'Настройки', icon: '⚙️' },
  ]

  return (
    <div className={`min-h-screen flex flex-col ${settings.theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🇫🇷</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              JuLang
            </span>
          </Link>

          {profile && (
            <div className="flex items-center gap-4">
              {/* Streak */}
              {progress && progress.current_streak > 0 && (
                <div className="flex items-center gap-1 text-orange-500">
                  <span></span>
                  <span className="font-medium">{progress.current_streak}</span>
                </div>
              )}

              {/* Level badge */}
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full">
                {profile.french_level || 'A1'}
              </span>

              {/* User name */}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {profile.name}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-4">{children}</div>
      </main>

      {/* Bottom navigation */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="max-w-4xl mx-auto flex justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
