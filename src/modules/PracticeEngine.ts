import type {
  GrammarCard,
  PracticeType,
  PracticeExercise,
  PracticeResult,
  PracticeStats,
  FrenchLevel,
} from '@/types'
import { generateExercise, checkTranslation, analyzeGrammarUsage } from './AIService'
import { db } from '@/db'

const generateId = () => crypto.randomUUID()

export async function createExercise(
  card: GrammarCard,
  type: PracticeType
): Promise<PracticeExercise> {
  const result = await generateExercise(card.topic, card.level, type)

  return {
    id: generateId(),
    type,
    grammarTopic: card.topic,
    sourceText: result.sourceText,
    targetText: result.targetText,
    hints: result.hint ? [result.hint] : undefined,
  }
}

export async function checkWrittenAnswer(
  exercise: PracticeExercise,
  userAnswer: string,
  level: FrenchLevel
): Promise<PracticeResult> {
  if (!exercise.targetText) {
    return {
      isCorrect: false,
      userAnswer,
      feedback: 'Error: No target text available',
    }
  }

  const result = await checkTranslation(
    userAnswer,
    exercise.targetText,
    exercise.grammarTopic,
    level
  )

  return {
    isCorrect: result.isCorrect,
    userAnswer,
    feedback: result.feedback,
    grammarNotes: result.grammarNotes,
    correctAnswer: exercise.targetText,
  }
}

export async function checkSpokenAnswer(
  exercise: PracticeExercise,
  transcript: string,
  level: FrenchLevel
): Promise<PracticeResult> {
  // For repeat_aloud, compare transcript with target
  if (exercise.type === 'repeat_aloud') {
    const similarity = calculateSimilarity(
      transcript.toLowerCase(),
      exercise.targetText?.toLowerCase() || ''
    )

    const pronunciationScore = Math.round(similarity * 100)

    return {
      isCorrect: pronunciationScore >= 70,
      userAnswer: transcript,
      pronunciationScore,
      feedback:
        pronunciationScore >= 90
          ? 'Excellent! Votre prononciation est très bonne!'
          : pronunciationScore >= 70
          ? 'Bien! Continuez à pratiquer.'
          : 'Essayez encore. Écoutez attentivement.',
      correctAnswer: exercise.targetText,
    }
  }

  // For oral_translation, check grammar and content
  if (exercise.type === 'oral_translation') {
    const result = await checkTranslation(
      transcript,
      exercise.targetText || '',
      exercise.grammarTopic,
      level
    )

    // Calculate pronunciation score based on word match
    const similarity = calculateSimilarity(
      transcript.toLowerCase(),
      exercise.targetText?.toLowerCase() || ''
    )

    return {
      isCorrect: result.isCorrect,
      userAnswer: transcript,
      pronunciationScore: Math.round(similarity * 100),
      feedback: result.feedback,
      grammarNotes: result.grammarNotes,
      correctAnswer: exercise.targetText,
    }
  }

  // For grammar_dialog
  const analysis = await analyzeGrammarUsage(transcript, exercise.grammarTopic)

  return {
    isCorrect: analysis.usedCorrectly,
    userAnswer: transcript,
    feedback: analysis.feedback,
  }
}

// Simple Levenshtein-based similarity
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/).filter(Boolean)
  const words2 = str2.split(/\s+/).filter(Boolean)

  if (words2.length === 0) return 0
  if (words1.length === 0) return 0

  let matches = 0
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || levenshteinDistance(word1, word2) <= 1) {
        matches++
        break
      }
    }
  }

  return matches / Math.max(words1.length, words2.length)
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Update practice stats on a card
export async function updatePracticeStats(
  cardId: string,
  type: PracticeType,
  result: PracticeResult
): Promise<void> {
  const card = await db.grammarCards.get(cardId)
  if (!card) return

  const stats = { ...card.practiceStats }
  const now = new Date()

  switch (type) {
    case 'written_translation':
      stats.written_translation = {
        attempts: stats.written_translation.attempts + 1,
        correct: stats.written_translation.correct + (result.isCorrect ? 1 : 0),
        lastAttempt: now,
      }
      break

    case 'repeat_aloud':
      const currentAvg = stats.repeat_aloud.avgPronunciationScore
      const currentAttempts = stats.repeat_aloud.attempts
      const newScore = result.pronunciationScore || 0
      const newAvg =
        currentAttempts === 0
          ? newScore
          : (currentAvg * currentAttempts + newScore) / (currentAttempts + 1)

      stats.repeat_aloud = {
        attempts: currentAttempts + 1,
        avgPronunciationScore: Math.round(newAvg),
        lastAttempt: now,
      }
      break

    case 'oral_translation':
      const oralCurrentAvg = stats.oral_translation.avgPronunciationScore
      const oralCurrentAttempts = stats.oral_translation.attempts
      const oralNewScore = result.pronunciationScore || 0
      const oralNewAvg =
        oralCurrentAttempts === 0
          ? oralNewScore
          : (oralCurrentAvg * oralCurrentAttempts + oralNewScore) /
            (oralCurrentAttempts + 1)

      stats.oral_translation = {
        attempts: oralCurrentAttempts + 1,
        correct: stats.oral_translation.correct + (result.isCorrect ? 1 : 0),
        avgPronunciationScore: Math.round(oralNewAvg),
        lastAttempt: now,
      }
      break

    case 'grammar_dialog':
      stats.grammar_dialog = {
        sessions: stats.grammar_dialog.sessions,
        totalMessages: stats.grammar_dialog.totalMessages + 1,
        grammarUsageRate: result.isCorrect
          ? Math.min(1, stats.grammar_dialog.grammarUsageRate + 0.1)
          : Math.max(0, stats.grammar_dialog.grammarUsageRate - 0.05),
        lastSession: now,
      }
      break
  }

  await db.grammarCards.update(cardId, { practiceStats: stats })
}

export function getDefaultPracticeStats(): PracticeStats {
  return {
    written_translation: { attempts: 0, correct: 0 },
    repeat_aloud: { attempts: 0, avgPronunciationScore: 0 },
    oral_translation: { attempts: 0, correct: 0, avgPronunciationScore: 0 },
    grammar_dialog: { sessions: 0, totalMessages: 0, grammarUsageRate: 0 },
  }
}
