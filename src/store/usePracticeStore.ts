import { create } from 'zustand'
import type {
  PracticeType,
  PracticeExercise,
  PracticeResult,
  PracticeSession,
  GrammarCard,
} from '@/types'

interface PracticeState {
  // Current session
  currentCard: GrammarCard | null
  currentType: PracticeType
  currentExercise: PracticeExercise | null
  currentSession: PracticeSession | null

  // Session stats
  exercisesCompleted: number
  correctAnswers: number
  pronunciationScores: number[]

  // Results history for current session
  results: PracticeResult[]

  // Actions
  startSession: (card: GrammarCard, type?: PracticeType) => void
  setCurrentType: (type: PracticeType) => void
  setCurrentExercise: (exercise: PracticeExercise) => void
  addResult: (result: PracticeResult) => void
  endSession: () => PracticeSession | null
  resetSession: () => void
}

const generateId = () => crypto.randomUUID()

export const usePracticeStore = create<PracticeState>((set, get) => ({
  currentCard: null,
  currentType: 'written_translation',
  currentExercise: null,
  currentSession: null,
  exercisesCompleted: 0,
  correctAnswers: 0,
  pronunciationScores: [],
  results: [],

  startSession: (card, type = 'written_translation') => {
    const session: PracticeSession = {
      id: generateId(),
      userId: card.userId,
      cardId: card.id,
      practiceType: type,
      startedAt: new Date(),
      exercisesCompleted: 0,
      correctAnswers: 0,
      finalQuality: 0,
    }

    set({
      currentCard: card,
      currentType: type,
      currentSession: session,
      exercisesCompleted: 0,
      correctAnswers: 0,
      pronunciationScores: [],
      results: [],
    })
  },

  setCurrentType: (type) => set({ currentType: type }),

  setCurrentExercise: (exercise) => set({ currentExercise: exercise }),

  addResult: (result) =>
    set((state) => {
      const newExercisesCompleted = state.exercisesCompleted + 1
      const newCorrectAnswers = result.isCorrect
        ? state.correctAnswers + 1
        : state.correctAnswers
      const newPronunciationScores = result.pronunciationScore
        ? [...state.pronunciationScores, result.pronunciationScore]
        : state.pronunciationScores

      return {
        results: [...state.results, result],
        exercisesCompleted: newExercisesCompleted,
        correctAnswers: newCorrectAnswers,
        pronunciationScores: newPronunciationScores,
      }
    }),

  endSession: () => {
    const state = get()
    if (!state.currentSession) return null

    const avgPronunciation =
      state.pronunciationScores.length > 0
        ? state.pronunciationScores.reduce((a, b) => a + b, 0) /
          state.pronunciationScores.length
        : undefined

    // Calculate quality based on correct percentage
    const correctPercentage =
      state.exercisesCompleted > 0
        ? state.correctAnswers / state.exercisesCompleted
        : 0

    let quality: number
    if (correctPercentage >= 0.9) quality = 5
    else if (correctPercentage >= 0.8) quality = 4
    else if (correctPercentage >= 0.6) quality = 3
    else if (correctPercentage >= 0.4) quality = 2
    else if (correctPercentage >= 0.2) quality = 1
    else quality = 0

    const completedSession: PracticeSession = {
      ...state.currentSession,
      endedAt: new Date(),
      exercisesCompleted: state.exercisesCompleted,
      correctAnswers: state.correctAnswers,
      avgPronunciationScore: avgPronunciation,
      finalQuality: quality,
    }

    set({
      currentSession: completedSession,
    })

    return completedSession
  },

  resetSession: () =>
    set({
      currentCard: null,
      currentType: 'written_translation',
      currentExercise: null,
      currentSession: null,
      exercisesCompleted: 0,
      correctAnswers: 0,
      pronunciationScores: [],
      results: [],
    }),
}))
