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
      className={`flex border-b border-gray-200 dark:border-gray-700 ${className}`}
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
        flex items-center gap-2 px-4 py-3 text-sm font-medium
        border-b-2 -mb-px transition-colors
        ${
          isActive
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
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
