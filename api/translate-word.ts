import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { verifyAuth } from './_lib/auth'
import { handleCors } from './_lib/cors'
import { checkRateLimit } from './_lib/rateLimit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await verifyAuth(req, res)
  if (!user) return

  const rl = checkRateLimit(user.id, 'translate-word')
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter))
    return res.status(429).json({ error: 'Too many requests', retryAfter: rl.retryAfter })
  }

  const { word, sentence, languageName } = req.body
  const lang = languageName || 'French'

  if (!word || !sentence) {
    return res.status(400).json({ error: 'word and sentence are required' })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a ${lang}-Russian dictionary assistant. Always respond with valid JSON only.`,
        },
        {
          role: 'user',
          content: `Word: "${word}", context: "${sentence}". Return JSON: { "lemma": "...", "russian": "...", "gender": "masculine" | "feminine" | null, "type": "word" | "expression" }. Give the dictionary form (lemma) in ${lang}, Russian translation fitting the context, and gender if noun.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const raw = response.choices[0]?.message?.content || '{}'
    // Strip markdown code fences if present (e.g. ```json ... ```)
    const content = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const parsed = JSON.parse(content)

    return res.status(200).json(parsed)
  } catch (error) {
    console.error('Translation error:', error)
    return res.status(500).json({ error: 'Failed to translate word' })
  }
}
