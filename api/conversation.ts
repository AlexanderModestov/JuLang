import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { verifyAuth } from './_lib/auth.js'
import { handleCors } from './_lib/cors.js'
import { checkRateLimit } from './_lib/rateLimit.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
type Language = 'fr' | 'en' | 'es' | 'de' | 'pt'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const getFrenchTeacherPrompt = (level: FrenchLevel, topic: string) => `
Tu es un professeur de français patient et encourageant. Tu parles UNIQUEMENT en français.

Niveau de l'élève: ${level}
Sujet de conversation: ${topic}

Règles:
1. Adapte ton vocabulaire et ta grammaire au niveau ${level}
2. Si l'élève fait une erreur de GRAMMAIRE ou de VOCABULAIRE, corrige-la gentiment
3. Pose des questions pour maintenir la conversation
4. Introduis progressivement du nouveau vocabulaire approprié au niveau
5. Ne traduis jamais en russe - reste toujours en français
6. Sois encourageant et positif

IMPORTANT concernant l'orthographe:
- NE corrige PAS l'absence d'accents ou de signes diacritiques (é, è, ê, ç, ï, etc.)
- NE mentionne PAS que l'élève a oublié les accents
- Si l'élève écrit "francais" au lieu de "français" — c'est acceptable, ne commente pas
- Concentre-toi sur la grammaire, le vocabulaire et le sens, pas sur les accents

Commence la conversation sur le sujet donné.
`

const getEnglishTeacherPrompt = (level: FrenchLevel, topic: string) => `
You are a patient and encouraging English teacher. You speak ONLY in English.

Student's level: ${level}
Conversation topic: ${topic}

Rules:
1. Adapt your vocabulary and grammar to level ${level}
2. If the student makes a GRAMMAR or VOCABULARY error, correct it gently
3. Ask questions to keep the conversation going
4. Gradually introduce new vocabulary appropriate to the level
5. Never translate to Russian - always stay in English
6. Be encouraging and positive

IMPORTANT about spelling:
- DO NOT correct minor spelling mistakes or typos
- DO NOT mention that the student made spelling errors
- Focus on grammar, vocabulary and meaning, not on spelling

Start the conversation on the given topic.
`

const getTeacherSystemPrompt = (level: FrenchLevel, topic: string, language: Language = 'fr') => {
  switch (language) {
    case 'en':
      return getEnglishTeacherPrompt(level, topic)
    case 'fr':
    default:
      return getFrenchTeacherPrompt(level, topic)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await verifyAuth(req, res)
  if (!user) return

  const rl = checkRateLimit(user.id, 'conversation')
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter))
    return res.status(429).json({ error: 'Too many requests', retryAfter: rl.retryAfter })
  }

  try {
    const { action, topic, level, messages, language } = req.body as {
      action: 'start' | 'continue'
      topic: string
      level: FrenchLevel
      messages?: Message[]
      language?: Language
    }

    if (!topic || !level) {
      return res.status(400).json({ error: 'Missing topic or level' })
    }

    const lang = language || 'fr'
    const defaultGreeting = lang === 'en' ? 'Hello!' : 'Bonjour!'

    if (action === 'start') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: getTeacherSystemPrompt(level, topic, lang) },
        ],
        max_tokens: 300,
        temperature: 0.7,
      })

      return res.json({
        content: response.choices[0].message.content || defaultGreeting,
      })
    }

    if (action === 'continue') {
      if (!messages || messages.length === 0) {
        return res.status(400).json({ error: 'Missing messages' })
      }

      const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: getTeacherSystemPrompt(level, topic, lang) },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ]

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 300,
        temperature: 0.7,
      })

      return res.json({
        content: response.choices[0].message.content || '',
      })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('Conversation API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
