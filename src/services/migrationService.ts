// src/services/migrationService.ts
// Service to migrate local data (IndexedDB/Zustand) to Supabase

import { db } from '../db'
import { userDataService } from './userDataService'
import { useAppStore } from '../store/useAppStore'
import type { Database } from '../types/supabase'
import type {
  GrammarCard as LocalGrammarCard,
  VocabularyProgress as LocalVocabularyProgress,
  Conversation as LocalConversation,
  PracticeSession as LocalPracticeSession,
  TeacherMessage as LocalTeacherMessage,
} from '../types'

export interface MigrationResult {
  success: boolean
  error?: string
  stats: {
    profile: boolean
    progress: boolean
    grammarCards: number
    vocabularyProgress: number
    conversations: number
    practiceSessions: number
    teacherMessages: number
  }
}

/**
 * Check if there is any local data that could be migrated
 */
export async function checkForLocalData(): Promise<boolean> {
  const appState = useAppStore.getState()

  // Check if Zustand has user data
  if (appState.isOnboarded && appState.user) {
    return true
  }

  // Check if IndexedDB has any data
  const [grammarCards, conversations, vocabularyProgress] = await Promise.all([
    db.grammarCards.count(),
    db.conversations.count(),
    db.vocabularyProgress.count(),
  ])

  return grammarCards > 0 || conversations > 0 || vocabularyProgress > 0
}

/**
 * Migrate all local data to Supabase
 */
export async function migrateLocalDataToSupabase(userId: string): Promise<MigrationResult> {
  const stats: MigrationResult['stats'] = {
    profile: false,
    progress: false,
    grammarCards: 0,
    vocabularyProgress: 0,
    conversations: 0,
    practiceSessions: 0,
    teacherMessages: 0,
  }

  try {
    const appState = useAppStore.getState()

    // 1. Migrate user profile
    if (appState.user && appState.isOnboarded) {
      const existingProfile = await userDataService.getProfile(userId)
      if (!existingProfile) {
        await userDataService.createProfile(userId, {
          name: appState.user.name,
          native_language: appState.user.nativeLanguage,
          french_level: appState.user.frenchLevel,
          preferred_ai_provider: appState.user.preferredAiProvider,
          speech_pause_timeout: appState.user.speechPauseTimeout,
          speech_settings: appState.user.speechSettings,
          is_onboarded: true,
        })
        stats.profile = true
      } else {
        console.warn('[Migration] User profile already exists in Supabase, skipping')
      }
    }

    // 2. Migrate user progress
    if (appState.progress && appState.isOnboarded) {
      const existingProgress = await userDataService.getProgress(userId)
      if (!existingProgress) {
        await userDataService.createProgress(userId)
        await userDataService.updateProgress(userId, {
          total_conversations: appState.progress.totalConversations,
          total_messages_sent: appState.progress.totalMessagesSent,
          topics_covered: appState.progress.topicsCovered,
          grammar_cards_mastered: appState.progress.grammarCardsMastered,
          current_streak: appState.progress.currentStreak,
          last_activity_date: appState.progress.lastActivityDate instanceof Date
            ? appState.progress.lastActivityDate.toISOString()
            : appState.progress.lastActivityDate,
        })
        stats.progress = true
      } else {
        console.warn('[Migration] User progress already exists in Supabase, skipping')
      }
    }

    // 3. Migrate grammar cards
    const localGrammarCards = await db.grammarCards.toArray()
    for (const card of localGrammarCards) {
      try {
        const existingCard = await userDataService.getGrammarCard(card.id)
        if (!existingCard) {
          await userDataService.createGrammarCard(mapGrammarCardToSupabase(card, userId))
          stats.grammarCards++
        } else {
          console.warn(`[Migration] Grammar card ${card.id} already exists, skipping`)
        }
      } catch (error) {
        console.warn(`[Migration] Failed to migrate grammar card ${card.id}:`, error)
      }
    }

    // 4. Migrate vocabulary progress
    const localVocabProgress = await db.vocabularyProgress.toArray()
    for (const progress of localVocabProgress) {
      try {
        const existingProgress = await userDataService.getVocabularyProgressByCardId(userId, progress.cardId)
        if (!existingProgress) {
          await userDataService.createVocabularyProgress(mapVocabularyProgressToSupabase(progress, userId))
          stats.vocabularyProgress++
        } else {
          console.warn(`[Migration] Vocabulary progress for card ${progress.cardId} already exists, skipping`)
        }
      } catch (error) {
        console.warn(`[Migration] Failed to migrate vocabulary progress ${progress.id}:`, error)
      }
    }

    // 5. Migrate conversations
    const localConversations = await db.conversations.toArray()
    for (const conversation of localConversations) {
      try {
        const existingConversation = await userDataService.getConversation(conversation.id)
        if (!existingConversation) {
          await userDataService.createConversation(mapConversationToSupabase(conversation, userId))
          stats.conversations++
        } else {
          console.warn(`[Migration] Conversation ${conversation.id} already exists, skipping`)
        }
      } catch (error) {
        console.warn(`[Migration] Failed to migrate conversation ${conversation.id}:`, error)
      }
    }

    // 6. Migrate practice sessions
    const localPracticeSessions = await db.practiceSessions.toArray()
    for (const session of localPracticeSessions) {
      try {
        // Check if session already exists by looking at existing sessions for this card
        const existingSessions = await userDataService.getPracticeSessions(userId, session.cardId)
        const isDuplicate = existingSessions.some(s => s.id === session.id)
        if (!isDuplicate) {
          await userDataService.createPracticeSession(mapPracticeSessionToSupabase(session, userId))
          stats.practiceSessions++
        } else {
          console.warn(`[Migration] Practice session ${session.id} already exists, skipping`)
        }
      } catch (error) {
        console.warn(`[Migration] Failed to migrate practice session ${session.id}:`, error)
      }
    }

    // 7. Migrate teacher messages
    const localTeacherMessages = await db.teacherMessages.toArray()
    for (const message of localTeacherMessages) {
      try {
        await userDataService.createTeacherMessage(mapTeacherMessageToSupabase(message, userId))
        stats.teacherMessages++
      } catch (error) {
        console.warn(`[Migration] Failed to migrate teacher message ${message.id}:`, error)
      }
    }

    return { success: true, stats }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Migration] Migration failed:', error)
    return { success: false, error: errorMessage, stats }
  }
}

