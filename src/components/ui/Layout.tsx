import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { settings } = useAppStore()

  // Bottom nav items - Settings removed, now accessed via Header
  const navItems = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/topics', label: 'Диалог', icon: '💬' },
    { path: '/vocabulary', label: 'Словарь', icon: '🔤' },
    { path: '/grammar', label: 'Грамматика', icon: '📖' },
  ]

  // Get title for current page
  const getPageTitle = (): string | undefined => {
    switch (location.pathname) {
      case '/topics': return 'Темы'
      case '/vocabulary': return 'Словарь'
      case '/grammar': return 'Грамматика'
      case '/exercises': return 'Упражнения'
      case '/settings': return 'Настройки'
      case '/conversation': return 'Разговор'
      default: return undefined
    }
  }

  const isHome = location.pathname === '/'

  return (
    <div className={`min-h-screen flex flex-col ${settings.theme === 'dark' ? 'dark' : ''}`}>
      {/* New unified Header */}
      <Header title={getPageTitle()} showBack={!isHome} />

      {/* Main content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-4">{children}</div>
      </main>

      {/* Bottom navigation - simplified, no Settings */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="max-w-4xl mx-auto flex justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors
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
