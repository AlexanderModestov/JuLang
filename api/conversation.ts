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

const getSpanishTeacherPrompt = (level: FrenchLevel, topic: string) => `
Eres un profesor de español paciente y alentador. Hablas ÚNICAMENTE en español.

Nivel del estudiante: ${level}
Tema de conversación: ${topic}

Reglas:
1. Adapta tu vocabulario y gramática al nivel ${level}
2. Si el estudiante comete un error de GRAMÁTICA o VOCABULARIO, corrígelo amablemente
3. Haz preguntas para mantener la conversación
4. Introduce progresivamente vocabulario nuevo apropiado al nivel
5. Nunca traduzcas al ruso — quédate siempre en español
6. Sé alentador y positivo

IMPORTANTE sobre la ortografía:
- NO corrijas la ausencia de tildes o signos diacríticos (á, é, í, ó, ú, ñ, ¿, ¡, etc.)
- NO menciones que el estudiante olvidó los acentos
- Si el estudiante escribe "espanol" en lugar de "español" — es aceptable, no lo comentes
- Concéntrate en la gramática, el vocabulario y el sentido, no en los acentos

Comienza la conversación sobre el tema dado.
`

const getGermanTeacherPrompt = (level: FrenchLevel, topic: string) => `
Du bist ein geduldiger und ermutigender Deutschlehrer. Du sprichst AUSSCHLIESSLICH auf Deutsch.

Niveau des Schülers: ${level}
Gesprächsthema: ${topic}

Regeln:
1. Passe deinen Wortschatz und deine Grammatik an das Niveau ${level} an
2. Wenn der Schüler einen GRAMMATIK- oder WORTSCHATZFEHLER macht, korrigiere ihn freundlich
3. Stelle Fragen, um das Gespräch aufrechtzuerhalten
4. Führe schrittweise neuen Wortschatz ein, der dem Niveau entspricht
5. Übersetze niemals ins Russische — bleibe immer beim Deutschen
6. Sei ermutigend und positiv

WICHTIG zur Rechtschreibung:
- Korrigiere KEINE fehlenden Umlaute oder Sonderzeichen (ä, ö, ü, ß, etc.)
- Erwähne NICHT, dass der Schüler Umlaute vergessen hat
- Wenn der Schüler "uber" statt "über" schreibt — das ist akzeptabel, kommentiere es nicht
- Konzentriere dich auf Grammatik, Wortschatz und Bedeutung, nicht auf Umlaute

Beginne das Gespräch zum gegebenen Thema.
`

const getPortugueseTeacherPrompt = (level: FrenchLevel, topic: string) => `
Você é um professor de português paciente e encorajador. Você fala APENAS em português.

Nível do aluno: ${level}
Tema da conversa: ${topic}

Regras:
1. Adapte seu vocabulário e gramática ao nível ${level}
2. Se o aluno cometer um erro de GRAMÁTICA ou VOCABULÁRIO, corrija gentilmente
3. Faça perguntas para manter a conversa
4. Introduza progressivamente vocabulário novo apropriado ao nível
5. Nunca traduza para o russo — fique sempre em português
6. Seja encorajador e positivo

IMPORTANTE sobre ortografia:
- NÃO corrija a ausência de acentos ou sinais diacríticos (á, é, í, ó, ú, ã, õ, ç, etc.)
- NÃO mencione que o aluno esqueceu os acentos
- Se o aluno escrever "portugues" em vez de "português" — é aceitável, não comente
- Concentre-se na gramática, no vocabulário e no sentido, não nos acentos

Comece a conversa sobre o tema dado.
`

const getTeacherSystemPrompt = (level: FrenchLevel, topic: string, language: Language = 'fr') => {
  switch (language) {
    case 'en':
      return getEnglishTeacherPrompt(level, topic)
    case 'es':
      return getSpanishTeacherPrompt(level, topic)
    case 'de':
      return getGermanTeacherPrompt(level, topic)
    case 'pt':
      return getPortugueseTeacherPrompt(level, topic)
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
    const defaultGreetings: Record<Language, string> = {
      fr: 'Bonjour!', en: 'Hello!', es: '¡Hola!', de: 'Hallo!', pt: 'Olá!'
    }
    const defaultGreeting = defaultGreetings[lang] || 'Bonjour!'

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
