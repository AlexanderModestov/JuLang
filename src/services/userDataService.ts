// src/services/userDataService.ts
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'
import type { Language } from '../types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProgress = Database['public']['Tables']['user_progress']['Row']
type GrammarCard = Database['public']['Tables']['grammar_cards']['Row']
type VocabularyProgress = Database['public']['Tables']['vocabulary_progress']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type PracticeSession = Database['public']['Tables']['practice_sessions']['Row']
type TeacherMessage = Database['public']['Tables']['teacher_messages']['Row']

export const userDataService = {
  // ============ User Profile ============
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  },

  async createProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({ id: userId, ...profile })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ User Progress ============
  async getProgress(userId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createProgress(userId: string): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({ user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ Grammar Cards ============
  async getGrammarCards(userId: string, language?: Language): Promise<GrammarCard[]> {
    let query = supabase
      .from('grammar_cards')
      .select('*')
      .eq('user_id', userId)
      .order('next_review', { ascending: true })

    if (language) {
      query = query.eq('language', language)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getGrammarCard(cardId: string): Promise<GrammarCard | null> {
    const { data, error } = await supabase
      .from('grammar_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getGrammarCardsDue(userId: string, language?: Language): Promise<GrammarCard[]> {
    let query = supabase
      .from('grammar_cards')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })

    if (language) {
      query = query.eq('language', language)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createGrammarCard(card: Database['public']['Tables']['grammar_cards']['Insert']): Promise<GrammarCard> {
    const { data, error } = await supabase
      .from('grammar_cards')
      .insert(card)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateGrammarCard(cardId: string, updates: Partial<GrammarCard>): Promise<GrammarCard> {
    const { data, error } = await supabase
      .from('grammar_cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteGrammarCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('grammar_cards')
      .delete()
      .eq('id', cardId)

    if (error) throw error
  },

  // ============ Vocabulary Progress ============
  async getVocabularyProgress(userId: string, language?: Language): Promise<VocabularyProgress[]> {
    let query = supabase
      .from('vocabulary_progress')
      .select('*')
      .eq('user_id', userId)

    if (language) {
      query = query.eq('language', language)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getVocabularyProgressByCardId(userId: string, cardId: string): Promise<VocabularyProgress | null> {
    const { data, error } = await supabase
      .from('vocabulary_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getVocabularyDue(userId: string, language?: Language): Promise<VocabularyProgress[]> {
    let query = supabase
      .from('vocabulary_progress')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })

    if (language) {
      query = query.eq('language', language)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createVocabularyProgress(progress: Database['public']['Tables']['vocabulary_progress']['Insert']): Promise<VocabularyProgress> {
    const { data, error } = await supabase
      .from('vocabulary_progress')
      .insert(progress)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateVocabularyProgress(progressId: string, updates: Partial<VocabularyProgress>): Promise<VocabularyProgress> {
    const { data, error } = await supabase
      .from('vocabulary_progress')
      .update(updates)
      .eq('id', progressId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ Conversations ============
  async getConversations(userId: string, language?: Language): Promise<Conversation[]> {
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (language) {
      query = query.eq('language', language)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createConversation(conversation: Database['public']['Tables']['conversations']['Insert']): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ Practice Sessions ============
  async getPracticeSessions(userId: string, cardId?: string): Promise<PracticeSession[]> {
    let query = supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (cardId) {
      query = query.eq('card_id', cardId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createPracticeSession(session: Database['public']['Tables']['practice_sessions']['Insert']): Promise<PracticeSession> {
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updatePracticeSession(sessionId: string, updates: Partial<PracticeSession>): Promise<PracticeSession> {
    const { data, error } = await supabase
      .from('practice_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ============ Teacher Messages ============
  async getTeacherMessages(userId: string, limit = 50, offset = 0): Promise<TeacherMessage[]> {
    const { data, error } = await supabase
      .from('teacher_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return (data || []).reverse()
  },

  async createTeacherMessage(message: Database['public']['Tables']['teacher_messages']['Insert']): Promise<TeacherMessage> {
    const { data, error } = await supabase
      .from('teacher_messages')
      .insert(message)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async clearTeacherMessages(userId: string): Promise<void> {
    const { error } = await supabase
      .from('teacher_messages')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  },

  async getTeacherMessageCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('teacher_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    return count || 0
  },
}
