import type {
  Exercise,
  ExerciseProgress,
  ExercisesData,
  ExerciseTopicMeta,
  TopicStats,
  LevelStats,
  FrenchLevel,
  Language,
} from '@/types'
import { db } from '@/db'

// Lazy-loaded exercise data by language
const exerciseDataCache: Partial<Record<Language, ExercisesData>> = {}

/**
 * Load exercises for a given language from the JSON data files.
 */
export async function loadExercises(language: Language): Promise<ExercisesData> {
  if (exerciseDataCache[language]) {
    return exerciseDataCache[language]!
  }

  let data: ExercisesData
  switch (language) {
    case 'fr': {
      const mod = await import('@/data/exercises-fr.json')
      data = mod.default as ExercisesData
      break
    }
    case 'en': {
      const mod = await import('@/data/exercises-en.json')
      data = mod.default as ExercisesData
      break
    }
    default:
      data = { topics: [], exercises: [] }
  }

  exerciseDataCache[language] = data
  return data
}

/**
 * Get all topics for a language, optionally filtered by level.
 */
export async function getTopics(
  language: Language,
  level?: FrenchLevel
): Promise<ExerciseTopicMeta[]> {
  const data = await loadExercises(language)
  if (level) {
    return data.topics.filter((t) => t.level === level)
  }
  return data.topics
}

/**
 * Get exercises for specific topics.
 */
export async function getExercisesByTopics(
  language: Language,
  topicIds: string[]
): Promise<Exercise[]> {
  const data = await loadExercises(language)
  return data.exercises.filter((e) => topicIds.includes(e.topicId))
}

/**
 * Get exercises for a specific level.
 */
export async function getExercisesByLevel(
  language: Language,
  level: FrenchLevel
): Promise<Exercise[]> {
  const data = await loadExercises(language)
  return data.exercises.filter((e) => e.level === level)
}

/**
 * Build a session of 10 exercises with smart prioritization.
 *
 * Priority order:
 * 1. Unsolved exercises (never answered correctly)
 * 2. Previously incorrect exercises
 * 3. Exercises not attempted in > 7 days
 * 4. Random from remaining
 *
 * Balances exercise types (no more than 3-4 of the same type in a row).
 */
export async function buildSession(
  userId: string,
  language: Language,
  level: FrenchLevel,
  topicIds?: string[]
): Promise<Exercise[]> {
  const data = await loadExercises(language)

  // Get candidate exercises
  let candidates = topicIds
    ? data.exercises.filter((e) => topicIds.includes(e.topicId))
    : data.exercises.filter((e) => e.level === level)

  if (candidates.length === 0) return []

  // Get user progress for these exercises
  const progressMap = await getProgressMap(userId)

  const now = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

  // Categorize exercises by priority
  const unsolved: Exercise[] = []
  const previouslyWrong: Exercise[] = []
  const stale: Exercise[] = []
  const rest: Exercise[] = []

  for (const exercise of candidates) {
    const progress = progressMap.get(exercise.id)

    if (!progress) {
      unsolved.push(exercise)
    } else if (!progress.solved) {
      previouslyWrong.push(exercise)
    } else if (now - new Date(progress.lastAttempt).getTime() > sevenDaysMs) {
      stale.push(exercise)
    } else {
      rest.push(exercise)
    }
  }

  // Shuffle each bucket
  shuffle(unsolved)
  shuffle(previouslyWrong)
  shuffle(stale)
  shuffle(rest)

  // Pick up to 10, prioritizing unsolved > wrong > stale > rest
  const selected: Exercise[] = []
  const pools = [unsolved, previouslyWrong, stale, rest]

  for (const pool of pools) {
    for (const exercise of pool) {
      if (selected.length >= 10) break
      selected.push(exercise)
    }
    if (selected.length >= 10) break
  }

  // Balance types: no more than 3 of the same type in a row
  return balanceTypes(selected)
}

/**
 * Check a user's answer against the exercise's correct answer.
 */
export function checkAnswer(exercise: Exercise, userAnswer: string): boolean {
  switch (exercise.type) {
    case 'multiple_choice':
      return normalizeAnswer(userAnswer) === normalizeAnswer(exercise.correctAnswer)

    case 'fill_blank':
      return normalizeAnswer(userAnswer) === normalizeAnswer(exercise.correctAnswer)

    case 'translate': {
      const normalized = normalizeAnswer(userAnswer)
      if (normalized === normalizeAnswer(exercise.correctAnswer)) return true
      if (exercise.acceptableAnswers) {
        return exercise.acceptableAnswers.some(
          (alt) => normalizeAnswer(alt) === normalized
        )
      }
      return false
    }

    case 'matching':
      // Matching is checked pair-by-pair in the component
      // This function isn't used for matching type
      return true

    default:
      return false
  }
}

