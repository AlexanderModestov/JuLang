import { userDataService } from '@/services/userDataService'
import { apiFetch } from '@/lib/apiClient'
import type { Database } from '@/types/supabase'
import type { FrenchLevel, TeacherLanguage, TeacherMessage } from '@/types'

// Type alias for Supabase teacher message
type SupabaseTeacherMessage = Database['public']['Tables']['teacher_messages']['Row']

/**
 * Context for teacher chat messages
 */
export interface TeacherChatContext {
  screen: string
  itemId?: string
  itemPreview?: string
}

/**
 * Parameters for sending a message to the teacher
 */
export interface SendMessageParams {
  content: string
  context: TeacherChatContext
  userLevel: FrenchLevel
  teacherLanguage: TeacherLanguage
  userId: string
}

/**
 * Convert Supabase teacher message to local TeacherMessage type
 */
function toLocalMessage(msg: SupabaseTeacherMessage): TeacherMessage {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    context: msg.context,
  }
}

/**
 * Send a message to the AI teacher and get a response
 */
export async function sendMessage(params: SendMessageParams): Promise<string> {
  const { content, context, userLevel, teacherLanguage, userId } = params

  // Get recent message history for context
  const history = await getHistory(userId, 10, 0)

  // Build messages array for API
  const messages = history.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  // Add the new user message
  messages.push({ role: 'user' as const, content })

  // Save user message to database
  await userDataService.createTeacherMessage({
    user_id: userId,
    role: 'user',
    content,
    context,
  })

  // Call the API — send params instead of systemPrompt (prompt is built server-side)
  const response = await apiFetch('/api/teacher-chat', {
    method: 'POST',
    body: JSON.stringify({
      userLevel,
      teacherLanguage,
      context,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to get teacher response')
  }

  const data = await response.json()
  const assistantContent = data.content as string

  // Save assistant message to database
  await userDataService.createTeacherMessage({
    user_id: userId,
    role: 'assistant',
    content: assistantContent,
    context,
  })

  return assistantContent
}

/**
 * Get message history from the database
 */
export async function getHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<TeacherMessage[]> {
  const messages = await userDataService.getTeacherMessages(userId, limit, offset)
  return messages.map(toLocalMessage)
}

/**
 * Clear all teacher chat history
 */
export async function clearHistory(userId: string): Promise<void> {
  await userDataService.clearTeacherMessages(userId)
}

/**
 * Get the total count of messages
 */
export async function getMessageCount(userId: string): Promise<number> {
  return userDataService.getTeacherMessageCount(userId)
}
