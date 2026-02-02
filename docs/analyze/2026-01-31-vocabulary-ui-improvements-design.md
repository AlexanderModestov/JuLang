# Vocabulary UI Improvements

## Overview

Transform the vocabulary section from a simple "learn/review" menu into a browsable catalog with filtering, improved card design, and visual associations. Users can browse all words, filter by various criteria, and see consistent card design throughout the app.

## Current State

- VocabularyScreen has 3 modes: menu, new (flashcards), review (exercises)
- Menu shows only two cards: "New words" and "Review" with counts
- No list view to browse all words
- No search or filtering
- ~43 static cards organized by level (A1-C2)
- Cards have basic info: word, translation, example, gender

## New Design

### Main Screen Layout

```
┌─────────────────────────────────────┐
│  ← Словарь                          │
├─────────────────────────────────────┤
│  ┌───────────┐  ┌────────────────┐  │
│  │ Новые (5) │  │ Повторить (12) │  │  ← action buttons
│  └───────────┘  └────────────────┘  │
│                                     │
│  📁  📊  ⭐  🎯                      │  ← filter icons
│                                     │
│  chercher — искать        ✅ ⭐⭐    │
│  manger — есть            📖 ⭐      │  ← word list
│  répondre — отвечать      ❓ ⭐⭐⭐  │
│  parler — говорить        ✅ ⭐      │
│  ...                                │
└─────────────────────────────────────┘
```

### Elements

**Action Buttons (top):**
- "Новые (N)" — start learning new words session
- "Повторить (N)" — start review session
- Large, prominent buttons with counters

**Filter Icons:**
- Compact icons in a row, dropdown on click
- 📁 Topic filter
- 📊 Learning status filter
- ⭐ Difficulty filter
- 🎯 Level filter

**Word List:**
- Compact single-line items
- Format: `word — translation` + status icon + difficulty stars
- Scrollable, no grouping

### List Item Icons

**Learning Status:**
- ❓ New — no record in vocabularyProgress
- 📖 In progress — has record, repetitions < 3
- ✅ Learned — repetitions >= 3

**Difficulty:**
- ⭐ Easy
- ⭐⭐ Medium
- ⭐⭐⭐ Hard

### Word Card (Unified Design)

Same card design used everywhere: from list, from "New words", from "Review".

```
┌─────────────────────────────────────┐
│  ← chercher                         │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │      [Word Image]           │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  chercher                    🔊     │  ← word + TTS
│  искать                             │  ← translation
│                                     │
│  ✅ Изучено                         │  ← learning status
│  ⭐⭐ Средняя сложность              │  ← difficulty
│  ▓▓▓▓░ Частое                       │  ← frequency (4/5)
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Je cherche mes clés.    🔊 │    │  ← example
│  │ Я ищу свои ключи.          │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌───────────┐  ┌───────────────┐   │
│  │ Практика  │  │ Следующее     │   │  ← buttons
│  └───────────┘  └───────────────┘   │
└─────────────────────────────────────┘
```

**Card Elements:**
- Image — visual association for the word
- Word + TTS button
- Translation
- Learning status (❓📖✅) with label
- Difficulty (stars) with label
- Frequency scale (5 bars) with label
- Example sentence with translation and TTS
- Buttons: "Практика" (Practice) and "Следующее" (Next word)

## Data Model Changes

### New Fields in VocabularyCard

```typescript
interface VocabularyCard {
  // Existing fields
  id: string;
  french: string;
  russian: string;
  example: string;
  exampleTranslation: string;
  level: Level;
  type: 'word' | 'expression';
  gender?: 'masculine' | 'feminine';

  // New fields
  topic: VocabularyTopic;      // category/theme
  difficulty: 1 | 2 | 3;       // 1 = easy, 2 = medium, 3 = hard
  frequency: 1 | 2 | 3 | 4 | 5; // frequency scale
  imageUrl: string;            // path to image
}
```

### Topics

```typescript
type VocabularyTopic =
  | 'daily'         // Повседневное
  | 'food'          // Еда
  | 'travel'        // Путешествия
  | 'work'          // Работа
  | 'home'          // Дом
  | 'nature'        // Природа
  | 'emotions'      // Эмоции
  | 'communication'; // Общение
```

### Topic Labels (Russian)

```typescript
const topicLabels: Record<VocabularyTopic, string> = {
  daily: 'Повседневное',
  food: 'Еда',
  travel: 'Путешествия',
  work: 'Работа',
  home: 'Дом',
  nature: 'Природа',
  emotions: 'Эмоции',
  communication: 'Общение',
};
```