/**
 * Normalize an answer for comparison: lowercase, strip accents, trim.
 */
function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * Save the result of a single exercise attempt.
 */
export async function saveResult(
  userId: string,
  exercise: Exercise,
  correct: boolean
): Promise<void> {
  const odIndex = `${userId}_${exercise.id}`

  const existing = await db.exerciseProgress
    .where('odIndex')
    .equals(odIndex)
    .first()

  if (existing) {
    await db.exerciseProgress.update(existing.id, {
      attempts: existing.attempts + 1,
      correctCount: existing.correctCount + (correct ? 1 : 0),
      solved: existing.solved || correct,
      lastAttempt: new Date(),
      lastCorrect: correct,
    })
  } else {
    await db.exerciseProgress.add({
      id: crypto.randomUUID(),
      odIndex,
      odUserId: userId,
      exerciseId: exercise.id,
      topicId: exercise.topicId,
      level: exercise.level,
      solved: correct,
      attempts: 1,
      correctCount: correct ? 1 : 0,
      lastAttempt: new Date(),
      lastCorrect: correct,
    })
  }
}

/**
 * Get topic-level stats for the topic selector screen.
 */
export async function getTopicStats(
  userId: string,
  language: Language,
  level?: FrenchLevel
): Promise<TopicStats[]> {
  const data = await loadExercises(language)
  const topics = level ? data.topics.filter((t) => t.level === level) : data.topics

  // Get all user progress
  const allProgress = await db.exerciseProgress
    .where('odUserId')
    .equals(userId)
    .toArray()

  const progressByTopic = new Map<string, ExerciseProgress[]>()
  for (const p of allProgress) {
    const arr = progressByTopic.get(p.topicId) || []
    arr.push(p)
    progressByTopic.set(p.topicId, arr)
  }

  // Count total exercises per topic
  const exerciseCountByTopic = new Map<string, number>()
  for (const ex of data.exercises) {
    exerciseCountByTopic.set(ex.topicId, (exerciseCountByTopic.get(ex.topicId) || 0) + 1)
  }

  return topics.map((topic) => {
    const progress = progressByTopic.get(topic.id) || []
    const total = exerciseCountByTopic.get(topic.id) || 0
    const solved = progress.filter((p) => p.solved).length
    const attempts = progress.reduce((sum, p) => sum + p.attempts, 0)
    const correctCount = progress.reduce((sum, p) => sum + p.correctCount, 0)

    return {
      topicId: topic.id,
      topicName: topic.name,
      level: topic.level,
      total,
      solved,
      attempts,
      correctCount,
    }
  })
}

/**
 * Get aggregated stats for a level.
 */
export async function getLevelStats(
  userId: string,
  language: Language,
  level: FrenchLevel
): Promise<LevelStats> {
  const data = await loadExercises(language)
  const levelExercises = data.exercises.filter((e) => e.level === level)

  const exerciseIds = new Set(levelExercises.map((e) => e.id))

  const allProgress = await db.exerciseProgress
    .where('odUserId')
    .equals(userId)
    .toArray()

  const levelProgress = allProgress.filter((p) => exerciseIds.has(p.exerciseId))

  return {
    level,
    totalExercises: levelExercises.length,
    solved: levelProgress.filter((p) => p.solved).length,
    attempts: levelProgress.reduce((sum, p) => sum + p.attempts, 0),
    correctCount: levelProgress.reduce((sum, p) => sum + p.correctCount, 0),
  }
}

// --- Helpers ---

async function getProgressMap(userId: string): Promise<Map<string, ExerciseProgress>> {
  const all = await db.exerciseProgress
    .where('odUserId')
    .equals(userId)
    .toArray()

  const map = new Map<string, ExerciseProgress>()
  for (const p of all) {
    map.set(p.exerciseId, p)
  }
  return map
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Rearrange exercises so no more than 3 of the same type appear consecutively.
 */
function balanceTypes(exercises: Exercise[]): Exercise[] {
  if (exercises.length <= 1) return exercises

  const result: Exercise[] = []
  const remaining = [...exercises]

  while (remaining.length > 0) {
    // Count recent type streak
    let recentType: string | null = null
    let streak = 0
    if (result.length > 0) {
      recentType = result[result.length - 1].type
      streak = 1
      for (let i = result.length - 2; i >= 0; i--) {
        if (result[i].type === recentType) streak++
        else break
      }
    }

    // If streak >= 3, try to pick a different type
    if (streak >= 3 && recentType) {
      const diffIdx = remaining.findIndex((e) => e.type !== recentType)
      if (diffIdx !== -1) {
        result.push(remaining.splice(diffIdx, 1)[0])
        continue
      }
    }

    // Otherwise, just take the next one
    result.push(remaining.shift()!)
  }

  return result
}
