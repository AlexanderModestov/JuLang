# Supabase Authentication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Google and Apple authentication via Supabase, migrate local data to cloud, and switch to cloud-only storage.

**Architecture:** Auth gates the app before any content. On first sign-in, migrate existing IndexedDB/Zustand data to Supabase. After auth, all reads/writes go directly to Supabase (no local storage).

**Tech Stack:** Supabase Auth, @supabase/supabase-js, React hooks, TypeScript

---

## Prerequisites (Manual Steps)

Before starting implementation, complete these in Supabase Dashboard:

1. Create Supabase project at https://supabase.com
2. Enable Google OAuth provider (requires Google Cloud Console credentials)
3. Enable Apple OAuth provider (requires Apple Developer credentials)
4. Configure redirect URLs:
   - `http://localhost:1420` (dev)
   - Your production domain (prod)
5. Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`

---

## Task 1: Add Supabase Dependencies and Environment Config

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `.env.example`
- Modify: `.gitignore`

**Step 1: Install Supabase client**

Run:
```bash
npm install @supabase/supabase-js
```

Expected: Package added to package.json

**Step 2: Create .env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 3: Update .gitignore to ensure .env is ignored**

Verify `.env` and `.env.local` are already in `.gitignore` (they are).

**Step 4: Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 5: Verify build still passes**

Run: `npm run build`
Expected: Build succeeds (will fail at runtime without env vars, but compiles)

**Step 6: Commit**

```bash
git add src/lib/supabase.ts .env.example
git commit -m "feat: add Supabase client and environment config"
```

---

## Task 2: Create Database Schema in Supabase

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Create migrations directory**

```bash
mkdir -p supabase/migrations
```

**Step 2: Write initial schema migration**

```sql
-- supabase/migrations/001_initial_schema.sql

