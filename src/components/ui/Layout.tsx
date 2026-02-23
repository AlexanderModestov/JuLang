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
    <div className="dark min-h-screen flex flex-col bg-primary-900">
      {/* Header */}
      <Header title={getPageTitle()} showBack={!isHome} />

      {/* Main content */}
      <main className="flex-1 bg-primary-900 relative">
        {/* Subtle radial glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto p-4 animate-fade-in relative">{children}</div>
      </main>
    </div>
  )
}
