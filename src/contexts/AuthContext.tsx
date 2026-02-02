// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { userDataService } from '../services/userDataService'
import { checkForLocalData, migrateLocalDataToSupabase, clearLocalData } from '../services/migrationService'
import type { Database } from '../types/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProgress = Database['public']['Tables']['user_progress']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  progress: UserProgress | null
  loading: boolean
  migrating: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateProgress: (updates: Partial<UserProgress>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user data from Supabase
  const loadUserData = async (userId: string) => {
    try {
      const [profileData, progressData] = await Promise.all([
        userDataService.getProfile(userId),
        userDataService.getProgress(userId),
      ])
      setProfile(profileData)
      setProgress(progressData)
    } catch (err) {
      console.error('Failed to load user data:', err)
      setError('Не удалось загрузить данные пользователя')
      throw err
    }
  }

  // Handle new user sign-in (check for migration)
  const handleSignIn = async (authUser: User) => {
    setUser(authUser)
    setError(null)

    try {
      // Check if user has existing profile in Supabase
      const existingProfile = await userDataService.getProfile(authUser.id)

      if (existingProfile) {
        // Returning user - load their data
        await loadUserData(authUser.id)
      } else {
        // New user - check for local data to migrate
        const hasLocalData = await checkForLocalData()

        if (hasLocalData) {
          setMigrating(true)
          try {
            const result = await migrateLocalDataToSupabase(authUser.id)

            if (result.success) {
              await clearLocalData()
              await loadUserData(authUser.id)
            } else {
              setError(`Ошибка миграции: ${result.error}`)
            }
          } finally {
            setMigrating(false)
          }
        }
        // If no local data and no profile, user will go through onboarding
      }
    } catch (err) {
      console.error('Failed to handle sign in:', err)
      setError('Ошибка при входе в систему')
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message)
        setLoading(false)
        return
      }

      try {
        if (session?.user) {
          await handleSignIn(session.user)
        }
      } catch (err) {
        console.error('Initial session handling failed:', err)
      } finally {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true)
          try {
            await handleSignIn(session.user)
          } catch (err) {
            console.error('Auth state change handling failed:', err)
          } finally {
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setProgress(null)
          setError(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (authError) setError(authError.message)
  }

  const signInWithApple = async () => {
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin },
    })
    if (authError) setError(authError.message)
  }

  const signOut = async () => {
    setError(null)
    const { error: authError } = await supabase.auth.signOut()
    if (authError) setError(authError.message)
  }

  const refreshProfile = async () => {
    if (user) {
      try {
        await loadUserData(user.id)
      } catch (err) {
        console.error('Failed to refresh profile:', err)
      }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    const updated = await userDataService.updateProfile(user.id, updates)
    setProfile(updated)
  }

  const updateProgress = async (updates: Partial<UserProgress>) => {
    if (!user) return
    const updated = await userDataService.updateProgress(user.id, updates)
    setProgress(updated)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        progress,
        loading,
        migrating,
        error,
        signInWithGoogle,
        signInWithApple,
        signOut,
        refreshProfile,
        updateProfile,
        updateProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
