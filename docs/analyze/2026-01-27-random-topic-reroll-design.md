# Random Topic Reroll

## Overview

When the user presses "Random topic", instead of immediately starting a conversation, show the selected topic with options to accept or reroll.

## Current Behavior

`handleRandomTopic()` in `TopicScreen.tsx` picks a random topic and immediately navigates to `/conversation?topic=...`.

## New Behavior

1. User presses "Random topic".
2. A random topic appears in a preview card below the button.
3. Two buttons: "Start" (navigates to conversation) and "Another" (picks a new random topic).
4. Pressing "Another" replaces the topic with a different one (avoiding repeat of the current topic).
5. The preview card can be dismissed by selecting a category or typing a custom topic.

## Implementation

**File:** `src/components/TopicSelection/TopicScreen.tsx`

**Changes:**
- Add state `randomTopic: string | null`.
- `handleRandomTopic` sets `randomTopic` instead of navigating.
- "Another" button calls `handleRandomTopic` again, excluding current `randomTopic` from selection.
- Render a preview card between the random button and custom topic section when `randomTopic` is set.
- Setting `selectedCategory` or focusing custom input resets `randomTopic` to null.

No new files, no new modules. Single-file change.
