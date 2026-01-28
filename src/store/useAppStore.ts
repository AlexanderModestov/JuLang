import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, User, UserProgress } from '@/types'
import { getDefaultPauseTimeout, DEFAULT_SPEECH_SETTINGS } from '@/types'

interface AppState {
  // User
  user: User | null
  progress: UserProgress | null
  isOnboarded: boolean

  // Settings
  settings: AppSettings

  // Actions
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  setProgress: (progress: UserProgress) => void
  updateProgress: (updates: Partial<UserProgress>) => void
  completeOnboarding: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'speechPauseTimeout' | 'speechSettings'>) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  incrementStreak: () => void
  resetStreak: () => void
}

const generateId = () => crypto.randomUUID()

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      user: null,
      progress: null,
      isOnboarded: false,

      settings: {
        theme: 'system',
        voiceSpeed: 1.0,
        notificationsEnabled: true,
        notificationTime: '09:00',
      },

      setUser: (user) => set({ user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...updates, updatedAt: new Date() }
            : null,
        })),

      setProgress: (progress) => set({ progress }),

      updateProgress: (updates) =>
        set((state) => ({
          progress: state.progress ? { ...state.progress, ...updates } : null,
        })),

      completeOnboarding: (userData) => {
        const now = new Date()
        const user: User = {
          id: generateId(),
          ...userData,
          speechPauseTimeout: getDefaultPauseTimeout(userData.frenchLevel),
          speechSettings: { ...DEFAULT_SPEECH_SETTINGS },
          createdAt: now,
          updatedAt: now,
        }

        const progress: UserProgress = {
          userId: user.id,
          totalConversations: 0,
          totalMessagesSent: 0,
          topicsCovered: [],
          grammarCardsMastered: 0,
          currentStreak: 0,
          lastActivityDate: now,
        }

        set({ user, progress, isOnboarded: true })
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      incrementStreak: () =>
        set((state) => {
          if (!state.progress) return state

          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const lastActivity = new Date(state.progress.lastActivityDate)
          lastActivity.setHours(0, 0, 0, 0)

          const daysDiff = Math.floor(
            (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
          )

          let newStreak = state.progress.currentStreak
          if (daysDiff === 1) {
            newStreak += 1
          } else if (daysDiff > 1) {
            newStreak = 1
          }

          return {
            progress: {
              ...state.progress,
              currentStreak: newStreak,
              lastActivityDate: new Date(),
            },
          }
        }),

      resetStreak: () =>
        set((state) => ({
          progress: state.progress
            ? { ...state.progress, currentStreak: 0 }
            : null,
        })),
    }),
    {
      name: 'julang-app-storage',
      onRehydrateStorage: () => (state) => {
        // Migration: add speechPauseTimeout for existing users
        if (state?.user && state.user.speechPauseTimeout === undefined) {
          state.updateUser({
            speechPauseTimeout: getDefaultPauseTimeout(state.user.frenchLevel),
          })
        }
        // Migration: add speechSettings for existing users
        if (state?.user && state.user.speechSettings === undefined) {
          state.updateUser({
            speechSettings: { ...DEFAULT_SPEECH_SETTINGS },
          })
        }
      },
    }
  )
)