### Learning Status Calculation

```typescript
function getLearningStatus(wordId: string, progress: VocabularyProgress[]): 'new' | 'learning' | 'learned' {
  const record = progress.find(p => p.cardId === wordId);
  if (!record) return 'new';
  if (record.repetitions < 3) return 'learning';
  return 'learned';
}
```

### Images

- Stored in `/public/images/vocab/`
- Filename format: `{word-id}.jpg` or `.png`
- Recommended size: ~300x200px, optimized for web
- Fallback: display placeholder if image not found

## Components and File Structure

### New/Updated Components

```
src/components/Vocabulary/
  VocabularyScreen.tsx     — main screen with list
  VocabularyList.tsx       — NEW: word list component
  VocabularyListItem.tsx   — NEW: compact word row
  VocabularyFilters.tsx    — NEW: filter panel
  FilterDropdown.tsx       — NEW: dropdown for single filter
  WordCard.tsx             — NEW: unified word card
  NewWordsSession.tsx      — renamed from NewCardView, uses WordCard
  ReviewSession.tsx        — unchanged
  ExerciseCard.tsx         — unchanged
```

### Removed Components

- `NewCardView.tsx` — replaced by `WordCard.tsx` + `NewWordsSession.tsx`

### New Hook

```typescript
// src/hooks/useVocabularyFilters.ts

interface VocabularyFilters {
  topic: VocabularyTopic | null;
  status: 'new' | 'learning' | 'learned' | null;
  difficulty: 1 | 2 | 3 | null;
  level: Level | null;
}

interface UseVocabularyFiltersReturn {
  filters: VocabularyFilters;
  setFilter: (key: keyof VocabularyFilters, value: any) => void;
  clearFilters: () => void;
  applyFilters: (words: VocabularyCard[]) => VocabularyCard[];
  activeFilterCount: number;
}

function useVocabularyFilters(): UseVocabularyFiltersReturn;
```

### WordCard Reuse

```tsx
// From list
<WordCard
  word={word}
  onNext={() => navigateToWord(nextWordInList)}
  onPractice={() => startPractice(word.id)}
/>

// From "New words" session
<WordCard
  word={word}
  onNext={() => goToNextNewWord()}
  onPractice={() => startPractice(word.id)}
/>

// From "Review" — shown after answering exercise
<WordCard
  word={word}
  onNext={() => goToNextReviewWord()}
  onPractice={null} // hide practice button during review
/>
```

## Filter Dropdowns

### Topic Filter (📁)

Options:
- Все темы (default)
- Повседневное
- Еда
- Путешествия
- Работа
- Дом
- Природа
- Эмоции
- Общение

### Status Filter (📊)

Options:
- Все (default)
- ❓ Новые
- 📖 В процессе
- ✅ Изученные

### Difficulty Filter (⭐)

Options:
- Любая (default)
- ⭐ Лёгкие
- ⭐⭐ Средние
- ⭐⭐⭐ Сложные

### Level Filter (🎯)

Options:
- Все уровни (default)
- A1
- A2
- B1
- B2
- C1
- C2

## Frequency Scale Display

Visual representation of word frequency (how common in speech):

```typescript
function FrequencyScale({ value }: { value: 1 | 2 | 3 | 4 | 5 }) {
  // value 1 = rare, value 5 = very common
  // Display: ▓▓▓░░ for value 3
}
```

Labels:
- 1: Редкое
- 2: Нечастое
- 3: Обычное
- 4: Частое
- 5: Очень частое

## Navigation Flow

```
VocabularyScreen (list)
├── Click "Новые" → NewWordsSession → WordCard (each word)
├── Click "Повторить" → ReviewSession → ExerciseCard → WordCard (after answer)
└── Click word in list → WordCard
    ├── "Практика" → single word exercise
    └── "Следующее" → next word in filtered list
```

## Data Migration

### Update vocabulary.json

Add new fields to each word:

```json
{
  "id": "v-a1-01",
  "french": "chercher",
  "russian": "искать",
  "example": "Je cherche mes clés.",
  "exampleTranslation": "Я ищу свои ключи.",
  "level": "A1",
  "type": "word",
  "topic": "daily",
  "difficulty": 2,
  "frequency": 4,
  "imageUrl": "/images/vocab/v-a1-01.jpg"
}
```

### Image Assets

Create `/public/images/vocab/` directory with images for all ~43 words.
