# Отключение автокоррекции и опциональная диакритика

## Проблема

1. Браузер автоматически исправляет слова и подчёркивает красным "ошибки" — это мешает при изучении французского, где пользователь должен сам видеть свои ошибки
2. Отсутствие диакритических знаков (é, è, ê, ç, ï и т.д.) считается ошибкой, хотя на практике это не критично для понимания и многие начинающие не знают, как их вводить

## Решение

1. Отключить автокоррекцию, автодополнение и проверку орфографии браузера во всех полях ввода французского текста
2. Приравнять написание без диакритики к корректному везде: в практике, в диалогах, во всех проверках

## Часть 1: Отключение автокоррекции браузера

### HTML-атрибуты

Все текстовые поля для ввода французского текста должны иметь:

```tsx
<input
  type="text"
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="off"
  spellCheck={false}
  data-gramm="false"        // отключить Grammarly
  data-gramm_editor="false"
  // ...остальные пропсы
/>
```

### Компонент Input (опционально)

Добавить пропс для удобства:

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  disableAutoCorrect?: boolean
}

export default function Input({ disableAutoCorrect, ...props }: InputProps) {
  const autoCorrectProps = disableAutoCorrect ? {
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'off',
    spellCheck: false,
    'data-gramm': 'false',
    'data-gramm_editor': 'false',
  } : {}

  return (
    <input
      {...autoCorrectProps}
      {...props}
      className={`...existing classes... ${props.className}`}
    />
  )
}
```

Использование:

```tsx
<Input
  disableAutoCorrect
  value={userAnswer}
  onChange={(e) => setUserAnswer(e.target.value)}
  placeholder="Введите перевод..."
/>
```

## Часть 2: Нормализация диакритики

### Утилиты для сравнения текста

**src/utils/text.ts**

```typescript
/**
 * Убирает диакритические знаки из текста для сравнения.
 * "français" → "francais"
 * "élève" → "eleve"
 * "ça" → "ca"
 */
export function removeDiacritics(text: string): string {
  return text
    .normalize('NFD')                    // разбить: é → e + combining accent
    .replace(/[\u0300-\u036f]/g, '')     // убрать combining diacritical marks
}

/**
 * Нормализует текст для сравнения: убирает диакритику,
 * приводит к нижнему регистру, убирает лишние пробелы.
 */
export function normalizeForComparison(text: string): string {
  return removeDiacritics(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Проверяет эквивалентность двух строк без учёта диакритики.
 */
export function isEquivalent(userAnswer: string, correctAnswer: string): boolean {
  return normalizeForComparison(userAnswer) === normalizeForComparison(correctAnswer)
}

/**
 * Проверяет, отличается ли ответ только диакритикой.
 * Возвращает true если смысл тот же, но диакритика отличается.
 */
export function differsByDiacriticsOnly(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = normalizeForComparison(userAnswer)
  const normalizedCorrect = normalizeForComparison(correctAnswer)

  return normalizedUser === normalizedCorrect && userAnswer !== correctAnswer
}
```

### Примеры нормализации

| Ввод пользователя | Правильный ответ | Результат |
|-------------------|------------------|-----------|
| `francais` | `français` | Correct |
| `eleve` | `élève` | Correct |
| `ca va` | `ça va` | Correct |
| `naive` | `naïve` | Correct |
| `J'ai mange` | `J'ai mangé` | Correct |
| `francais` | `allemand` | Incorrect |

### Использование в PracticeEngine

```typescript
import { isEquivalent } from '@/utils/text'

export async function checkWrittenAnswer(
  exercise: PracticeExercise,
  userAnswer: string,
  level: FrenchLevel
): Promise<PracticeResult> {
  if (!exercise.targetText) {
    return {
      isCorrect: false,
      userAnswer,
      feedback: 'Error: No target text available',
    }
  }

  // Быстрая проверка без AI если ответ эквивалентен
  if (isEquivalent(userAnswer, exercise.targetText)) {
    return {
      isCorrect: true,
      userAnswer,
      feedback: 'Très bien!',
      correctAnswer: exercise.targetText,
    }
  }

  // Если не совпадает — проверяем через AI для детального фидбека
  const result = await checkTranslation(
    userAnswer,
    exercise.targetText,
    exercise.grammarTopic,
    level
  )

  return {
    isCorrect: result.isCorrect,
    userAnswer,
    feedback: result.feedback,
    grammarNotes: result.grammarNotes,
    correctAnswer: exercise.targetText,
  }
}
```

## Часть 3: Инструкции для AI

### Промпт проверки перевода

**api/exercise.ts** — функция checkTranslation:

```typescript
const systemPrompt = `Ты проверяешь перевод с русского на французский.

Правила оценки:
1. Оценивай смысл и грамматику, не орфографию
2. ВАЖНО: Отсутствие диакритических знаков НЕ является ошибкой
   - "francais" = "français" — это ПРАВИЛЬНО
   - "eleve" = "élève" — это ПРАВИЛЬНО
   - "ca va" = "ça va" — это ПРАВИЛЬНО
3. НЕ давай фидбек об отсутствии акцентов
4. Считай ответ правильным если смысл и грамматика верны

Формат ответа JSON:
{
  "isCorrect": boolean,
  "feedback": "краткий фидбек на русском",
  "grammarNotes": "заметки по грамматике, если есть реальные ошибки"
}`
```

### Промпт для диалога с AI-учителем

**api/conversation.ts**:

```typescript
const systemPrompt = `Ты дружелюбный учитель французского языка...

...существующие инструкции...

ВАЖНО об орфографии:
- НЕ исправляй отсутствие диакритических знаков (é, è, ê, ç, ï, etc.)
- НЕ упоминай, что пользователь пропустил акценты
- Если написано "francais" вместо "français" — это нормально, не комментируй
- Фокусируйся на грамматике, лексике и смысле, не на акцентах`
```

### Промпт анализа грамматики

**src/modules/AIService.ts** — функция analyzeGrammarUsage:

```typescript
const prompt = `Проанализируй использование грамматической конструкции "${topic}" в тексте:
"${transcript}"

ВАЖНО: Игнорируй отсутствие диакритических знаков.
"francais" = "français", это не ошибка.

Оцени только правильность грамматической конструкции.`
```

## Изменения в файлах

| Файл | Изменение |
|------|-----------|
| `src/utils/text.ts` | **Новый** — функции нормализации текста |
| `src/components/ui/Input.tsx` | Добавить пропс `disableAutoCorrect` |
| `src/components/GrammarPractice/PracticeScreen.tsx` | Использовать `disableAutoCorrect` на input |
| `src/components/Conversation/ConversationScreen.tsx` | Использовать `disableAutoCorrect` на input |
| `src/modules/PracticeEngine.ts` | Использовать `isEquivalent()` для быстрой проверки |
| `src/modules/AIService.ts` | Обновить промпт `analyzeGrammarUsage` |
| `api/conversation.ts` | Обновить системный промпт |
| `api/exercise.ts` | Обновить промпт проверки перевода |

## Тестирование

Проверить сценарии:

1. Ввод `francais` при ожидаемом `français` → правильно
2. Ввод `J'ai mange une pomme` при ожидаемом `J'ai mangé une pomme` → правильно
3. Ввод `Je suis alle` при ожидаемом `Je suis allé` → правильно
4. Ввод `Je mange` при ожидаемом `J'ai mangé` → неправильно (другое время)
5. В диалоге AI не комментирует отсутствие акцентов
6. Нет красного подчёркивания в полях ввода
