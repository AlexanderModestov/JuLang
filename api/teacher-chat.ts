import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { verifyAuth } from './_lib/auth.js'
import { handleCors } from './_lib/cors.js'
import { checkRateLimit } from './_lib/rateLimit.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
type TeacherLanguage = 'ru' | 'fr' | 'adaptive'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface TeacherChatContext {
  screen: string
  itemId?: string
  itemPreview?: string
}

const VALID_LEVELS: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const VALID_LANGUAGES: TeacherLanguage[] = ['ru', 'fr', 'adaptive']

function buildSystemPrompt(
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

function getContextInfo(context: TeacherChatContext): string {
  const parts: string[] = []

  parts.push(`L'élève est actuellement sur l'écran: ${context.screen}`)

  if (context.itemId && context.itemPreview) {
    parts.push(`Contexte: L'élève regarde "${context.itemPreview}" (ID: ${context.itemId})`)
    parts.push(`Si la question concerne cet élément, aide avec des explications spécifiques.`)
  }

  return parts.join('\n')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await verifyAuth(req, res)
  if (!user) return

  const rl = checkRateLimit(user.id, 'teacher-chat')
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter))
    return res.status(429).json({ error: 'Too many requests', retryAfter: rl.retryAfter })
  }

  try {
    const { userLevel, teacherLanguage, context, messages } = req.body as {
      userLevel: FrenchLevel
      teacherLanguage: TeacherLanguage
      context: TeacherChatContext
      messages: Message[]
    }

    // Validate required fields
    if (!userLevel || !messages || !context) {
      return res.status(400).json({ error: 'Missing userLevel, context, or messages' })
    }

    // Validate enums
    if (!VALID_LEVELS.includes(userLevel)) {
      return res.status(400).json({ error: 'Invalid userLevel' })
    }
    const lang = VALID_LANGUAGES.includes(teacherLanguage) ? teacherLanguage : 'adaptive'

    // Truncate context fields to prevent abuse
    const safeContext: TeacherChatContext = {
      screen: (context.screen || '').slice(0, 100),
      itemId: context.itemId?.slice(0, 100),
      itemPreview: context.itemPreview?.slice(0, 200),
    }

    // Build system prompt server-side from validated params
    const systemPrompt = buildSystemPrompt(userLevel, lang, safeContext)

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      max_tokens: 500,
      temperature: 0.7,
    })

    return res.json({
      content: response.choices[0].message.content || '',
    })
  } catch (error) {
    console.error('Teacher chat API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