/**
 * Clear all local data after successful migration
 */
export async function clearLocalData(): Promise<void> {
  // Clear all IndexedDB tables
  await Promise.all([
    db.grammarCards.clear(),
    db.conversations.clear(),
    db.vocabularyProgress.clear(),
    db.practiceSessions.clear(),
    db.teacherMessages.clear(),
    db.topics.clear(),
  ])

  // Remove Zustand persisted storage from localStorage
  localStorage.removeItem('julang-app-storage')
  localStorage.removeItem('julang-teacher-chat-storage')
}

// ============ Type Mapping Helpers ============

/**
 * Map local GrammarCard to Supabase format
 */
function mapGrammarCardToSupabase(
  card: LocalGrammarCard,
  userId: string
): Database['public']['Tables']['grammar_cards']['Insert'] {
  return {
    id: card.id,
    user_id: userId,
    topic_id: card.topicId,
    topic: card.topic,
    level: card.level,
    explanation: card.explanation,
    // Map examples from {french, russian} to {fr, ru}
    examples: card.examples.map(ex => ({
      fr: ex.french,
      ru: ex.russian,
    })),
    common_mistakes: card.commonMistakes,
    is_enhanced: card.isEnhanced,
    enhanced_explanation: card.enhancedExplanation ?? null,
    next_review: card.nextReview instanceof Date
      ? card.nextReview.toISOString()
      : card.nextReview,
    ease_factor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
    last_reviewed: card.lastReviewed instanceof Date
      ? card.lastReviewed.toISOString()
      : card.lastReviewed ?? null,
    practice_stats: mapPracticeStatsToSupabase(card.practiceStats),
    created_at: card.createdAt instanceof Date
      ? card.createdAt.toISOString()
      : card.createdAt,
  }
}

/**
 * Map local practice stats to Supabase format (Date to ISO string)
 */
