import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Context information about the current screen and item being viewed
 */
export interface TeacherChatContext {
  screen: string
  itemId?: string
  itemPreview?: string
}

interface TeacherChatState {
  // Widget state
  isOpen: boolean
  isMinimized: boolean

  // Current context (not persisted)
  currentContext: TeacherChatContext

  // Unread messages counter
  unreadCount: number

  // Actions
  openChat: () => void
  closeChat: () => void
  minimizeChat: () => void
  maximizeChat: () => void
  toggleChat: () => void
  setContext: (context: TeacherChatContext) => void
  clearUnread: () => void
  incrementUnread: () => void
}

/**
 * Default context when no specific screen context is set
 */
const DEFAULT_CONTEXT: TeacherChatContext = {
  screen: 'home',
}

export const useTeacherChatStore = create<TeacherChatState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isMinimized: false,
      currentContext: DEFAULT_CONTEXT,
      unreadCount: 0,

      openChat: () => set({ isOpen: true, isMinimized: false }),

      closeChat: () => set({ isOpen: false, isMinimized: false }),

      minimizeChat: () => set({ isMinimized: true }),

      maximizeChat: () => set({ isMinimized: false }),

      toggleChat: () => {
        const state = get()
        if (state.isOpen && !state.isMinimized) {
          // Open and maximized -> minimize
          set({ isMinimized: true })
        } else if (state.isOpen && state.isMinimized) {
          // Open and minimized -> maximize
          set({ isMinimized: false })
        } else {
          // Closed -> open
          set({ isOpen: true, isMinimized: false })
        }
      },

      setContext: (context) => set({ currentContext: context }),

      clearUnread: () => set({ unreadCount: 0 }),

      incrementUnread: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),
    }),
    {
      name: 'julang-teacher-chat-storage',
      // Only persist isOpen and isMinimized, not context or unreadCount
      partialize: (state) => ({
        isOpen: state.isOpen,
        isMinimized: state.isMinimized,
      }),
    }
  )
)

/**
 * Hook for screens to provide context to the teacher chat.
 * Sets the context when the component mounts and clears it on unmount.
 *
 * @example
 * // In a grammar card detail screen:
 * useTeacherContext({
 *   screen: 'grammar',
 *   itemId: currentCard.id,
 *   itemPreview: currentCard.topic
 * });
 *
 * // In a conversation screen:
 * useTeacherContext({
 *   screen: 'conversation',
 *   itemId: conversationId,
 *   itemPreview: topic
 * });
 */
export function useTeacherContext(context: TeacherChatContext): void {
  const setContext = useTeacherChatStore((state) => state.setContext)

  useEffect(() => {
    setContext(context)

    // Reset to default context when component unmounts
    return () => {
      setContext(DEFAULT_CONTEXT)
    }
  }, [context.screen, context.itemId, context.itemPreview, setContext])
}
