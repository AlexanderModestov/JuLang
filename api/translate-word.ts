import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { word, sentence } = req.body

  if (!word || !sentence) {
    return res.status(400).json({ error: 'word and sentence are required' })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a French-Russian dictionary assistant. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: `Word: "${word}", context: "${sentence}". Return JSON: { "lemma": "...", "russian": "...", "gender": "masculine" | "feminine" | null, "type": "word" | "expression" }. Give the dictionary form (lemma), Russian translation fitting the context, and gender if noun.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const content = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(content)

    return res.status(200).json(parsed)
  } catch (error) {
    console.error('Translation error:', error)
    return res.status(500).json({ error: 'Failed to translate word' })
  }
}
