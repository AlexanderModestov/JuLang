# Vocabulary Learning Module

## Overview

New learning format for studying French vocabulary (words and set expressions) with spaced repetition, matched to user's proficiency level. Combines flashcard-based introduction with varied review exercises.

## Data Model

```typescript
interface VocabularyCard {
  id: string;
  french: string;              // word or expression
  russian: string;             // translation
  example: string;             // example sentence in French
  exampleTranslation: string;  // example translation in Russian
  level: Level;                // A1–C2
  type: 'word' | 'expression'; // word or set expression
  gender?: 'masculine' | 'feminine'; // gender, nouns only
}
```

- Static vocabulary lists stored in `src/data/vocabulary.json`, organized by level.
- AI generates example sentences on first card view, cached in Dexie.
- SRS state stored in `vocabulary_progress` table (Dexie/Supabase), separate from grammar but using the same interval fields.

## Screens and User Flow

**Navigation:** New "Vocabulary" button on the home screen alongside Conversation and Grammar.

**VocabularyScreen** has two modes:

- **New words** — flashcard showing: French word, gender (if noun), Russian translation, example sentence with translation. TTS pronounces word and example. "Next" button adds card to SRS queue. 5 new cards per session.
- **Review** — SRS queue. Shows count of cards due. Session uses three exercise types chosen randomly:
  - FR→RU translation (show French, user picks/enters Russian)
  - RU→FR translation (show Russian, user picks/enters French)
  - Multiple choice (4 options)

  After each answer: SRS rating (again / hard / good / easy).

## Components and File Structure

```
src/components/Vocabulary/
  VocabularyScreen.tsx      — main screen, "New" / "Review" toggle
  NewCardView.tsx           — flashcard for learning new words
  ReviewSession.tsx         — review session (manages queue)
  ExerciseCard.tsx          — renders exercise (FR→RU, RU→FR, multiple choice)
```

**Modules:**
- `src/modules/VocabularyEngine.ts` — load cards by level, select new cards, generate multiple choice options (random words from same level), request AI for examples.
- Existing `SRSEngine` — reused for interval calculation and review queue.

**Data:**
- `src/data/vocabulary.json` — static word/expression lists by level.

**DB (Dexie):**
- `vocabulary_progress` table — SRS state per card (interval, next date, ease factor).

**Store:**
- Extend `useAppStore` with vocabulary section (current session, stats).

**Routing:**
- New `/vocabulary` route.

## AI Example Generation

On first card view, `VocabularyEngine` requests AI to generate an example sentence:

> Give a simple French sentence at {level} level using "{french}". Return JSON: `{ "example": "...", "exampleTranslation": "..." }`. Translation in Russian.

Result cached in Dexie. If AI unavailable, card shown without example with note "example will load later".

Multiple choice options do not use AI — 3 random words from the same level in `vocabulary.json`.

## Vocabulary Source

Hybrid approach: static curated lists per level (A1–C2) provide base vocabulary. AI generates contextual example sentences. Lists can be expanded over time.