-- User profiles (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  native_language TEXT DEFAULT 'ru',
  french_level TEXT CHECK (french_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  preferred_ai_provider TEXT DEFAULT 'openai',
  speech_pause_timeout INTEGER DEFAULT 5,
  speech_settings JSONB DEFAULT '{"voiceName": null, "rate": 0.9, "pitch": 1.0}',
  topics_of_interest JSONB DEFAULT '[]',
  is_onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User progress (stats and streaks)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_conversations INTEGER DEFAULT 0,
  total_messages_sent INTEGER DEFAULT 0,
  topics_covered JSONB DEFAULT '[]',
  grammar_cards_mastered INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Grammar cards (SRS state)
CREATE TABLE grammar_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  level TEXT NOT NULL,
  explanation TEXT,
  examples JSONB DEFAULT '[]',
  common_mistakes JSONB DEFAULT '[]',
  is_enhanced BOOLEAN DEFAULT false,
  enhanced_explanation TEXT,
  next_review TIMESTAMPTZ DEFAULT now(),
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  practice_stats JSONB DEFAULT '{"written_translation":{"attempts":0,"correct":0},"repeat_aloud":{"attempts":0,"avgPronunciationScore":0},"oral_translation":{"attempts":0,"correct":0,"avgPronunciationScore":0},"grammar_dialog":{"sessions":0,"totalMessages":0,"grammarUsageRate":0}}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Vocabulary progress (SRS state)
CREATE TABLE vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id TEXT NOT NULL,
  next_review TIMESTAMPTZ DEFAULT now(),
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT,
  ai_provider TEXT,
  mode TEXT DEFAULT 'text',
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER DEFAULT 0,
  messages JSONB DEFAULT '[]',
  quality_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Practice sessions
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id TEXT NOT NULL,
  practice_type TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  exercises_completed INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  avg_pronunciation_score REAL,
  final_quality INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teacher chat messages
CREATE TABLE teacher_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies: user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: grammar_cards
CREATE POLICY "Users can view own grammar cards" ON grammar_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own grammar cards" ON grammar_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own grammar cards" ON grammar_cards
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own grammar cards" ON grammar_cards
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: vocabulary_progress
CREATE POLICY "Users can view own vocabulary" ON vocabulary_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vocabulary" ON vocabulary_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vocabulary" ON vocabulary_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vocabulary" ON vocabulary_progress
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: practice_sessions
CREATE POLICY "Users can view own practice sessions" ON practice_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own practice sessions" ON practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own practice sessions" ON practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: teacher_messages
CREATE POLICY "Users can view own teacher messages" ON teacher_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own teacher messages" ON teacher_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own teacher messages" ON teacher_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_grammar_cards_user_id ON grammar_cards(user_id);
CREATE INDEX idx_grammar_cards_next_review ON grammar_cards(user_id, next_review);
CREATE INDEX idx_vocabulary_progress_user_id ON vocabulary_progress(user_id);
CREATE INDEX idx_vocabulary_progress_next_review ON vocabulary_progress(user_id, next_review);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_teacher_messages_user_id ON teacher_messages(user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER grammar_cards_updated_at
  BEFORE UPDATE ON grammar_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vocabulary_progress_updated_at
  BEFORE UPDATE ON vocabulary_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase database schema with RLS policies"
```

**Note:** Run this migration in Supabase Dashboard SQL Editor or via Supabase CLI.

---

## Task 3: Create Supabase TypeScript Types

**Files:**
- Create: `src/types/supabase.ts`

**Step 1: Create type definitions matching the schema**

```typescript
// src/types/supabase.ts
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          name: string | null
          native_language: string
          french_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          preferred_ai_provider: string
          speech_pause_timeout: number
          speech_settings: {
            voiceName: string | null
            rate: number
            pitch: number
          }
          topics_of_interest: string[]
          is_onboarded: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['user_profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          total_conversations: number
          total_messages_sent: number
          topics_covered: string[]
          grammar_cards_mastered: number
          current_streak: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['user_progress']['Row']> & { user_id: string }
        Update: Partial<Database['public']['Tables']['user_progress']['Row']>
      }
      grammar_cards: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          topic: string
          level: string
          explanation: string | null
          examples: Array<{ fr: string; ru: string }>
          common_mistakes: string[]
          is_enhanced: boolean
          enhanced_explanation: string | null
          next_review: string
          ease_factor: number
          interval: number
          repetitions: number
          last_reviewed: string | null
          practice_stats: {
            written_translation: { attempts: number; correct: number; lastAttempt?: string }
            repeat_aloud: { attempts: number; avgPronunciationScore: number; lastAttempt?: string }
            oral_translation: { attempts: number; correct: number; avgPronunciationScore: number; lastAttempt?: string }
            grammar_dialog: { sessions: number; totalMessages: number; grammarUsageRate: number; lastSession?: string }
          }
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['grammar_cards']['Row']> & { user_id: string; topic_id: string; topic: string; level: string }
        Update: Partial<Database['public']['Tables']['grammar_cards']['Row']>
      }
      vocabulary_progress: {
        Row: {
          id: string
          user_id: string
          card_id: string
          next_review: string
          ease_factor: number
          interval: number
          repetitions: number
          last_reviewed: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vocabulary_progress']['Row']> & { user_id: string; card_id: string }
        Update: Partial<Database['public']['Tables']['vocabulary_progress']['Row']>
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          topic_id: string | null
          ai_provider: string | null
          mode: string
          started_at: string
          ended_at: string | null
          duration_ms: number
          messages: Array<{
            id: string
            role: 'user' | 'assistant'
            content: string
            timestamp: string
            audioUrl?: string
          }>
          quality_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['conversations']['Row']> & { user_id: string }
        Update: Partial<Database['public']['Tables']['conversations']['Row']>
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          card_id: string
          practice_type: string
          started_at: string
          ended_at: string | null
          exercises_completed: number
          correct_answers: number
          avg_pronunciation_score: number | null
          final_quality: number | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['practice_sessions']['Row']> & { user_id: string; card_id: string; practice_type: string }
        Update: Partial<Database['public']['Tables']['practice_sessions']['Row']>
      }
      teacher_messages: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          context: {
            screen: string
            itemId?: string
            itemPreview?: string
          }
          timestamp: string
        }
        Insert: Partial<Database['public']['Tables']['teacher_messages']['Row']> & { user_id: string; role: 'user' | 'assistant'; content: string }
        Update: Partial<Database['public']['Tables']['teacher_messages']['Row']>
      }
    }
  }
}
```

**Step 2: Update Supabase client with types**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/types/supabase.ts src/lib/supabase.ts
git commit -m "feat: add Supabase TypeScript types"
```

---

## Task 4: Create Auth Hook

