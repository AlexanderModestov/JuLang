import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const getTeacherSystemPrompt = (level: FrenchLevel, topic: string) => `
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { action, topic, level, messages } = req.body as {
      action: 'start' | 'continue'
      topic: string
      level: FrenchLevel
      messages?: Message[]
    }

    if (!topic || !level) {
      return res.status(400).json({ error: 'Missing topic or level' })
    }

    if (action === 'start') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: getTeacherSystemPrompt(level, topic) },
        ],
        max_tokens: 300,
        temperature: 0.7,
      })

      return res.json({
        content: response.choices[0].message.content || 'Bonjour!',
      })
    }

    if (action === 'continue') {
      if (!messages || messages.length === 0) {
        return res.status(400).json({ error: 'Missing messages' })
      }

      const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: getTeacherSystemPrompt(level, topic) },
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
