# Improved Statistics Board

## Overview

Replace the current uninformative statistics board on the Home screen with a visually appealing and motivating dashboard. Current board shows absolute numbers (total conversations, messages sent) that don't provide actionable insight. New design focuses on progress and meaningful metrics.

## Current State

The existing Home screen shows a 2x2 grid with:
- Total conversations (number)
- Grammar cards mastered (number)
- Messages sent (number)
- User level (A1-C2)

Plus a separate streak card when streak > 0.

**Problems:**
- Absolute numbers don't show progress or trends
- "Messages sent" is not a meaningful metric
- No visual hierarchy — all metrics look equally important
- No indication of daily activity or goals

## New Design

### Layout Structure

```
┌─────────────────────────────────────────┐
│  👋 Привет, [Name]!                     │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │  🎯 A1 → A2          🔥 5 дней  │    │  ← Main card
│  │  ████████░░░░░ 45%              │    │
│  │  Сегодня: 15 мин                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 📚 127  │ │ ⏱ 4.5ч  │ │ 💬 12м  │   │  ← Three stat cards
│  │  слов   │ │  всего  │ │ средний │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  [Quick actions: Conversation, etc.]    │
└─────────────────────────────────────────┘
```

### Main Card

**Contents:**
- Level progress: "A1 → A2" with percentage and progress bar
- Today's practice time: "Сегодня: X мин"
- Streak badge in top-right corner: 🔥 + days count

**Visual style:**
- Full width (with padding)
- Gradient background (blue → purple, brand colors)
- White text, white progress bar on semi-transparent background
- Rounded corners, subtle shadow

### Three Stat Cards

| Card | Icon | Metric | Color |
|------|------|--------|-------|
| Words learned | 📚 | Total vocabulary words with at least one review | #10B981 (emerald) |
| Time in dialogues | ⏱ | Total time spent in conversations | #3B82F6 (blue) |
| Average dialogue | 💬 | Average duration of one conversation | #F59E0B (amber) |

**Visual style:**
- Equal width, displayed in a row (1/3 each)
- Light background (white in light mode, dark gray in dark mode)
- Large colored icon at top
- Large number (24-28px font)
- Small label below number

### Removed Metrics

- "Диалогов" (total conversations) — replaced by average duration
- "Сообщений" (messages sent) — not meaningful
- "Ваш уровень" (level label) — integrated into progress bar

## Data Model Changes

### New Fields in Conversation

```typescript
interface Conversation {
  // ... existing fields
  startedAt: Date;      // When conversation began
  endedAt?: Date;       // When conversation ended
  durationMs?: number;  // Duration in milliseconds (calculated on end)
}
```

### Metrics Calculation

| Metric | Calculation | Data Source |
|--------|-------------|-------------|
| Level progress (%) | Words learned at level / total words at level | `vocabulary_progress` + `vocabulary.json` |
| Today's time | Sum of session durations for today | `conversations.durationMs` where date = today |
| Words learned | Count of words with at least one review | `vocabulary_progress` count |
| Total dialogue time | Sum of all conversation durations | `conversations.durationMs` sum |
| Average duration | Total time / conversation count | Calculated |

### Level Progress Logic

```typescript
function getLevelProgress(userLevel: Level): { current: Level, next: Level, percent: number } {
  // Get total words for current level from vocabulary.json
  const totalWordsAtLevel = vocabularyData[userLevel].length;

  // Get learned words for current level from vocabulary_progress
  const learnedWordsAtLevel = vocabularyProgress.filter(
    vp => vp.level === userLevel && vp.reviewCount > 0
  ).length;

  return {
    current: userLevel,
    next: getNextLevel(userLevel),
    percent: Math.round((learnedWordsAtLevel / totalWordsAtLevel) * 100)
  };
}
```

## Components and File Structure

### New Components

```
src/components/Home/
  MainProgressCard.tsx    — Main card with level progress, today's time, streak
  StatsCard.tsx           — Reusable small stat card (icon, number, label)
  StreakBadge.tsx         — Streak badge component (extracted from HomeScreen)
```

### New Hook

```typescript
// src/hooks/useHomeStats.ts

interface HomeStats {
  levelProgress: { current: Level; next: Level; percent: number };
  todayMinutes: number;
  wordsLearned: number;
  totalDialogueMinutes: number;
  averageDialogueMinutes: number;
  currentStreak: number;
}

function useHomeStats(): HomeStats {
  // Fetch and calculate all stats for Home screen
}
```

### Modified Files

**`src/components/Home/HomeScreen.tsx`:**
- Replace current stats grid with new layout
- Use `useHomeStats()` hook
- Render `MainProgressCard` and three `StatsCard` components

**`src/components/Conversation/ConversationScreen.tsx`:**
- Record `startedAt` when conversation begins
- Record `endedAt` and calculate `durationMs` when conversation ends

**`src/types/index.ts`:**
- Add `startedAt`, `endedAt`, `durationMs` to `Conversation` interface

**`src/store/useAppStore.ts`:**
- Can remove `totalMessagesSent` from `UserProgress` (no longer displayed)

## Database Migration

Add new fields to existing conversations with default values:

```typescript
// For existing conversations without duration data
if (!conversation.startedAt) {
  conversation.startedAt = conversation.createdAt || new Date();
}
if (!conversation.durationMs) {
  // Estimate based on message count, or set to 0
  conversation.durationMs = 0;
}
```

## Color Scheme

```
Main card gradient:  from-blue-600 to-purple-600
Words icon:          #10B981 (emerald-500)
Time icon:           #3B82F6 (blue-500)
Dialogue icon:       #F59E0B (amber-500)
Streak icon:         #EF4444 (red-500)
```
