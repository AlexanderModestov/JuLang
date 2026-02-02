# Teacher Chat

## Overview

Global chat assistant for questions about French language, accessible from anywhere in the app. Allows users to ask about grammar rules, request translations, get help formulating phrases — replacing the typical student-teacher interaction during a lesson. Separate from conversation practice mode, which remains focused on speech practice.

## Core Concept

**What it is:** A floating chat widget available on all screens (except Onboarding) that provides access to a persistent conversation with an AI French teacher.

**Key characteristics:**
- Floating button in the bottom-right corner of the screen
- Opens a compact chat widget overlay (not full-screen)
- Single shared history — teacher remembers all previous questions regardless of where they were asked
- Automatic context passing: teacher sees current screen and item (grammar card, vocabulary word, conversation excerpt)
- User can ask about anything, not limited to current context

**Difference from conversation practice:**
- Conversation practice — simulates live dialogue, teacher acts as conversation partner
- Teacher chat — Q&A mode, teacher explains and helps with language questions

## Data Model

```typescript
interface TeacherMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context: {
    screen: string;        // 'grammar' | 'vocabulary' | 'conversation' | 'home' | ...
    itemId?: string;       // id of card, word, or conversation
    itemPreview?: string;  // short description: "Passé composé" or "chercher"
  };
}
```

**Storage:**
- Local storage in Dexie (offline-first, like other data)
- Sync with Supabase when connected (table `teacher_chats`)

**Limits:**
- AI context: last 20 messages + system prompt
- Local storage: unlimited
- Cloud storage: last 500 messages (older archived)

**New setting:**
- `teacherLanguage: 'ru' | 'fr' | 'adaptive'` — language for teacher explanations
- Default: `'ru'` for A1-A2 levels, `'adaptive'` for B1+

## UI Components

**Floating button:**
- Position: bottom-right corner
- Icon: teacher icon or question mark (?)
- Badge for unread responses (if chat was minimized)
- Hidden during active voice input in conversation practice

**Chat widget:**
- Size: approximately 350×450px
- Position: above floating button, bottom-right
- Components:
  - Header "Teacher" with close button (×)
  - Message area with scroll (conversation history)
  - Context badge: "📍 Grammar: Passé composé" — shows where chat was opened from
  - Input field with microphone button (voice input)
  - Send button

**Behavior:**
- Click outside widget — chat minimizes (doesn't close)
- Navigation between screens — chat stays open, context badge updates
- History loads on open (last 50 messages, more on scroll up)

## Components and File Structure

```
src/components/TeacherChat/
  TeacherChatButton.tsx    — floating button
  TeacherChatWidget.tsx    — chat widget
  TeacherMessage.tsx       — individual message
  ContextBadge.tsx         — current context badge
```

**Service:**
```
src/services/TeacherChatService.ts
  - sendMessage(content, context) → Promise<string>
  - getHistory(limit, offset) → Promise<Message[]>
  - buildSystemPrompt(userLevel, language, context) → string
```

**Integration:**
- `TeacherChatButton` added to root `App.tsx` (visible on all screens)
- New Zustand slice `teacherChatStore` for widget state (open/closed, current context)
- Hook `useTeacherContext()` — each screen provides its context

**Usage example:**
```tsx
// In GrammarReview.tsx
useTeacherContext({
  screen: 'grammar',
  itemId: currentCard.id,
  itemPreview: currentCard.topic
});
```

## AI Teacher Behavior

**System prompt (key instructions):**
- Role: patient French teacher for Russian speakers
- Response language: according to `teacherLanguage` setting
- Style: clear explanations with examples, not dry academic tone
- When receiving context — consider it but don't force it ("I see you're studying passé composé. How can I help?" — only if no question was asked)

**Request types and behavior:**

| Request | Teacher behavior |
|---------|------------------|
| Phrase translation | Translation + brief explanation of construction |
| Grammar question | Rule explanation + 2-3 examples |
| "How to better say..." | Variants with nuances (formal/colloquial) |
| Phrase check | Correction + error explanation |
| General language question | Detailed answer on topic |

**Context in prompt:**
```
User is currently on: [screen]
Current item: [itemPreview]
User level: [A1-C2 from profile]
```

**AI provider:** same as selected in settings (OpenAI/Claude)

## Voice Input

- Uses existing `SpeechService`
- Microphone button in input field
- Recognized text appears in field, user can edit before sending
- Recognition language: Russian (primary for questions) with option to switch to French

## Edge Cases

**Loading and error states:**
- "Teacher is typing..." indicator while waiting for response
- On network error: "Failed to send. Retry?" with button
- Offline mode: messages saved locally, sent when connection restored

**Interaction with conversation practice:**
- If user opens teacher chat during practice — practice pauses
- Context: last 3-5 messages from current dialogue
- After closing chat — practice resumes

**Mobile adaptation (if applicable):**
- Widget takes more screen space (90% width)
- Button slightly larger for easier tapping

## Database Changes

**New Dexie table:**
```typescript
// In db.ts
teacherMessages: '++id, timestamp'
```

**Supabase table:**
```sql
create table teacher_chats (
  id uuid primary key,
  user_id uuid references users(id),
  role text not null,
  content text not null,
  context jsonb,
  timestamp timestamptz default now()
);
```

## Routing

No new routes — widget is global overlay, not a separate page.
