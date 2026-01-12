import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { topic, level } = req.body as {
      topic: string
      level: FrenchLevel
    }

    if (!topic || !level) {
      return res.status(400).json({ error: 'Missing topic or level' })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Explique la règle grammaticale "${topic}" pour un niveau ${level}.
L'explication doit être en russe, claire et concise.
Donne 3 exemples avec traduction.

Réponds en JSON:
{
  "explanation": "explication en russe",
  "examples": [
    {"french": "exemple 1", "russian": "traduction 1"},
    {"french": "exemple 2", "russian": "traduction 2"},
    {"french": "exemple 3", "russian": "traduction 3"}
  ]
}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.5,
    })

    const content = response.choices[0].message.content || '{}'

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return res.json(JSON.parse(jsonMatch[0]))
      }
    } catch {
      // Fallback
    }

    return res.json({
      explanation: `Règle: ${topic}`,
      examples: [],
    })
  } catch (error) {
    console.error('Grammar API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
