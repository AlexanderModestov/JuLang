import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { settings } = useAppStore()

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
      <Header title={getPageTitle()} showBack={!isHome} />

      <main className="flex-1 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-2xl mx-auto px-5 py-6 sm:px-8 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
