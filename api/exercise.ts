import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { verifyAuth } from './_lib/auth.js'
import { handleCors } from './_lib/cors.js'
import { checkRateLimit } from './_lib/rateLimit.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type FrenchLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
type PracticeType = 'written_translation' | 'repeat_aloud' | 'oral_translation' | 'grammar_dialog'
type Language = 'fr' | 'en' | 'es' | 'de' | 'pt'

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

const getSpanishExercisePrompt = (
  grammarTopic: string,
  level: FrenchLevel,
  practiceType: PracticeType
) => {
  const basePrompt = `
Eres un asistente para el aprendizaje del español.
Regla gramatical: ${grammarTopic}
Nivel: ${level}
`

  switch (practiceType) {
    case 'written_translation':
      return `${basePrompt}
Genera una frase en ruso que el estudiante debe traducir al español.
La frase DEBE usar la regla gramatical "${grammarTopic}".
Adapta la dificultad al nivel ${level}.

Responde en JSON:
{
  "russian": "frase en ruso",
  "french": "traducción correcta en español",
  "hint": "pista opcional"
}`

    case 'repeat_aloud':
      return `${basePrompt}
Genera una frase en español que el estudiante debe repetir en voz alta.
La frase DEBE usar la regla gramatical "${grammarTopic}".
Adapta la dificultad al nivel ${level}.

Responde en JSON:
{
  "french": "frase para repetir",
  "phonetic": "ayuda de pronunciación",
  "translation": "traducción en ruso"
}`

    case 'oral_translation':
      return `${basePrompt}
Genera una frase en ruso para traducción oral al español.
La frase DEBE usar la regla gramatical "${grammarTopic}".
Adapta la dificultad al nivel ${level}.

Responde en JSON:
{
  "russian": "frase en ruso",
  "french": "traducción correcta en español",
  "keyWords": ["palabras", "clave", "importantes"]
}`

    case 'grammar_dialog':
      return `${basePrompt}
Comienza un diálogo que fomente el uso de "${grammarTopic}".
Haz una pregunta que requiera una respuesta usando esta regla.
Nivel ${level}.

Responde únicamente en español.`
  }
}

const getGermanExercisePrompt = (
  grammarTopic: string,
  level: FrenchLevel,
  practiceType: PracticeType
) => {
  const basePrompt = `
Du bist ein Assistent zum Erlernen der deutschen Sprache.
Grammatikregel: ${grammarTopic}
Niveau: ${level}
`

  switch (practiceType) {
    case 'written_translation':
      return `${basePrompt}
Erstelle einen Satz auf Russisch, den der Schüler ins Deutsche übersetzen soll.
Der Satz MUSS die Grammatikregel "${grammarTopic}" verwenden.
Passe den Schwierigkeitsgrad an das Niveau ${level} an.

Antworte in JSON:
{
  "russian": "Satz auf Russisch",
  "french": "korrekte Übersetzung auf Deutsch",
  "hint": "optionaler Hinweis"
}`

    case 'repeat_aloud':
      return `${basePrompt}
Erstelle einen Satz auf Deutsch, den der Schüler laut wiederholen soll.
Der Satz MUSS die Grammatikregel "${grammarTopic}" verwenden.
Passe den Schwierigkeitsgrad an das Niveau ${level} an.

Antworte in JSON:
{
  "french": "Satz zum Wiederholen",
  "phonetic": "Aussprachehilfe",
  "translation": "Übersetzung auf Russisch"
}`

    case 'oral_translation':
      return `${basePrompt}
Erstelle einen Satz auf Russisch zur mündlichen Übersetzung ins Deutsche.
Der Satz MUSS die Grammatikregel "${grammarTopic}" verwenden.
Passe den Schwierigkeitsgrad an das Niveau ${level} an.

Antworte in JSON:
{
  "russian": "Satz auf Russisch",
  "french": "korrekte Übersetzung auf Deutsch",
  "keyWords": ["wichtige", "Schlüssel", "Wörter"]
}`

    case 'grammar_dialog':
      return `${basePrompt}
Beginne einen Dialog, der die Verwendung von "${grammarTopic}" fördert.
Stelle eine Frage, die eine Antwort mit dieser Regel erfordert.
Niveau ${level}.

Antworte ausschließlich auf Deutsch.`
  }
}

