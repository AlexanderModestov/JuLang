import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
type PracticeType = 'written_translation' | 'repeat_aloud' | 'oral_translation' | 'grammar_dialog'
type Language = 'fr' | 'en' | 'es' | 'de' | 'pt'

const languageNames: Record<Language, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  de: 'German',
  pt: 'Portuguese',
}

const getFrenchExercisePrompt = (
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

const getEnglishExercisePrompt = (
  grammarTopic: string,
  level: FrenchLevel,
  practiceType: PracticeType
) => {
  const basePrompt = `
You are an assistant for learning English.
Grammar rule: ${grammarTopic}
Level: ${level}
`

  switch (practiceType) {
    case 'written_translation':
      return `${basePrompt}
Generate a sentence in Russian that the student must translate into English.
The sentence MUST use the grammar rule "${grammarTopic}".
Adapt the difficulty to level ${level}.

Respond in JSON:
{
  "russian": "sentence in Russian",
  "french": "correct translation in English",
  "hint": "optional hint"
}`

    case 'repeat_aloud':
      return `${basePrompt}
Generate a sentence in English that the student must repeat aloud.
The sentence MUST use the grammar rule "${grammarTopic}".
Adapt the difficulty to level ${level}.

Respond in JSON:
{
  "french": "sentence to repeat",
  "phonetic": "pronunciation help",
  "translation": "translation in Russian"
}`

    case 'oral_translation':
      return `${basePrompt}
Generate a sentence in Russian for oral translation into English.
The sentence MUST use the grammar rule "${grammarTopic}".
Adapt the difficulty to level ${level}.

Respond in JSON:
{
  "russian": "sentence in Russian",
  "french": "correct translation in English",
  "keyWords": ["key", "words", "important"]
}`

    case 'grammar_dialog':
      return `${basePrompt}
Start a dialogue that encourages the use of "${grammarTopic}".
Ask a question that requires an answer using this rule.
Level ${level}.

Respond in English only.`
  }
}

const getGrammarExercisePrompt = (
  grammarTopic: string,
  level: FrenchLevel,
  practiceType: PracticeType,
  language: Language = 'fr'
) => {
  switch (language) {
    case 'en':
      return getEnglishExercisePrompt(grammarTopic, level, practiceType)
    case 'fr':
    default:
      return getFrenchExercisePrompt(grammarTopic, level, practiceType)
  }
}

const getFrenchCheckPrompt = (grammarTopic: string, level: FrenchLevel) => `Tu es un correcteur de français bienveillant.
Règle grammaticale en focus: ${grammarTopic}
Niveau de l'élève: ${level}

Règles d'évaluation:
1. Évalue le sens et la grammaire, pas l'orthographe
2. IMPORTANT: L'absence de signes diacritiques N'EST PAS une erreur
   - "francais" = "français" — c'est CORRECT
   - "eleve" = "élève" — c'est CORRECT
   - "ca va" = "ça va" — c'est CORRECT
3. NE donne PAS de feedback sur les accents manquants
4. Considère la réponse comme correcte si le sens et la grammaire sont bons

Réponds en JSON:
{
  "isCorrect": true/false,
  "feedback": "feedback encourageant en français",
  "grammarNotes": "explications sur la règle si nécessaire (en russe)"
}`

const getEnglishCheckPrompt = (grammarTopic: string, level: FrenchLevel) => `You are a kind English language evaluator.
Grammar rule in focus: ${grammarTopic}
Student level: ${level}

Evaluation rules:
1. Evaluate meaning and grammar, not spelling
2. IMPORTANT: Minor spelling mistakes are NOT errors
   - Focus on whether the grammar rule is applied correctly
   - Accept reasonable variations
3. DO NOT give feedback on minor typos
4. Consider the answer correct if the meaning and grammar are good

Respond in JSON:
{
  "isCorrect": true/false,
  "feedback": "encouraging feedback in English",
  "grammarNotes": "explanations about the rule if necessary (in Russian)"
}`

const getCheckPrompt = (grammarTopic: string, level: FrenchLevel, language: Language = 'fr') => {
  switch (language) {
    case 'en':
      return getEnglishCheckPrompt(grammarTopic, level)
    case 'fr':
    default:
      return getFrenchCheckPrompt(grammarTopic, level)
  }
}

const getFrenchAnalyzePrompt = (grammarTopic: string) => `Analyse si l'élève a utilisé correctement la règle "${grammarTopic}" dans son message.

IMPORTANT: Ignore l'absence de signes diacritiques.
"francais" = "français", ce n'est pas une erreur.

Évalue UNIQUEMENT la correction de la construction grammaticale.

Réponds en JSON:
{
  "usedCorrectly": true/false,
  "feedback": "bref commentaire en français"
}`

const getEnglishAnalyzePrompt = (grammarTopic: string) => `Analyze if the student correctly used the rule "${grammarTopic}" in their message.

IMPORTANT: Ignore minor spelling mistakes.
Focus ONLY on whether the grammatical construction is correct.

Respond in JSON:
{
  "usedCorrectly": true/false,
  "feedback": "brief comment in English"
}`

const getAnalyzePrompt = (grammarTopic: string, language: Language = 'fr') => {
  switch (language) {
    case 'en':
      return getEnglishAnalyzePrompt(grammarTopic)
    case 'fr':
    default:
      return getFrenchAnalyzePrompt(grammarTopic)
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
    const { action, grammarTopic, level, practiceType, userAnswer, correctAnswer, language } = req.body as {
      action: 'generate' | 'check' | 'analyze'
      grammarTopic: string
      level: FrenchLevel
      practiceType?: PracticeType
      userAnswer?: string
      correctAnswer?: string
      language?: Language
    }

    const lang = language || 'fr'

    if (action === 'generate') {
      if (!grammarTopic || !level || !practiceType) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getGrammarExercisePrompt(grammarTopic, level, practiceType, lang),
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

      const checkUserPrompt = lang === 'en'
        ? `Correct answer: "${correctAnswer}"\nStudent's answer: "${userAnswer}"`
        : `Réponse correcte: "${correctAnswer}"\nRéponse de l'élève: "${userAnswer}"`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getCheckPrompt(grammarTopic, level, lang),
          },
          {
            role: 'user',
            content: checkUserPrompt,
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

      const feedback = lang === 'en'
        ? (isCorrect ? 'Very good!' : 'Not quite correct.')
        : (isCorrect ? 'Très bien!' : 'Pas tout à fait correct.')

      return res.json({
        isCorrect,
        feedback,
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
            content: getAnalyzePrompt(grammarTopic, lang),
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
