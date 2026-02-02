// src/types/supabase.ts
// Database types for Supabase - matches the SQL schema

// Speech settings type
export interface SpeechSettings {
  voiceName: string | null
  rate: number
  pitch: number
}

// Practice stats type
export interface PracticeStats {
  written_translation: { attempts: number; correct: number; lastAttempt?: string }
  repeat_aloud: { attempts: number; avgPronunciationScore: number; lastAttempt?: string }
  oral_translation: { attempts: number; correct: number; avgPronunciationScore: number; lastAttempt?: string }
  grammar_dialog: { sessions: number; totalMessages: number; grammarUsageRate: number; lastSession?: string }
}

// Conversation message type
export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  audioUrl?: string
}

// Teacher message context type
export interface TeacherMessageContext {
  screen: string
  itemId?: string
  itemPreview?: string
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          name: string | null
          native_language: string
          french_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          preferred_ai_provider: string
          speech_pause_timeout: number
          speech_settings: SpeechSettings
          topics_of_interest: string[]
          is_onboarded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          native_language?: string
          french_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          preferred_ai_provider?: string
          speech_pause_timeout?: number
          speech_settings?: SpeechSettings
          topics_of_interest?: string[]
          is_onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          native_language?: string
          french_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          preferred_ai_provider?: string
          speech_pause_timeout?: number
          speech_settings?: SpeechSettings
          topics_of_interest?: string[]
          is_onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          total_conversations: number
          total_messages_sent: number
          topics_covered: string[]
          grammar_cards_mastered: number
          current_streak: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_conversations?: number
          total_messages_sent?: number
          topics_covered?: string[]
          grammar_cards_mastered?: number
          current_streak?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_conversations?: number
          total_messages_sent?: number
          topics_covered?: string[]
          grammar_cards_mastered?: number
          current_streak?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      grammar_cards: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          topic: string
          level: string
          explanation: string | null
          examples: Array<{ fr: string; ru: string }>
          common_mistakes: string[]
          is_enhanced: boolean
          enhanced_explanation: string | null
          next_review: string
          ease_factor: number
          interval: number
          repetitions: number
          last_reviewed: string | null
          practice_stats: PracticeStats
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          topic: string
          level: string
          explanation?: string | null
          examples?: Array<{ fr: string; ru: string }>
          common_mistakes?: string[]
          is_enhanced?: boolean
          enhanced_explanation?: string | null
          next_review?: string
          ease_factor?: number
          interval?: number
          repetitions?: number
          last_reviewed?: string | null
          practice_stats?: PracticeStats
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          topic?: string
          level?: string
          explanation?: string | null
          examples?: Array<{ fr: string; ru: string }>
          common_mistakes?: string[]
          is_enhanced?: boolean
          enhanced_explanation?: string | null
          next_review?: string
          ease_factor?: number
          interval?: number
          repetitions?: number
          last_reviewed?: string | null
          practice_stats?: PracticeStats
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vocabulary_progress: {
        Row: {
          id: string
          user_id: string
          card_id: string
          next_review: string
          ease_factor: number
          interval: number
          repetitions: number
          last_reviewed: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          next_review?: string
          ease_factor?: number
          interval?: number
          repetitions?: number
          last_reviewed?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          next_review?: string
          ease_factor?: number
          interval?: number
          repetitions?: number
          last_reviewed?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          topic_id: string | null
          ai_provider: string | null
          mode: string
          started_at: string
          ended_at: string | null
          duration_ms: number
          messages: ConversationMessage[]
          quality_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id?: string | null
          ai_provider?: string | null
          mode?: string
          started_at?: string
          ended_at?: string | null
          duration_ms?: number
          messages?: ConversationMessage[]
          quality_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string | null
          ai_provider?: string | null
          mode?: string
          started_at?: string
          ended_at?: string | null
          duration_ms?: number
          messages?: ConversationMessage[]
          quality_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          card_id: string
          practice_type: string
          started_at: string
          ended_at: string | null
          exercises_completed: number
          correct_answers: number
          avg_pronunciation_score: number | null
          final_quality: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          practice_type: string
          started_at?: string
          ended_at?: string | null
          exercises_completed?: number
          correct_answers?: number
          avg_pronunciation_score?: number | null
          final_quality?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          practice_type?: string
          started_at?: string
          ended_at?: string | null
          exercises_completed?: number
          correct_answers?: number
          avg_pronunciation_score?: number | null
          final_quality?: number | null
          created_at?: string
        }
        Relationships: []
      }
      teacher_messages: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          context: TeacherMessageContext
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          context?: TeacherMessageContext
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          content?: string
          context?: TeacherMessageContext
          timestamp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