function mapPracticeStatsToSupabase(stats: LocalGrammarCard['practiceStats']) {
  return {
    written_translation: {
      attempts: stats.written_translation.attempts,
      correct: stats.written_translation.correct,
      lastAttempt: stats.written_translation.lastAttempt instanceof Date
        ? stats.written_translation.lastAttempt.toISOString()
        : stats.written_translation.lastAttempt,
    },
    repeat_aloud: {
      attempts: stats.repeat_aloud.attempts,
      avgPronunciationScore: stats.repeat_aloud.avgPronunciationScore,
      lastAttempt: stats.repeat_aloud.lastAttempt instanceof Date
        ? stats.repeat_aloud.lastAttempt.toISOString()
        : stats.repeat_aloud.lastAttempt,
    },
    oral_translation: {
      attempts: stats.oral_translation.attempts,
      correct: stats.oral_translation.correct,
      avgPronunciationScore: stats.oral_translation.avgPronunciationScore,
      lastAttempt: stats.oral_translation.lastAttempt instanceof Date
        ? stats.oral_translation.lastAttempt.toISOString()
        : stats.oral_translation.lastAttempt,
    },
    grammar_dialog: {
      sessions: stats.grammar_dialog.sessions,
      totalMessages: stats.grammar_dialog.totalMessages,
      grammarUsageRate: stats.grammar_dialog.grammarUsageRate,
      lastSession: stats.grammar_dialog.lastSession instanceof Date
        ? stats.grammar_dialog.lastSession.toISOString()
        : stats.grammar_dialog.lastSession,
    },
  }
}

/**
 * Map local VocabularyProgress to Supabase format
 */
function mapVocabularyProgressToSupabase(
  progress: LocalVocabularyProgress,
  userId: string
): Database['public']['Tables']['vocabulary_progress']['Insert'] {
  return {
    id: progress.id,
    user_id: userId,
    card_id: progress.cardId,
    next_review: progress.nextReview instanceof Date
      ? progress.nextReview.toISOString()
      : progress.nextReview,
    ease_factor: progress.easeFactor,
    interval: progress.interval,
    repetitions: progress.repetitions,
    last_reviewed: progress.lastReviewed instanceof Date
      ? progress.lastReviewed.toISOString()
      : progress.lastReviewed ?? null,
    created_at: progress.createdAt instanceof Date
      ? progress.createdAt.toISOString()
      : progress.createdAt,
  }
}

/**
 * Map local Conversation to Supabase format
 */
function mapConversationToSupabase(
  conversation: LocalConversation,
  userId: string
): Database['public']['Tables']['conversations']['Insert'] {
  return {
    id: conversation.id,
    user_id: userId,
    topic_id: conversation.topicId,
    ai_provider: conversation.aiProvider,
    mode: conversation.mode,
    started_at: conversation.startedAt instanceof Date
      ? conversation.startedAt.toISOString()
      : conversation.startedAt,
    ended_at: conversation.endedAt instanceof Date
      ? conversation.endedAt.toISOString()
      : conversation.endedAt ?? null,
    duration_ms: conversation.durationMs ?? 0,
    messages: conversation.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date
        ? msg.timestamp.toISOString()
        : msg.timestamp,
      audioUrl: msg.audioUrl,
    })),
    quality_score: conversation.qualityScore ?? null,
  }
}

/**
 * Map local PracticeSession to Supabase format
 */
function mapPracticeSessionToSupabase(
  session: LocalPracticeSession,
  userId: string
): Database['public']['Tables']['practice_sessions']['Insert'] {
  return {
    id: session.id,
    user_id: userId,
    card_id: session.cardId,
    practice_type: session.practiceType,
    started_at: session.startedAt instanceof Date
      ? session.startedAt.toISOString()
      : session.startedAt,
    ended_at: session.endedAt instanceof Date
      ? session.endedAt.toISOString()
      : session.endedAt ?? null,
    exercises_completed: session.exercisesCompleted,
    correct_answers: session.correctAnswers,
    avg_pronunciation_score: session.avgPronunciationScore ?? null,
    final_quality: session.finalQuality,
  }
}

/**
 * Map local TeacherMessage to Supabase format
 */
function mapTeacherMessageToSupabase(
  message: LocalTeacherMessage,
  userId: string
): Database['public']['Tables']['teacher_messages']['Insert'] {
  return {
    id: message.id,
    user_id: userId,
    role: message.role,
    content: message.content,
    context: message.context,
    timestamp: message.timestamp instanceof Date
      ? message.timestamp.toISOString()
      : message.timestamp,
  }
}
