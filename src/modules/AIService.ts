import OpenAI from 'openai'
import type { FrenchLevel, Message, PracticeType } from '@/types'

let openaiClient: OpenAI | null = null

export function initializeOpenAI(apiKey: string) {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // For Tauri desktop app
  })
}

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key.')
  }
  return openaiClient
}

// System prompts
const getTeacherSystemPrompt = (level: FrenchLevel, topic: string) => `
Tu es un professeur de français patient et encourageant. Tu parles UNIQUEMENT en français.

Niveau de l'élève: ${level}
Sujet de conversation: ${topic}

Règles:
1. Adapte ton vocabulaire et ta grammaire au niveau ${level}
2. Si l'élève fait une erreur, corrige-la gentiment dans ta prochaine réponse
3. Pose des questions pour maintenir la conversation
4. Introduis progressivement du nouveau vocabulaire approprié au niveau
5. Ne traduis jamais en russe - reste toujours en français
6. Sois encourageant et positif

Commence la conversation sur le sujet donné.
`

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

// Conversation functions
export async function startConversation(
  topic: string,
  level: FrenchLevel
): Promise<string> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: getTeacherSystemPrompt(level, topic) },
    ],
    max_tokens: 300,
    temperature: 0.7,
  })

  return response.choices[0].message.content || 'Bonjour!'
}

export async function continueConversation(
  messages: Message[],
  level: FrenchLevel,
  topic: string
): Promise<string> {
  const client = getOpenAIClient()

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: getTeacherSystemPrompt(level, topic) },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: chatMessages,
    max_tokens: 300,
    temperature: 0.7,
  })

  return response.choices[0].message.content || ''
}

// Grammar practice functions
export async function generateExercise(
  grammarTopic: string,
  level: FrenchLevel,
  practiceType: PracticeType
): Promise<{
  sourceText?: string
  targetText: string
  hint?: string
  translation?: string
}> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
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
    // Try to parse as JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        sourceText: parsed.russian,
        targetText: parsed.french,
        hint: parsed.hint || parsed.phonetic,
        translation: parsed.translation,
      }
    }
  } catch {
    // Not JSON, return as dialog starter
  }

  return {
    targetText: content,
  }
}

export async function checkTranslation(
  userAnswer: string,
  correctAnswer: string,
  grammarTopic: string,
  level: FrenchLevel
): Promise<{
  isCorrect: boolean
  feedback: string
  grammarNotes?: string
}> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
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
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // Fallback
  }

  // Simple fallback comparison
  const normalized = (s: string) =>
    s.toLowerCase().trim().replace(/[.,!?]/g, '')
  const isCorrect = normalized(userAnswer) === normalized(correctAnswer)

  return {
    isCorrect,
    feedback: isCorrect ? 'Très bien!' : 'Pas tout à fait correct.',
  }
}

export async function analyzeGrammarUsage(
  userMessage: string,
  grammarTopic: string
): Promise<{
  usedCorrectly: boolean
  feedback: string
}> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
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
        content: userMessage,
      },
    ],
    max_tokens: 150,
    temperature: 0.3,
  })

  const content = response.choices[0].message.content || '{}'

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // Fallback
  }

  return {
    usedCorrectly: false,
    feedback: 'Unable to analyze.',
  }
}

// Grammar explanation generation
export async function generateGrammarExplanation(
  topic: string,
  level: FrenchLevel
): Promise<{
  explanation: string
  examples: { french: string; russian: string }[]
}> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
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
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // Fallback
  }

  return {
    explanation: `Règle: ${topic}`,
    examples: [],
  }
}