**Files:**
- Create: `src/hooks/useAuth.ts`

**Step 1: Create the auth hook**

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: AuthError | null
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error)
      }
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setError(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) setError(error)
  }

  const signInWithApple = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) setError(error)
  }

  const signOut = async () => {
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) setError(error)
  }

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithApple,
    signOut,
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/hooks/useAuth.ts
git commit -m "feat: add useAuth hook for Supabase authentication"
```

---

## Task 5: Create Auth Screen Component

**Files:**
- Create: `src/components/Auth/AuthScreen.tsx`
- Create: `src/components/Auth/index.ts`

**Step 1: Create the auth screen component**

```typescript
// src/components/Auth/AuthScreen.tsx
import { useAuth } from '../../hooks/useAuth'

export default function AuthScreen() {
  const { signInWithGoogle, signInWithApple, error, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🇫🇷</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">JuLang</h1>
          <p className="text-gray-600">Изучай французский легко</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        )}

        {/* Sign In Buttons */}
        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 font-medium">Войти через Google</span>
          </button>

          <button
            onClick={signInWithApple}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="font-medium">Войти через Apple</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Продолжая, вы соглашаетесь с{' '}
            <a href="#" className="text-blue-600 hover:underline">условиями использования</a>
            {' '}и{' '}
            <a href="#" className="text-blue-600 hover:underline">политикой конфиденциальности</a>
          </p>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Create index export**

```typescript
// src/components/Auth/index.ts
export { default as AuthScreen } from './AuthScreen'
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/Auth/
git commit -m "feat: add AuthScreen component with Google and Apple sign-in"
```

---

## Task 6: Create User Data Service

**Files:**
- Create: `src/services/userDataService.ts`

**Step 1: Create the user data service**

```typescript
// src/services/userDataService.ts
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProgress = Database['public']['Tables']['user_progress']['Row']
type GrammarCard = Database['public']['Tables']['grammar_cards']['Row']
type VocabularyProgress = Database['public']['Tables']['vocabulary_progress']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type PracticeSession = Database['public']['Tables']['practice_sessions']['Row']
type TeacherMessage = Database['public']['Tables']['teacher_messages']['Row']

export const userDataService = {
  // ============ User Profile ============
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  },

  async createProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({ id: userId, ...profile })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ User Progress ============
  async getProgress(userId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createProgress(userId: string): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({ user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ Grammar Cards ============
  async getGrammarCards(userId: string): Promise<GrammarCard[]> {
    const { data, error } = await supabase
      .from('grammar_cards')
      .select('*')
      .eq('user_id', userId)
      .order('next_review', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getGrammarCard(cardId: string): Promise<GrammarCard | null> {
    const { data, error } = await supabase
      .from('grammar_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getGrammarCardsDue(userId: string): Promise<GrammarCard[]> {
    const { data, error } = await supabase
      .from('grammar_cards')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createGrammarCard(card: Database['public']['Tables']['grammar_cards']['Insert']): Promise<GrammarCard> {
    const { data, error } = await supabase
      .from('grammar_cards')
      .insert(card)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateGrammarCard(cardId: string, updates: Partial<GrammarCard>): Promise<GrammarCard> {
    const { data, error } = await supabase
      .from('grammar_cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteGrammarCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('grammar_cards')
      .delete()
      .eq('id', cardId)

    if (error) throw error
  },

  // ============ Vocabulary Progress ============
  async getVocabularyProgress(userId: string): Promise<VocabularyProgress[]> {
    const { data, error } = await supabase
      .from('vocabulary_progress')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  },

  async getVocabularyProgressByCardId(userId: string, cardId: string): Promise<VocabularyProgress | null> {
    const { data, error } = await supabase
      .from('vocabulary_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getVocabularyDue(userId: string): Promise<VocabularyProgress[]> {
    const { data, error } = await supabase
      .from('vocabulary_progress')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createVocabularyProgress(progress: Database['public']['Tables']['vocabulary_progress']['Insert']): Promise<VocabularyProgress> {
    const { data, error } = await supabase
      .from('vocabulary_progress')
      .insert(progress)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateVocabularyProgress(progressId: string, updates: Partial<VocabularyProgress>): Promise<VocabularyProgress> {
    const { data, error } = await supabase
      .from('vocabulary_progress')
      .update(updates)
      .eq('id', progressId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ Conversations ============
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createConversation(conversation: Database['public']['Tables']['conversations']['Insert']): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ Practice Sessions ============
  async getPracticeSessions(userId: string, cardId?: string): Promise<PracticeSession[]> {
    let query = supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (cardId) {
      query = query.eq('card_id', cardId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createPracticeSession(session: Database['public']['Tables']['practice_sessions']['Insert']): Promise<PracticeSession> {
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updatePracticeSession(sessionId: string, updates: Partial<PracticeSession>): Promise<PracticeSession> {
    const { data, error } = await supabase
      .from('practice_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ Teacher Messages ============
  async getTeacherMessages(userId: string, limit = 50, offset = 0): Promise<TeacherMessage[]> {
    const { data, error } = await supabase
      .from('teacher_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return (data || []).reverse()
  },

  async createTeacherMessage(message: Database['public']['Tables']['teacher_messages']['Insert']): Promise<TeacherMessage> {
    const { data, error } = await supabase
      .from('teacher_messages')
      .insert(message)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async clearTeacherMessages(userId: string): Promise<void> {
    const { error } = await supabase
      .from('teacher_messages')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  },

  async getTeacherMessageCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('teacher_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    return count || 0
  },
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/services/userDataService.ts
git commit -m "feat: add userDataService for Supabase CRUD operations"
```

