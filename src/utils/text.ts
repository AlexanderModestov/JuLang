/**
 * Text utilities for French text normalization and comparison.
 * Used to make diacritics optional in answer checking.
 */

/**
 * Removes diacritical marks from text for comparison.
 * "français" → "francais"
 * "élève" → "eleve"
 * "ça" → "ca"
 */
export function removeDiacritics(text: string): string {
  return text
    .normalize('NFD')                    // decompose: é → e + combining accent
    .replace(/[\u0300-\u036f]/g, '')     // remove combining diacritical marks
}

/**
 * Normalizes text for comparison: removes diacritics,
 * converts to lowercase, removes extra whitespace.
 */
export function normalizeForComparison(text: string): string {
  return removeDiacritics(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Checks equivalence of two strings ignoring diacritics.
 */
export function isEquivalent(userAnswer: string, correctAnswer: string): boolean {
  return normalizeForComparison(userAnswer) === normalizeForComparison(correctAnswer)
}

/**
 * Checks if the answer differs only by diacritics.
 * Returns true if meaning is the same but diacritics differ.
 */
export function differsByDiacriticsOnly(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = normalizeForComparison(userAnswer)
  const normalizedCorrect = normalizeForComparison(correctAnswer)

  return normalizedUser === normalizedCorrect && userAnswer !== correctAnswer
}
