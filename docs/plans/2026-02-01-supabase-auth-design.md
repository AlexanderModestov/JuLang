# Supabase Authentication Design

## Overview

Implement Google and Apple authentication using Supabase, with full cloud storage for all user data.

## Decisions

| Aspect | Decision |
|--------|----------|
| Auth requirement | Required before app access |
| Providers | Google + Apple via Supabase |
| Local data | Migrate to cloud on first sign-in |
| After sign-in | Cloud-only (no offline support) |
| Platform | Web first, desktop later |
| Data in Supabase | Everything (profiles, vocabulary, grammar, conversations) |

## User Flow

```
App loads → Auth check → Not signed in? → Show auth page
                       → Signed in? → Check for local data
                                    → Has local data? → Migrate to Supabase
                                    → Load app with cloud data
```

### Auth Page
- Clean, branded page with app logo
- Two buttons: "Continue with Google" / "Continue with Apple"
- No guest option, no skip

### After Sign-in
1. Check if user has existing local IndexedDB data
2. If yes: upload to Supabase, then clear local storage
3. If no: fetch user data from Supabase (could be empty for new users, or existing for returning users)
4. Proceed to app (or onboarding if new user)

### Sign-out
- Clears session, returns to auth page
- No local data retained after sign-out

## Database Schema

### Tables

```sql
-- user_profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT CHECK (level IN ('A1', 'A2', 'B1', 'B2')),
  native_language TEXT,
  topics_of_interest JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  is_onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- vocabulary_progress
CREATE TABLE vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,
  srs_level INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  next_review_at TIMESTAMPTZ,
  times_reviewed INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, word_id)
);

-- grammar_progress
CREATE TABLE grammar_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT,
  title TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- vocabulary_progress policies
CREATE POLICY "Users can view own vocabulary"
  ON vocabulary_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary"
  ON vocabulary_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary"
  ON vocabulary_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary"
  ON vocabulary_progress FOR DELETE
  USING (auth.uid() = user_id);

-- grammar_progress policies
CREATE POLICY "Users can view own grammar progress"
  ON grammar_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grammar progress"
  ON grammar_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grammar progress"
  ON grammar_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grammar progress"
  ON grammar_progress FOR DELETE
  USING (auth.uid() = user_id);

-- conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);
```

## Frontend Architecture

### New Files

```
src/
├── lib/
│   └── supabase.ts          # Supabase client initialization
├── components/
│   └── Auth/
│       └── AuthScreen.tsx   # Sign-in page with Google/Apple buttons
├── hooks/
│   └── useAuth.ts           # Auth state, sign-in/out methods
├── services/
│   └── migrationService.ts  # Migrate local IndexedDB → Supabase
│   └── userDataService.ts   # CRUD for user data in Supabase
```

### Supabase Client

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Auth Hook

```ts
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: 'google' })

  const signInWithApple = () =>
    supabase.auth.signInWithOAuth({ provider: 'apple' })

  const signOut = () => supabase.auth.signOut()

  return { user, loading, signInWithGoogle, signInWithApple, signOut }
}
```

### App.tsx Changes

```tsx
function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <AuthScreen />

  // Existing app logic
  if (!isOnboarded) return <OnboardingFlow />
  return <Layout>...</Layout>
}
```

### Data Layer Changes

| Current | After |
|---------|-------|
| `useAppStore` (Zustand) for user prefs | `userDataService.getProfile()` / `updateProfile()` |
| `db.vocabularyProgress` (Dexie) | `userDataService.getVocabulary()` / `updateVocabulary()` |
| `db.grammarProgress` (Dexie) | `userDataService.getGrammar()` / `updateGrammar()` |
| `db.conversations` (Dexie) | `userDataService.getConversations()` / `saveConversation()` |

Keep Zustand for UI state only (current screen, chat widget open, etc.).

## Migration Logic

### When Migration Runs
- After first successful sign-in
- Only if local IndexedDB has data

### Migration Steps

1. Check IndexedDB for existing data
   - user preferences (from Zustand persisted store)
   - vocabulary progress (from Dexie)
   - grammar progress (from Dexie)
   - conversations (from Dexie)

2. If data exists:
   - Show "Migrating your data..." loading state
   - Upload to Supabase in order:
     a. user_profiles (preferences, level, onboarding state)
     b. vocabulary_progress (all SRS records)
     c. grammar_progress (all topic progress)
     d. conversations (all history)

3. On success:
   - Clear local IndexedDB
   - Clear Zustand persisted storage
   - Continue to app

4. On failure:
   - Show error, offer retry
   - Don't clear local data until migration succeeds

### Edge Cases

**Returning user with cloud data:**
- User signs in on new device
- No local data to migrate
- Just fetch from Supabase and continue

**User already has cloud data AND local data:**
- Could happen if user used app locally, signed out, used again
- Merge strategy: cloud data wins, skip duplicates

## Auth Screen UI

```
┌─────────────────────────────────────┐
│                                     │
│            [App Logo]               │
│      Изучай французский легко       │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  G  Continue with Google    │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │    Continue with Apple      │   │
│   └─────────────────────────────┘   │
│                                     │
│        Terms · Privacy              │
└─────────────────────────────────────┘
```

**Loading states:**
- Button shows spinner while auth is processing
- "Migrating your data..." screen after first sign-in (if local data exists)

## Supabase Setup Requirements

### Auth Providers
- Google OAuth (requires Google Cloud Console credentials)
- Apple OAuth (requires Apple Developer account credentials)

### Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Redirect URLs (configure in Supabase dashboard)
- `http://localhost:1420` (dev)
- `https://your-production-domain.com` (prod)

## Dependencies

Add to package.json:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x"
  }
}
```

## Implementation Order

1. Set up Supabase project and configure auth providers
2. Create database tables and RLS policies
3. Add Supabase client (`lib/supabase.ts`)
4. Create auth hook (`hooks/useAuth.ts`)
5. Build auth screen (`components/Auth/AuthScreen.tsx`)
6. Update App.tsx with auth gating
7. Create user data service (`services/userDataService.ts`)
8. Create migration service (`services/migrationService.ts`)
9. Refactor existing components to use Supabase instead of local storage
10. Test migration flow with existing local data
11. Clean up unused Dexie/local storage code

## Out of Scope

- Desktop (Tauri) authentication — will be addressed separately
- Offline support — app requires internet connection
- Additional auth providers beyond Google and Apple