---

## Task 7: Create Migration Service

**Files:**
- Create: `src/services/migrationService.ts`

**Step 1: Create the migration service**

```typescript
// src/services/migrationService.ts
import { db } from '../db'
import { userDataService } from './userDataService'
import { useAppStore } from '../store/useAppStore'

interface MigrationResult {
  success: boolean
  error?: string
  stats: {
    profile: boolean
    progress: boolean
    grammarCards: number
    vocabularyProgress: number
    conversations: number
    practiceSessions: number
    teacherMessages: number
  }
}

export async function checkForLocalData(): Promise<boolean> {
  const appState = useAppStore.getState()

  // Check Zustand persisted state
  if (appState.isOnboarded && appState.user) {
    return true
  }

  // Check IndexedDB for any data
  const [grammarCards, conversations, vocabularyProgress] = await Promise.all([
    db.grammarCards.count(),
    db.conversations.count(),
    db.vocabularyProgress.count(),
  ])

  return grammarCards > 0 || conversations > 0 || vocabularyProgress > 0
}

export async function migrateLocalDataToSupabase(userId: string): Promise<MigrationResult> {
  const stats: MigrationResult['stats'] = {
    profile: false,
    progress: false,
    grammarCards: 0,
    vocabularyProgress: 0,
    conversations: 0,
    practiceSessions: 0,
    teacherMessages: 0,
  }

  try {
    const appState = useAppStore.getState()

    // 1. Migrate user profile
    if (appState.user && appState.isOnboarded) {
      const existingProfile = await userDataService.getProfile(userId)

      if (!existingProfile) {
        await userDataService.createProfile(userId, {
          name: appState.user.name,
          native_language: appState.user.nativeLanguage,
          french_level: appState.user.frenchLevel,
          preferred_ai_provider: appState.user.preferredAiProvider,
          speech_pause_timeout: appState.user.speechPauseTimeout,
          speech_settings: appState.user.speechSettings,
          is_onboarded: true,
        })
        stats.profile = true
      }
    }

    // 2. Migrate user progress
    if (appState.progress) {
      const existingProgress = await userDataService.getProgress(userId)

      if (!existingProgress) {
        await userDataService.createProgress(userId)
        await userDataService.updateProgress(userId, {
          total_conversations: appState.progress.totalConversations,
          total_messages_sent: appState.progress.totalMessagesSent,
          topics_covered: appState.progress.topicsCovered,
          grammar_cards_mastered: appState.progress.grammarCardsMastered,
          current_streak: appState.progress.currentStreak,
          last_activity_date: appState.progress.lastActivityDate
            ? new Date(appState.progress.lastActivityDate).toISOString().split('T')[0]
            : null,
        })
        stats.progress = true
      }
    }

    // 3. Migrate grammar cards
    const localGrammarCards = await db.grammarCards.toArray()
    for (const card of localGrammarCards) {
      try {
        await userDataService.createGrammarCard({
          user_id: userId,
          topic_id: card.topicId,
          topic: card.topic,
          level: card.level,
          explanation: card.explanation,
          examples: card.examples,
          common_mistakes: card.commonMistakes,
          is_enhanced: card.isEnhanced,
          enhanced_explanation: card.enhancedExplanation,
          next_review: card.nextReview.toISOString(),
          ease_factor: card.easeFactor,
          interval: card.interval,
          repetitions: card.repetitions,
          last_reviewed: card.lastReviewed?.toISOString(),
          practice_stats: card.practiceStats,
        })
        stats.grammarCards++
      } catch (err) {
        // Skip duplicates (unique constraint on user_id + topic_id)
        console.warn('Skipping duplicate grammar card:', card.topicId)
      }
    }

    // 4. Migrate vocabulary progress
    const localVocabProgress = await db.vocabularyProgress.toArray()
    for (const progress of localVocabProgress) {
      try {
        await userDataService.createVocabularyProgress({
          user_id: userId,
          card_id: progress.cardId,
          next_review: progress.nextReview.toISOString(),
          ease_factor: progress.easeFactor,
          interval: progress.interval,
          repetitions: progress.repetitions,
          last_reviewed: progress.lastReviewed?.toISOString(),
        })
        stats.vocabularyProgress++
      } catch (err) {
        // Skip duplicates
        console.warn('Skipping duplicate vocabulary progress:', progress.cardId)
      }
    }

    // 5. Migrate conversations
    const localConversations = await db.conversations.toArray()
    for (const conv of localConversations) {
      try {
        await userDataService.createConversation({
          user_id: userId,
          topic_id: conv.topicId,
          ai_provider: conv.aiProvider,
          mode: conv.mode,
          started_at: conv.startedAt.toISOString(),
          ended_at: conv.endedAt?.toISOString(),
          duration_ms: conv.durationMs || 0,
          messages: conv.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
            audioUrl: m.audioUrl,
          })),
          quality_score: conv.qualityScore,
        })
        stats.conversations++
      } catch (err) {
        console.warn('Failed to migrate conversation:', conv.id, err)
      }
    }

    // 6. Migrate practice sessions
    const localPracticeSessions = await db.practiceSessions.toArray()
    for (const session of localPracticeSessions) {
      try {
        await userDataService.createPracticeSession({
          user_id: userId,
          card_id: session.cardId,
          practice_type: session.practiceType,
          started_at: session.startedAt.toISOString(),
          ended_at: session.endedAt?.toISOString(),
          exercises_completed: session.exercisesCompleted,
          correct_answers: session.correctAnswers,
          avg_pronunciation_score: session.avgPronunciationScore,
          final_quality: session.finalQuality,
        })
        stats.practiceSessions++
      } catch (err) {
        console.warn('Failed to migrate practice session:', session.id, err)
      }
    }

    // 7. Migrate teacher messages
    const localTeacherMessages = await db.teacherMessages.toArray()
    for (const msg of localTeacherMessages) {
      try {
        await userDataService.createTeacherMessage({
          user_id: userId,
          role: msg.role,
          content: msg.content,
          context: msg.context,
        })
        stats.teacherMessages++
      } catch (err) {
        console.warn('Failed to migrate teacher message:', msg.id, err)
      }
    }

    return { success: true, stats }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stats,
    }
  }
}

export async function clearLocalData(): Promise<void> {
  // Clear IndexedDB
  await Promise.all([
    db.grammarCards.clear(),
    db.conversations.clear(),
    db.vocabularyProgress.clear(),
    db.practiceSessions.clear(),
    db.teacherMessages.clear(),
    db.topics.clear(),
  ])

  // Clear Zustand persisted state
  localStorage.removeItem('julang-app-storage')
  localStorage.removeItem('julang-teacher-chat-storage')
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/services/migrationService.ts
git commit -m "feat: add migrationService for local to Supabase data migration"
```

