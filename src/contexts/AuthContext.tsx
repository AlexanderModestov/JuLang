// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { userDataService } from '../services/userDataService'
import { checkForLocalData, migrateLocalDataToSupabase, clearLocalData } from '../services/migrationService'
import type { Database } from '../types/supabase'
import type { Language, LanguageLevel, LanguageSettingStats } from '../types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProgress = Database['public']['Tables']['user_progress']['Row']

type UserLanguageSettingRow = Database['public']['Tables']['user_language_settings']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  progress: UserProgress | null
  currentLanguage: Language
  currentLevel: LanguageLevel
  currentLanguageStats: LanguageSettingStats
  languageSettings: UserLanguageSettingRow[]
  loading: boolean
  migrating: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateProgress: (updates: Partial<UserProgress>) => Promise<void>
  setCurrentLanguage: (language: Language) => Promise<void>
  refreshLanguageSettings: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [currentLanguage, setCurrentLanguageState] = useState<Language>('fr')
  const [currentLevel, setCurrentLevel] = useState<LanguageLevel>('A1')
  const [currentLanguageStats, setCurrentLanguageStats] = useState<LanguageSettingStats>({
    wordsLearned: 0,
    grammarTopicsCompleted: 0,
    conversationsCount: 0,
    exercisesSolved: 0,
  })
  const [languageSettings, setLanguageSettings] = useState<UserLanguageSettingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentUserIdRef = useRef<string | null>(null)

  // Load language settings and update current level/stats
  const loadLanguageSettings = async (userId: string, language: Language) => {
    try {
      const settings = await userDataService.getLanguageSettings(userId)
      setLanguageSettings(settings)

      const current = settings.find((s) => s.language === language)
      if (current) {
        setCurrentLevel(current.level as LanguageLevel)
        setCurrentLanguageStats({
          wordsLearned: current.words_learned,
          grammarTopicsCompleted: current.grammar_topics_completed,
          conversationsCount: current.conversations_count,
          exercisesSolved: current.exercises_solved,
        })
      } else {
        setCurrentLevel('A1')
        setCurrentLanguageStats({
          wordsLearned: 0,
          grammarTopicsCompleted: 0,
          conversationsCount: 0,
          exercisesSolved: 0,
        })
      }
    } catch (err) {
      console.error('Failed to load language settings:', err)
    }
  }

  // Load user data from Supabase
  const loadUserData = async (userId: string) => {
    try {
      const [profileData, progressData] = await Promise.all([
        userDataService.getProfile(userId),
        userDataService.getProgress(userId),
      ])
      setProfile(profileData)
      setProgress(progressData)
      // Set current language from profile (default to 'fr' if not set)
      const activeLanguage = (profileData?.active_language as Language) || 'fr'
      setCurrentLanguageState(activeLanguage)

      // Load language settings
      await loadLanguageSettings(userId, activeLanguage)
    } catch (err) {
      console.error('Failed to load user data:', err)
      setError('Не удалось загрузить данные пользователя')
      throw err
    }
  }

  // Handle new user sign-in (check for migration)
  const handleSignIn = async (authUser: User) => {
    currentUserIdRef.current = authUser.id
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
    let initialized = false

    // Listen for auth changes - this handles both initial session and subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] onAuthStateChange:', event, { hasUser: !!session?.user, initialized })

        // Handle initial session load
        if (event === 'INITIAL_SESSION') {
          initialized = true
          if (session?.user) {
            console.log('[Auth] INITIAL_SESSION with user, handling sign in...')
            try {
              await handleSignIn(session.user)
              console.log('[Auth] handleSignIn completed')
            } catch (err) {
              console.error('[Auth] Initial session handling failed:', err)
            }
          }
          console.log('[Auth] Setting loading=false after INITIAL_SESSION')
          setLoading(false)
          return
        }

        // Handle new sign-in (OAuth redirect, etc.) - only if not from initial load
        if (event === 'SIGNED_IN' && session?.user) {
          // Skip if this is a duplicate event right after initialization
          if (!initialized) {
            console.log('[Auth] SIGNED_IN before INITIAL_SESSION, waiting...')
            return
          }

          // Check if user already set (avoid re-processing same session)
          if (currentUserIdRef.current === session.user.id) {
            console.log('[Auth] SIGNED_IN for same user, skipping')
            return
          }

          console.log('[Auth] SIGNED_IN event for new session')
          setLoading(true)
          try {
            await handleSignIn(session.user)
            console.log('[Auth] handleSignIn completed')
          } catch (err) {
            console.error('[Auth] Auth state change handling failed:', err)
          } finally {
            console.log('[Auth] Setting loading=false after SIGNED_IN')
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth] SIGNED_OUT event, clearing user data')
          currentUserIdRef.current = null
          setUser(null)
          setProfile(null)
          setProgress(null)
          setLanguageSettings([])
          setCurrentLevel('A1')
          setCurrentLanguageStats({
            wordsLearned: 0,
            grammarTopicsCompleted: 0,
            conversationsCount: 0,
            exercisesSolved: 0,
          })
          setError(null)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] TOKEN_REFRESHED event')
          // Token refreshed, no action needed
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

  const setCurrentLanguage = async (language: Language) => {
    setCurrentLanguageState(language)
    if (user) {
      // Persist to profile
      await userDataService.updateProfile(user.id, { active_language: language })
      setProfile((prev) => prev ? { ...prev, active_language: language } : null)
      // Load level and stats for the new language
      await loadLanguageSettings(user.id, language)
    }
  }

  const refreshLanguageSettings = async () => {
    if (user) {
      await loadLanguageSettings(user.id, currentLanguage)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        progress,
        currentLanguage,
        currentLevel,
        currentLanguageStats,
        languageSettings,
        loading,
        migrating,
        error,
        signInWithGoogle,
        signInWithApple,
        signOut,
        refreshProfile,
        updateProfile,
        updateProgress,
        setCurrentLanguage,
        refreshLanguageSettings,
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
