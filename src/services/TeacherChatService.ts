import { userDataService } from '@/services/userDataService'
import type { Database } from '@/types/supabase'
import type { FrenchLevel, TeacherLanguage, TeacherMessage } from '@/types'

// API base URL - empty for same-origin requests on Vercel
const API_BASE = ''

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
 * Build the system prompt for the AI French teacher
 */
export function buildSystemPrompt(
  userLevel: FrenchLevel,
  teacherLanguage: TeacherLanguage,
  context: TeacherChatContext
): string {
  const languageInstructions = getLanguageInstructions(teacherLanguage, userLevel)
  const contextInfo = getContextInfo(context)

  return `Tu es un professeur de français patient et bienveillant pour des étudiants russophones.

Niveau de l'élève: ${userLevel}

${languageInstructions}

${contextInfo}

Règles importantes:
1. Sois patient et encourageant avec les débutants
2. Donne des explications claires avec des exemples concrets
3. Si l'élève pose une question de grammaire, explique la règle avec 2-3 exemples
4. Si l'élève ne comprend pas, reformule plus simplement
5. Utilise des phrases courtes pour les niveaux A1-A2
6. Pour les questions de vocabulaire, donne aussi des synonymes et antonymes quand c'est pertinent
7. Corrige les erreurs gentiment en expliquant pourquoi c'est incorrect

IMPORTANT concernant l'orthographe:
- NE corrige PAS l'absence d'accents ou de signes diacritiques (é, è, ê, ç, ï, etc.)
- Si l'élève écrit "francais" au lieu de "français" — c'est acceptable, ne commente pas
- Concentre-toi sur la grammaire, le vocabulaire et le sens, pas sur les accents
`
}

/**
 * Get language instructions based on teacher language setting
 */
function getLanguageInstructions(
  teacherLanguage: TeacherLanguage,
  userLevel: FrenchLevel
): string {
  switch (teacherLanguage) {
    case 'ru':
      return `Langue de réponse: Réponds TOUJOURS en russe.
Les exemples de phrases françaises doivent être accompagnés de traductions russes.
Explique les règles de grammaire en russe.`

    case 'fr':
      return `Langue de réponse: Réponds TOUJOURS en français simple.
Adapte ton vocabulaire au niveau ${userLevel}.
N'utilise pas de russe sauf si l'élève ne comprend vraiment pas.`

    case 'adaptive':
      return `Langue de réponse: Adapte ta langue au contexte.
- Pour les questions simples de vocabulaire: réponds en russe avec des exemples français
- Pour les questions de grammaire: explique en russe, donne des exemples en français
- Pour la pratique conversationnelle: réponds en français simple adapté au niveau ${userLevel}
- Si l'élève écrit en russe, réponds en russe
- Si l'élève écrit en français, réponds en français avec des clarifications en russe si nécessaire`

    default:
      return ''
  }
}

/**
 * Get context information for the system prompt
 */
function getContextInfo(context: TeacherChatContext): string {
  const parts: string[] = []

  parts.push(`L'élève est actuellement sur l'écran: ${context.screen}`)

  if (context.itemId && context.itemPreview) {
    parts.push(`Contexte: L'élève regarde "${context.itemPreview}" (ID: ${context.itemId})`)
    parts.push(`Si la question concerne cet élément, aide avec des explications spécifiques.`)
  }

  return parts.join('\n')
}

/**
 * Send a message to the AI teacher and get a response
 */
export async function sendMessage(params: SendMessageParams): Promise<string> {
  const { content, context, userLevel, teacherLanguage, userId } = params

  // Get recent message history for context
  const history = await getHistory(userId, 10, 0)

  // Build messages array for API
  const systemPrompt = buildSystemPrompt(userLevel, teacherLanguage, context)
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

  // Call the API
  const response = await fetch(`${API_BASE}/api/teacher-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt,
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