---

## Task 8: Create Auth Context and Provider

**Files:**
- Create: `src/contexts/AuthContext.tsx`

**Step 1: Create the auth context**

```typescript
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
    const [profileData, progressData] = await Promise.all([
      userDataService.getProfile(userId),
      userDataService.getProgress(userId),
    ])
    setProfile(profileData)
    setProgress(progressData)
  }

  // Handle new user sign-in (check for migration)
  const handleSignIn = async (authUser: User) => {
    setUser(authUser)

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
        const result = await migrateLocalDataToSupabase(authUser.id)

        if (result.success) {
          await clearLocalData()
          await loadUserData(authUser.id)
        } else {
          setError(`Ошибка миграции: ${result.error}`)
        }
        setMigrating(false)
      }
      // If no local data and no profile, user will go through onboarding
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

      if (session?.user) {
        await handleSignIn(session.user)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true)
          await handleSignIn(session.user)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setProgress(null)
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
      await loadUserData(user.id)
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
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "feat: add AuthContext with migration handling"
```

---

## Task 9: Create Loading and Migration Screens

**Files:**
- Create: `src/components/Auth/LoadingScreen.tsx`
- Create: `src/components/Auth/MigrationScreen.tsx`
- Modify: `src/components/Auth/index.ts`

**Step 1: Create loading screen**

