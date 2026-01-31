# Add Words From Conversation to Vocabulary

## Overview

Allow users to tap any word in a conversation message to see its translation and add it to the vocabulary learning module as an SRS card.

## User Flow

1. During conversation, user taps a word in any French message.
2. A popup appears with:
   - The word (lemma form if applicable)
   - Translation in Russian
   - Gender (for nouns)
   - The sentence from the conversation as example
3. User presses "Add to vocabulary" — a `VocabularyCard` is created and added to `vocabulary_progress` with initial SRS state.
4. Popup closes, user continues conversation.

## Translation Source

AI request with the word and its sentence context. Prompt:

> Word: "{word}", context: "{sentence}". Return JSON: `{ "lemma": "...", "russian": "...", "gender": "masculine" | "feminine" | null, "type": "word" | "expression" }`. Give the dictionary form (lemma), Russian translation fitting the context, and gender if noun.

## Implementation

**ConversationScreen.tsx:**
- Wrap each word in French messages with a tappable `<span>`.
- On tap, show a popup component with loading state while AI translates.

**New component:**
- `src/components/Conversation/WordPopup.tsx` — popup showing translation, gender, "Add to vocabulary" button.

**VocabularyEngine.ts:**
- Add method `addCardFromConversation(word, russian, gender, type, example, exampleTranslation)` — creates a `VocabularyCard` and initial SRS entry in `vocabulary_progress`.

**Deduplication:**
- Before adding, check if the lemma already exists in `vocabulary_progress`. If yes, show "Already in vocabulary" instead of the add button.

No changes to SRSEngine or vocabulary data files.
