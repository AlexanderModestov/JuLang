# Grammar as Reference Guide

## Overview

Transform the grammar section from SRS-based flashcard review into a browsable reference guide. Users can look up grammar rules when needed, practice specific topics, but are not forced into spaced repetition drills. Progress is tracked through vocabulary and conversations, not grammar memorization.

## Current State

- Section "Повторить грамматику" (Review Grammar) with SRS cards
- Difficulty rating buttons (again / hard / good / easy)
- Interval tracking and review scheduling
- Separate "Practice" section for exercises
- Counter showing "cards due for review" on Home screen

**Problems:**
- Grammar rules are reference material, not flashcards to memorize
- SRS pressure discourages exploration
- Rating buttons interrupt learning flow

## New Design

### Philosophy

- Grammar = reference guide to consult as needed
- User progress measured through vocabulary and conversations
- Exercises available but not forced through SRS scheduling

### Section Renaming

| Old | New |
|-----|-----|
| Повторить грамматику | Грамматика |
| Практика | Упражнения |

### Screen: Grammar List

Displays grammar topics grouped by category, expandable/collapsible.

```
┌─────────────────────────────────────┐
│  ← Грамматика                       │
├─────────────────────────────────────┤
│                                     │
│  ▼ Артикли                          │
│    ├─ Определённый артикль          │
│    ├─ Неопределённый артикль        │
│    └─ Частичный артикль             │
│                                     │
│  ▼ Времена                          │
│    ├─ Présent                       │
│    ├─ Passé composé                 │
│    ├─ Imparfait                     │
│    └─ ...                           │
│                                     │
│  ▶ Местоимения                      │
│  ▶ Предлоги                         │
│  ...                                │
└─────────────────────────────────────┘
```

**Behavior:**
- Groups expand/collapse on tap
- Only topics for user's current level are shown
- No progress indicators or checkmarks

### Screen: Topic Detail (Rule Card)

Shows rule explanation with examples and action buttons.

```
┌─────────────────────────────────────┐
│  ← Passé composé                    │
├─────────────────────────────────────┤
│                                     │
│  [Rule explanation text]            │
│                                     │
│  Примеры:                           │
│  • J'ai mangé — Я поел              │
│  • Elle est partie — Она ушла       │
│                                     │
│  ┌───────────┐  ┌─────────────────┐ │
│  │ Практика  │  │ Следующее       │ │
│  └───────────┘  └─────────────────┘ │
└─────────────────────────────────────┘
```

**Buttons:**
- "Практика" — opens exercises for this specific rule
- "Следующее правило" — shows random rule from same level

### Screen: Exercises

Entry point for choosing a topic to practice (renamed from Practice).

- Shows list of grammar topics available for exercises
- Can be accessed from main menu or from topic detail
- Exercise types remain unchanged (fill-in, multiple choice, etc.)

## Data Model Changes

### Add Group Field

```typescript
// In grammar-topics.json
interface GrammarTopic {
  id: string;
  topic: string;
  level: Level;
  group: string;        // NEW: grouping category
  explanation: string;
  examples: Example[];
}
```

### Topic Groups

```typescript
type GrammarGroup =
  | 'articles'      // Артикли
  | 'tenses'        // Времена
  | 'pronouns'      // Местоимения
  | 'prepositions'  // Предлоги
  | 'adjectives'    // Прилагательные
  | 'negation'      // Отрицание
  | 'questions';    // Вопросы
```

### Removed Data

**Dexie tables to remove:**
- `grammarCards` — SRS state per card (interval, ease factor, next review date)

**Supabase tables to remove:**
- `grammar_progress` — cloud sync of grammar SRS data

**UserProgress fields to remove:**
- `grammarCardsMastered` — no longer tracked

### Unchanged

- Static file `grammar-topics.json` (only add `group` field)
- Table `practiceSessions` (exercise history remains)

## Components and File Structure

### Removed Components

```
src/components/GrammarReview/
  ReviewScreen.tsx        — DELETE (SRS review flow)
  CardRating.tsx          — DELETE (rating buttons)
```

### New/Modified Components

```
src/components/Grammar/
  GrammarScreen.tsx       — Topic list by groups (replaces ReviewScreen)
  TopicGroup.tsx          — Collapsible group (Articles, Tenses...)
  TopicListItem.tsx       — List item (rule name)
  TopicDetail.tsx         — Rule card (rename from CardDetail)

src/components/Exercises/
  ExercisesScreen.tsx     — Topic selection for exercises (rename from Practice)
```

### Routing Changes

| Old Route | New Route | Description |
|-----------|-----------|-------------|
| `/review` | `/grammar` | Topic list by groups |
| `/card/:id` | `/grammar/:id` | Rule detail view |
| `/practice` | `/exercises` | Exercise topic selection |

### Home Screen Changes

- "Повторить грамматику" button → "Грамматика"
- "Практика" button → "Упражнения"
- Remove "cards due for review" counter
- Remove `grammarCardsMastered` from stats (already handled in stats board redesign)

## Migration

### Database Cleanup

```typescript
// Migration script
async function migrateGrammarToReference() {
  // 1. Delete grammarCards table from Dexie
  await db.grammarCards.clear();

  // 2. Remove grammarCardsMastered from user progress
  const progress = await getProgress();
  delete progress.grammarCardsMastered;
  await saveProgress(progress);
}
```

### Data File Update

Add `group` field to each topic in `grammar-topics.json`:

```json
{
  "id": "passe-compose",
  "topic": "Passé composé",
  "level": "A2",
  "group": "tenses",
  "explanation": "...",
  "examples": [...]
}
```

## Random Next Rule Logic

```typescript
function getRandomRule(currentRuleId: string, userLevel: Level): GrammarTopic {
  const allRulesAtLevel = grammarTopics.filter(
    t => t.level === userLevel && t.id !== currentRuleId
  );
  const randomIndex = Math.floor(Math.random() * allRulesAtLevel.length);
  return allRulesAtLevel[randomIndex];
}
```
