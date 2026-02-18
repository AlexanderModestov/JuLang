import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

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
    <div className="min-h-screen flex flex-col bg-surface-900 bg-mesh">
      {/* Header */}
      <Header title={getPageTitle()} showBack={!isHome} />

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-4">{children}</div>
      </main>
    </div>
  )
}
