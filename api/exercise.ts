import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
type PracticeType = 'written_translation' | 'repeat_aloud' | 'oral_translation' | 'grammar_dialog'

const getGrammarExercisePrompt = (
  grammarTopic: string,
  level: FrenchLevel,
  practiceType: PracticeType
) => {
  const basePrompt = `
Tu es un assistant pour l'apprentissage du français.
Règle grammaticale: ${grammarTopic}
Niveau: ${level}
`

  switch (practiceType) {
    case 'written_translation':
      return `${basePrompt}
Génère une phrase en russe que l'élève doit traduire en français.
La phrase DOIT utiliser la règle grammaticale "${grammarTopic}".
Adapte la difficulté au niveau ${level}.

Réponds en JSON:
{
  "russian": "phrase en russe",
  "french": "traduction correcte en français",
  "hint": "indice optionnel"
}`

    case 'repeat_aloud':
      return `${basePrompt}
Génère une phrase en français que l'élève doit répéter à haute voix.
La phrase DOIT utiliser la règle grammaticale "${grammarTopic}".
Adapte la difficulté au niveau ${level}.

Réponds en JSON:
{
  "french": "phrase à répéter",
  "phonetic": "aide à la prononciation",
  "translation": "traduction en russe"
}`

    case 'oral_translation':
      return `${basePrompt}
Génère une phrase en russe pour traduction orale en français.
La phrase DOIT utiliser la règle grammaticale "${grammarTopic}".
Adapte la difficulté au niveau ${level}.

Réponds en JSON:
{
  "russian": "phrase en russe",
  "french": "traduction correcte en français",
  "keyWords": ["mots", "clés", "importants"]
}`

    case 'grammar_dialog':
      return `${basePrompt}
Commence un dialogue qui encourage l'utilisation de "${grammarTopic}".
Pose une question qui nécessite une réponse utilisant cette règle.
Niveau ${level}.

Réponds en français uniquement.`
  }
}

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
    const { action, grammarTopic, level, practiceType, userAnswer, correctAnswer } = req.body as {
      action: 'generate' | 'check' | 'analyze'
      grammarTopic: string
      level: FrenchLevel
      practiceType?: PracticeType
      userAnswer?: string
      correctAnswer?: string
    }

    if (action === 'generate') {
      if (!grammarTopic || !level || !practiceType) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getGrammarExercisePrompt(grammarTopic, level, practiceType),
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      })

      const content = response.choices[0].message.content || '{}'

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return res.json({
            sourceText: parsed.russian,
            targetText: parsed.french,
            hint: parsed.hint || parsed.phonetic,
            translation: parsed.translation,
          })
        }
      } catch {
        // Not JSON, return as dialog starter
      }

      return res.json({
        targetText: content,
      })
    }

    if (action === 'check') {
      if (!userAnswer || !correctAnswer || !grammarTopic || !level) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un correcteur de français bienveillant.
Règle grammaticale en focus: ${grammarTopic}
Niveau de l'élève: ${level}

Évalue la traduction de l'élève. Sois tolérant aux petites erreurs d'orthographe mais strict sur la grammaire.

Réponds en JSON:
{
  "isCorrect": true/false,
  "feedback": "feedback encourageant en français",
  "grammarNotes": "explications sur la règle si nécessaire (en russe)"
}`,
          },
          {
            role: 'user',
            content: `Réponse correcte: "${correctAnswer}"
Réponse de l'élève: "${userAnswer}"`,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
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

      const normalized = (s: string) =>
        s.toLowerCase().trim().replace(/[.,!?]/g, '')
      const isCorrect = normalized(userAnswer) === normalized(correctAnswer)

      return res.json({
        isCorrect,
        feedback: isCorrect ? 'Très bien!' : 'Pas tout à fait correct.',
      })
    }

    if (action === 'analyze') {
      if (!userAnswer || !grammarTopic) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyse si l'élève a utilisé correctement la règle "${grammarTopic}" dans son message.

Réponds en JSON:
{
  "usedCorrectly": true/false,
  "feedback": "bref commentaire en français"
}`,
          },
          {
            role: 'user',
            content: userAnswer,
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
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
        usedCorrectly: false,
        feedback: 'Unable to analyze.',
      })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('Exercise API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