```typescript
// src/components/Auth/LoadingScreen.tsx
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🇫🇷</div>
        <h1 className="text-xl font-semibold text-gray-700">Загрузка...</h1>
      </div>
    </div>
  )
}
```

**Step 2: Create migration screen**

```typescript
// src/components/Auth/MigrationScreen.tsx
export default function MigrationScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4 animate-bounce">📦</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Переносим ваши данные
        </h1>
        <p className="text-gray-600 mb-6">
          Пожалуйста, подождите. Ваш прогресс обучения переносится в облако.
        </p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Update index exports**

```typescript
// src/components/Auth/index.ts
export { default as AuthScreen } from './AuthScreen'
export { default as LoadingScreen } from './LoadingScreen'
export { default as MigrationScreen } from './MigrationScreen'
```

**Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/Auth/
git commit -m "feat: add LoadingScreen and MigrationScreen components"
```

---

## Task 10: Update App.tsx with Auth Gating

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

**Step 1: Update main.tsx to add AuthProvider**

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

**Step 2: Update App.tsx with auth gating**

```typescript
// src/App.tsx
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuthContext } from './contexts/AuthContext'
import { AuthScreen, LoadingScreen, MigrationScreen } from './components/Auth'
import Layout from './components/ui/Layout'
import HomeScreen from './components/Home/HomeScreen'
import ConversationScreen from './components/Conversation/ConversationScreen'
import GrammarScreen from './components/Grammar/GrammarScreen'
import TopicDetail from './components/Grammar/TopicDetail'
import PracticeScreen from './components/GrammarPractice/PracticeScreen'
import TopicScreen from './components/TopicSelection/TopicScreen'
import SettingsScreen from './components/Settings/SettingsScreen'
import VocabularyScreen from './components/Vocabulary/VocabularyScreen'
import OnboardingFlow from './components/Onboarding/OnboardingFlow'
import TeacherChatButton from './components/TeacherChat/TeacherChatButton'
import TeacherChatWidget from './components/TeacherChat/TeacherChatWidget'

// Redirect component for /review/:topicId to /grammar/:topicId
function ReviewTopicRedirect() {
  const { topicId } = useParams<{ topicId: string }>()
  return <Navigate to={`/grammar/${topicId}`} replace />
}

function App() {
  const { user, profile, loading, migrating } = useAuthContext()

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen />
  }

  // Show auth screen if not signed in
  if (!user) {
    return <AuthScreen />
  }

  // Show migration screen while migrating local data
  if (migrating) {
    return <MigrationScreen />
  }

  // Show onboarding if user hasn't completed it
  if (!profile?.is_onboarded) {
    return <OnboardingFlow />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/topics" element={<TopicScreen />} />
        <Route path="/conversation" element={<ConversationScreen />} />
        <Route path="/conversation/:topicId" element={<ConversationScreen />} />
        <Route path="/vocabulary" element={<VocabularyScreen />} />
        <Route path="/grammar" element={<GrammarScreen />} />
        <Route path="/grammar/:topicId" element={<TopicDetail />} />
        {/* Redirect old /review routes to new /grammar routes */}
        <Route path="/review" element={<Navigate to="/grammar" replace />} />
        <Route path="/review/:topicId" element={<ReviewTopicRedirect />} />
        <Route path="/exercises" element={<PracticeScreen />} />
        <Route path="/practice/:cardId" element={<PracticeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TeacherChatButton />
      <TeacherChatWidget />
    </Layout>
  )
}

export default App
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: add auth gating to App.tsx with AuthProvider"
```

