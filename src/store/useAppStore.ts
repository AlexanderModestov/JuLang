import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '@/types'

/**
 * App store for UI preferences only.
 *
 * NOTE: User data (profile, progress) is now stored in Supabase and accessed
 * via AuthContext. This store only contains local UI settings that don't need
 * to be synced to the server.
 *
 * For user data, use: const { user, profile, progress } = useAuthContext()
 */
interface AppState {
  // UI Settings (local only, not synced to Supabase)
  settings: AppSettings

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        theme: 'system',
        voiceSpeed: 1.0,
        notificationsEnabled: true,
        notificationTime: '09:00',
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'julang-app-storage',
    }
  )
)