const getPortugueseExercisePrompt = (
  grammarTopic: string,
  level: FrenchLevel,
  practiceType: PracticeType
) => {
  const basePrompt = `
Você é um assistente para o aprendizado de português.
Regra gramatical: ${grammarTopic}
Nível: ${level}
`

  switch (practiceType) {
    case 'written_translation':
      return `${basePrompt}
Gere uma frase em russo que o aluno deve traduzir para o português.
A frase DEVE usar a regra gramatical "${grammarTopic}".
Adapte a dificuldade ao nível ${level}.

Responda em JSON:
{
  "russian": "frase em russo",
  "french": "tradução correta em português",
  "hint": "dica opcional"
}`

    case 'repeat_aloud':
      return `${basePrompt}
Gere uma frase em português que o aluno deve repetir em voz alta.
A frase DEVE usar a regra gramatical "${grammarTopic}".
Adapte a dificuldade ao nível ${level}.

Responda em JSON:
{
  "french": "frase para repetir",
  "phonetic": "ajuda de pronúncia",
  "translation": "tradução em russo"
}`

    case 'oral_translation':
      return `${basePrompt}
Gere uma frase em russo para tradução oral para o português.
A frase DEVE usar a regra gramatical "${grammarTopic}".
Adapte a dificuldade ao nível ${level}.

Responda em JSON:
{
  "russian": "frase em russo",
  "french": "tradução correta em português",
  "keyWords": ["palavras", "chave", "importantes"]
}`

    case 'grammar_dialog':
      return `${basePrompt}
Comece um diálogo que incentive o uso de "${grammarTopic}".
Faça uma pergunta que exija uma resposta usando esta regra.
Nível ${level}.

Responda apenas em português.`
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
    case 'es':
      return getSpanishExercisePrompt(grammarTopic, level, practiceType)
    case 'de':
      return getGermanExercisePrompt(grammarTopic, level, practiceType)
    case 'pt':
      return getPortugueseExercisePrompt(grammarTopic, level, practiceType)
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

const getSpanishCheckPrompt = (grammarTopic: string, level: FrenchLevel) => `Eres un evaluador de español amable.
Regla gramatical en foco: ${grammarTopic}
Nivel del estudiante: ${level}

Reglas de evaluación:
1. Evalúa el sentido y la gramática, no la ortografía
2. IMPORTANTE: La ausencia de tildes o signos diacríticos NO es un error
   - "espanol" = "español" — es CORRECTO
   - "informacion" = "información" — es CORRECTO
   - "como estas" = "¿cómo estás?" — es CORRECTO
3. NO des feedback sobre acentos faltantes
4. Considera la respuesta como correcta si el sentido y la gramática son buenos

Responde en JSON:
{
  "isCorrect": true/false,
  "feedback": "feedback alentador en español",
  "grammarNotes": "explicaciones sobre la regla si es necesario (en ruso)"
}`

const getGermanCheckPrompt = (grammarTopic: string, level: FrenchLevel) => `Du bist ein freundlicher Deutschbewerter.
Grammatikregel im Fokus: ${grammarTopic}
Schülerniveau: ${level}

Bewertungsregeln:
1. Bewerte Bedeutung und Grammatik, nicht die Rechtschreibung
2. WICHTIG: Fehlende Umlaute oder Sonderzeichen sind KEIN Fehler
   - "uber" = "über" — ist KORREKT
   - "schon" = "schön" — ist KORREKT
   - "strasse" = "Straße" — ist KORREKT
3. Gib KEIN Feedback zu fehlenden Umlauten
4. Betrachte die Antwort als korrekt, wenn Bedeutung und Grammatik stimmen

Antworte in JSON:
{
  "isCorrect": true/false,
  "feedback": "ermutigendes Feedback auf Deutsch",
  "grammarNotes": "Erklärungen zur Regel falls nötig (auf Russisch)"
}`

const getPortugueseCheckPrompt = (grammarTopic: string, level: FrenchLevel) => `Você é um avaliador de português gentil.
Regra gramatical em foco: ${grammarTopic}
Nível do aluno: ${level}

Regras de avaliação:
1. Avalie o sentido e a gramática, não a ortografia
2. IMPORTANTE: A ausência de acentos ou sinais diacríticos NÃO é um erro
   - "portugues" = "português" — está CORRETO
   - "voce" = "você" — está CORRETO
   - "informacao" = "informação" — está CORRETO
3. NÃO dê feedback sobre acentos faltantes
4. Considere a resposta como correta se o sentido e a gramática estiverem bons

Responda em JSON:
{
  "isCorrect": true/false,
  "feedback": "feedback encorajador em português",
  "grammarNotes": "explicações sobre a regra se necessário (em russo)"
}`

const getCheckPrompt = (grammarTopic: string, level: FrenchLevel, language: Language = 'fr') => {
  switch (language) {
    case 'en':
      return getEnglishCheckPrompt(grammarTopic, level)
    case 'es':
      return getSpanishCheckPrompt(grammarTopic, level)
    case 'de':
      return getGermanCheckPrompt(grammarTopic, level)
    case 'pt':
      return getPortugueseCheckPrompt(grammarTopic, level)
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

const getSpanishAnalyzePrompt = (grammarTopic: string) => `Analiza si el estudiante usó correctamente la regla "${grammarTopic}" en su mensaje.

IMPORTANTE: Ignora la ausencia de tildes o signos diacríticos.
"espanol" = "español", no es un error.

Evalúa ÚNICAMENTE la corrección de la construcción gramatical.

Responde en JSON:
{
  "usedCorrectly": true/false,
  "feedback": "breve comentario en español"
}`

const getGermanAnalyzePrompt = (grammarTopic: string) => `Analysiere, ob der Schüler die Regel "${grammarTopic}" in seiner Nachricht korrekt verwendet hat.

WICHTIG: Ignoriere fehlende Umlaute oder Sonderzeichen.
"uber" = "über", das ist kein Fehler.

Bewerte AUSSCHLIESSLICH die Korrektheit der grammatischen Konstruktion.

Antworte in JSON:
{
  "usedCorrectly": true/false,
  "feedback": "kurzer Kommentar auf Deutsch"
}`

const getPortugueseAnalyzePrompt = (grammarTopic: string) => `Analise se o aluno usou corretamente a regra "${grammarTopic}" em sua mensagem.

IMPORTANTE: Ignore a ausência de acentos ou sinais diacríticos.
"portugues" = "português", não é um erro.

Avalie APENAS a correção da construção gramatical.

Responda em JSON:
{
  "usedCorrectly": true/false,
  "feedback": "breve comentário em português"
}`

const getAnalyzePrompt = (grammarTopic: string, language: Language = 'fr') => {
  switch (language) {
    case 'en':
      return getEnglishAnalyzePrompt(grammarTopic)
    case 'es':
      return getSpanishAnalyzePrompt(grammarTopic)
    case 'de':
      return getGermanAnalyzePrompt(grammarTopic)
    case 'pt':
      return getPortugueseAnalyzePrompt(grammarTopic)
    case 'fr':
    default:
      return getFrenchAnalyzePrompt(grammarTopic)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await verifyAuth(req, res)
  if (!user) return

  const rl = checkRateLimit(user.id, 'exercise')
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter))
    return res.status(429).json({ error: 'Too many requests', retryAfter: rl.retryAfter })
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

      const checkUserPromptTemplates: Record<Language, string> = {
        fr: `Réponse correcte: "${correctAnswer}"\nRéponse de l'élève: "${userAnswer}"`,
        en: `Correct answer: "${correctAnswer}"\nStudent's answer: "${userAnswer}"`,
        es: `Respuesta correcta: "${correctAnswer}"\nRespuesta del estudiante: "${userAnswer}"`,
        de: `Korrekte Antwort: "${correctAnswer}"\nAntwort des Schülers: "${userAnswer}"`,
        pt: `Resposta correta: "${correctAnswer}"\nResposta do aluno: "${userAnswer}"`,
      }
      const checkUserPrompt = checkUserPromptTemplates[lang] || checkUserPromptTemplates.fr

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

      const feedbackTemplates: Record<Language, { correct: string; incorrect: string }> = {
        fr: { correct: 'Très bien!', incorrect: 'Pas tout à fait correct.' },
        en: { correct: 'Very good!', incorrect: 'Not quite correct.' },
        es: { correct: '¡Muy bien!', incorrect: 'No es del todo correcto.' },
        de: { correct: 'Sehr gut!', incorrect: 'Nicht ganz richtig.' },
        pt: { correct: 'Muito bem!', incorrect: 'Não está totalmente correto.' },
      }
      const fb = feedbackTemplates[lang] || feedbackTemplates.fr
      const feedback = isCorrect ? fb.correct : fb.incorrect

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
