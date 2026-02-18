import { useState, createContext, useContext, ReactNode } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

interface TabsProps {
  defaultTab: string
  children: ReactNode
  onChange?: (tabId: string) => void
}

export function Tabs({ defaultTab, children, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleTabChange = (id: string) => {
    setActiveTab(id)
    onChange?.(id)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      {children}
    </TabsContext.Provider>
  )
}

interface TabListProps {
  children: ReactNode
  className?: string
}

export function TabList({ children, className = '' }: TabListProps) {
  return (
    <div
      className={`flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] ${className}`}
      role="tablist"
    >
      {children}
    </div>
  )
}

interface TabProps {
  id: string
  children: ReactNode
  icon?: ReactNode
}

export function Tab({ id, children, icon }: TabProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')

  const { activeTab, setActiveTab } = context
  const isActive = activeTab === id

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-4 py-2.5 text-sm font-medium
        rounded-lg transition-all duration-200
        ${
          isActive
            ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30 shadow-glow-cyan-sm'
            : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
        }
      `}
    >
      {icon}
      {children}
    </button>
  )
}

interface TabPanelProps {
  id: string
  children: ReactNode
  className?: string
}

export function TabPanel({ id, children, className = '' }: TabPanelProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabPanel must be used within Tabs')

  const { activeTab } = context

  if (activeTab !== id) return null

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  )
}