---

## Task 11: Update OnboardingFlow for Supabase

**Files:**
- Modify: `src/components/Onboarding/OnboardingFlow.tsx`

**Step 1: Read the current OnboardingFlow**

Read `src/components/Onboarding/OnboardingFlow.tsx` to understand current implementation.

**Step 2: Update OnboardingFlow to use Supabase**

Replace the `handleComplete` function and related state to use Supabase instead of local storage:

```typescript
// Key changes to OnboardingFlow.tsx:

import { useAuthContext } from '../../contexts/AuthContext'
import { userDataService } from '../../services/userDataService'
import { ensureCardsForLevel } from '../../modules/GrammarEngine'

// In the component:
const { user, refreshProfile } = useAuthContext()

const handleComplete = async () => {
  if (!user) return

  setStep('creating')

  try {
    // Create user profile in Supabase
    await userDataService.createProfile(user.id, {
      name,
      native_language: 'ru',
      french_level: level,
      preferred_ai_provider: 'openai',
      speech_pause_timeout: getDefaultPauseTimeout(level),
      speech_settings: DEFAULT_SPEECH_SETTINGS,
      is_onboarded: true,
    })

    // Create user progress
    await userDataService.createProgress(user.id)

    // Create initial grammar cards
    await ensureCardsForLevel(user.id, level)

    // Refresh the auth context to pick up the new profile
    await refreshProfile()
  } catch (error) {
    console.error('Onboarding error:', error)
    setStep('level')
  }
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/Onboarding/OnboardingFlow.tsx
git commit -m "feat: update OnboardingFlow to use Supabase"
```

---

## Task 12: Update GrammarEngine for Supabase

**Files:**
- Modify: `src/modules/GrammarEngine.ts`

**Step 1: Update GrammarEngine to use Supabase**

Update functions that interact with the database to use `userDataService` instead of Dexie:

```typescript
// Key changes to GrammarEngine.ts:

import { userDataService } from '../services/userDataService'

// Replace db.grammarCards calls with userDataService calls:

export async function ensureCardsForLevel(userId: string, level: FrenchLevel): Promise<void> {
  const existingCards = await userDataService.getGrammarCards(userId)
  const existingTopicIds = new Set(existingCards.map(c => c.topic_id))

  const topics = getGrammarTopicsUpToLevel(level)

  for (const topic of topics) {
    if (!existingTopicIds.has(topic.id)) {
      await userDataService.createGrammarCard({
        user_id: userId,
        topic_id: topic.id,
        topic: topic.title,
        level: topic.level,
        explanation: topic.content.rule,
        examples: topic.content.examples,
        common_mistakes: topic.content.commonMistakes,
      })
    }
  }
}

export async function getUserCards(userId: string) {
  return userDataService.getGrammarCards(userId)
}

export async function getCardById(cardId: string) {
  return userDataService.getGrammarCard(cardId)
}

// ... update other functions similarly
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/modules/GrammarEngine.ts
git commit -m "feat: update GrammarEngine to use Supabase"
```

---

## Task 13: Update VocabularyEngine for Supabase

**Files:**
- Modify: `src/modules/VocabularyEngine.ts`

**Step 1: Update VocabularyEngine to use Supabase**

Similar to GrammarEngine, replace Dexie calls with userDataService calls.

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/modules/VocabularyEngine.ts
git commit -m "feat: update VocabularyEngine to use Supabase"
```

---

## Task 14: Update SRSEngine for Supabase

**Files:**
- Modify: `src/modules/SRSEngine.ts`

**Step 1: Update SRSEngine to use Supabase**

Replace Dexie calls with userDataService calls for scheduling and retrieval.

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/modules/SRSEngine.ts
git commit -m "feat: update SRSEngine to use Supabase"
```

---

## Task 15: Update TeacherChatService for Supabase

**Files:**
- Modify: `src/services/TeacherChatService.ts`

**Step 1: Update TeacherChatService to use Supabase**

Replace Dexie `teacherMessages` calls with userDataService calls.

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/services/TeacherChatService.ts
git commit -m "feat: update TeacherChatService to use Supabase"
```

---

## Task 16: Update Hooks to Use Supabase

**Files:**
- Modify: `src/hooks/useHomeStats.ts`
- Modify: `src/hooks/useVocabularyFilters.ts`

**Step 1: Update useHomeStats**

Replace Dexie queries with userDataService calls, using the auth context for userId.

**Step 2: Update useVocabularyFilters**

Similar updates to use Supabase data.

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: update hooks to use Supabase"
```

---

## Task 17: Update Components to Use Auth Context

**Files:**
- Modify: `src/components/Home/HomeScreen.tsx`
- Modify: `src/components/Settings/SettingsScreen.tsx`
- Modify: `src/components/Conversation/ConversationScreen.tsx`
- Modify: `src/components/Vocabulary/VocabularyScreen.tsx`
- Modify: `src/components/Grammar/GrammarScreen.tsx`
- Modify: `src/components/GrammarPractice/PracticeScreen.tsx`
- Modify: `src/components/TeacherChat/TeacherChatWidget.tsx`

**Step 1: Update components to use useAuthContext**

Replace `useAppStore` user/progress calls with `useAuthContext` where appropriate.

**Step 2: Add sign-out button to SettingsScreen**

```typescript
// In SettingsScreen.tsx:
import { useAuthContext } from '../../contexts/AuthContext'

// In component:
const { signOut, user } = useAuthContext()

// Add sign-out section:
<div className="mt-8 pt-8 border-t border-gray-200">
  <p className="text-sm text-gray-500 mb-2">
    Вы вошли как {user?.email}
  </p>
  <button
    onClick={signOut}
    className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
  >
    Выйти из аккаунта
  </button>
</div>
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: update components to use AuthContext"
```

---

## Task 18: Remove Unused Local Storage Code

**Files:**
- Modify: `src/store/useAppStore.ts` (keep UI-only state)
- Optionally remove: `src/db/index.ts` (or keep for reference)

**Step 1: Simplify useAppStore**

Remove user/progress state and persistence, keep only UI state if any.

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/store/
git commit -m "refactor: remove local storage user data from Zustand"
```

---

## Task 19: Update CSP for Supabase in Tauri Config

**Files:**
- Modify: `src-tauri/tauri.conf.json`

**Step 1: Add Supabase domains to CSP**

```json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.openai.com https://*.openai.com https://*.supabase.co; img-src 'self' data: blob:"
    }
  }
}
```

**Step 2: Commit**

```bash
git add src-tauri/tauri.conf.json
git commit -m "feat: add Supabase to CSP in Tauri config"
```

---

## Task 20: Final Verification

**Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors

**Step 2: Create .env.local with your Supabase credentials**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 3: Start dev server and test**

```bash
npm run dev
```

**Step 4: Manual testing checklist**

- [ ] App shows auth screen when not signed in
- [ ] Google sign-in works
- [ ] Apple sign-in works
- [ ] New user sees onboarding after sign-in
- [ ] Existing local data is migrated on first sign-in
- [ ] Onboarding creates profile in Supabase
- [ ] Grammar cards are created in Supabase
- [ ] Vocabulary progress saves to Supabase
- [ ] Conversations save to Supabase
- [ ] Teacher chat messages save to Supabase
- [ ] Sign-out clears session and shows auth screen
- [ ] Returning user sees their data after sign-in

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete Supabase authentication implementation"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Add Supabase dependencies and environment config |
| 2 | Create database schema with RLS policies |
| 3 | Create TypeScript types for Supabase |
| 4 | Create useAuth hook |
| 5 | Create AuthScreen component |
| 6 | Create userDataService |
| 7 | Create migrationService |
| 8 | Create AuthContext and Provider |
| 9 | Create Loading and Migration screens |
| 10 | Update App.tsx with auth gating |
| 11 | Update OnboardingFlow for Supabase |
| 12 | Update GrammarEngine for Supabase |
| 13 | Update VocabularyEngine for Supabase |
| 14 | Update SRSEngine for Supabase |
| 15 | Update TeacherChatService for Supabase |
| 16 | Update hooks to use Supabase |
| 17 | Update components to use AuthContext |
| 18 | Remove unused local storage code |
| 19 | Update CSP for Supabase in Tauri |
| 20 | Final verification and testing |
