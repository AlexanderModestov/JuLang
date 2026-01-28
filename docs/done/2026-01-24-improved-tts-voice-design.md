# Улучшение озвучки реплик (TTS)

## Проблема

Текущая озвучка через Web Speech API звучит роботизированно:
- Используется первый попавшийся французский голос
- Нет пауз между предложениями
- Скорость и тон не настраиваются
- Пользователь не может выбрать голос

## Решение

Улучшить качество без дополнительных затрат:
1. Умный автовыбор лучшего системного голоса
2. Настройки голоса в профиле пользователя
3. Паузы между предложениями для естественности

## Часть 1: Умный выбор голоса

### Функция автовыбора

```typescript
interface VoiceQualityScore {
  voice: SpeechSynthesisVoice
  score: number
}

function selectBestFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const frenchVoices = voices.filter(v =>
    v.lang.startsWith('fr-FR') || v.lang.startsWith('fr')
  )

  if (frenchVoices.length === 0) return null

  // Оцениваем каждый голос
  const scored: VoiceQualityScore[] = frenchVoices.map(voice => {
    let score = 0
    const name = voice.name.toLowerCase()

    // Premium/Neural голоса — высший приоритет
    if (name.includes('premium') || name.includes('neural') || name.includes('natural')) {
      score += 100
    }

    // Enhanced голоса
    if (name.includes('enhanced')) {
      score += 80
    }

    // Известные качественные голоса
    const knownGoodVoices = ['amélie', 'thomas', 'hortense', 'paul', 'google français']
    if (knownGoodVoices.some(good => name.includes(good))) {
      score += 50
    }

    // Локальные голоса обычно качественнее сетевых
    if (voice.localService) {
      score += 20
    }

    // fr-FR предпочтительнее fr-CA и других
    if (voice.lang === 'fr-FR') {
      score += 10
    }

    return { voice, score }
  })

  // Сортируем по score и возвращаем лучший
  scored.sort((a, b) => b.score - a.score)
  return scored[0].voice
}
```

### Известные качественные голоса по платформам

| Платформа | Голоса |
|-----------|--------|
| macOS | Amélie, Thomas (Premium), Audrey (Enhanced) |
| Windows | Hortense, Paul (Microsoft Neural) |
| Chrome | Google français |
| iOS | Thomas, Amélie |
| Android | Зависит от установленных TTS движков |

### Получение списка голосов

```typescript
function getAvailableFrenchVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices()

    if (voices.length > 0) {
      resolve(voices.filter(v => v.lang.startsWith('fr')))
      return
    }

    // Голоса могут загружаться асинхронно
    speechSynthesis.onvoiceschanged = () => {
      const loadedVoices = speechSynthesis.getVoices()
      resolve(loadedVoices.filter(v => v.lang.startsWith('fr')))
    }
  })
}
```

## Часть 2: Настройки пользователя

### Новые поля в User

```typescript
interface SpeechSettings {
  voiceName: string | null  // null = автовыбор лучшего
  rate: number              // 0.5 - 1.5, шаг 0.1
  pitch: number             // 0.5 - 1.5, шаг 0.1
}

interface User {
  id: string
  name: string
  nativeLanguage: string
  frenchLevel: FrenchLevel
  preferredAiProvider: 'openai' | 'anthropic'
  speechPauseTimeout: number
  speechSettings: SpeechSettings  // NEW
  createdAt: Date
}
```

### Значения по умолчанию

```typescript
const defaultSpeechSettings: SpeechSettings = {
  voiceName: null,  // автовыбор
  rate: 0.9,        // чуть медленнее нормы
  pitch: 1.0,       // нормальный тон
}
```

### UI в настройках

```
┌─────────────────────────────────────┐
│  🔊 Озвучка                         │
│                                     │
│  Голос                              │
│  [▼ Автовыбор (Amélie Premium) ───] │
│     ├─ Автовыбор                    │
│     ├─ Amélie (Premium)             │
│     ├─ Thomas                       │
│     └─ Google français              │
│                                     │
│  Скорость речи                      │
│  ○──────●────────────○      0.9x    │
│  0.5x                        1.5x   │
│                                     │
│  Высота голоса                      │
│  ○────────●──────────○      1.0x    │
│  0.5x                        1.5x   │
│                                     │
│  [▶ Прослушать пример]              │
└─────────────────────────────────────┘
```

### Компонент настроек

```tsx
function VoiceSettings() {
  const { user, updateUser } = useAppStore()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [bestVoice, setBestVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    getAvailableFrenchVoices().then((frenchVoices) => {
      setVoices(frenchVoices)
      setBestVoice(selectBestFrenchVoice(frenchVoices))
    })
  }, [])

  const handleVoiceChange = (voiceName: string | null) => {
    updateUser({
      speechSettings: { ...user.speechSettings, voiceName }
    })
  }

  const handleRateChange = (rate: number) => {
    updateUser({
      speechSettings: { ...user.speechSettings, rate }
    })
  }

  const handlePitchChange = (pitch: number) => {
    updateUser({
      speechSettings: { ...user.speechSettings, pitch }
    })
  }

  const playExample = () => {
    speakWithPauses(
      "Bonjour, comment allez-vous aujourd'hui?",
      user.speechSettings
    )
  }

  const currentVoiceName = user.speechSettings.voiceName
    ? user.speechSettings.voiceName
    : bestVoice?.name ? `Автовыбор (${bestVoice.name})` : 'Автовыбор'

  return (
    <div className="space-y-4">
      <h3>Озвучка</h3>

      <label>
        Голос
        <select
          value={user.speechSettings.voiceName || ''}
          onChange={(e) => handleVoiceChange(e.target.value || null)}
        >
          <option value="">Автовыбор{bestVoice ? ` (${bestVoice.name})` : ''}</option>
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Скорость речи: {user.speechSettings.rate}x
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={user.speechSettings.rate}
          onChange={(e) => handleRateChange(parseFloat(e.target.value))}
        />
      </label>

      <label>
        Высота голоса: {user.speechSettings.pitch}x
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={user.speechSettings.pitch}
          onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
        />
      </label>

      <Button onClick={playExample}>
        Прослушать пример
      </Button>
    </div>
  )
}
```

## Часть 3: Улучшенная функция озвучки

### speakWithPauses

Разбивает текст на предложения и добавляет паузы между ними:

```typescript
const SENTENCE_PAUSE_MS = 300

async function speakWithPauses(
  text: string,
  settings: SpeechSettings
): Promise<void> {
  // Отменяем текущую озвучку
  speechSynthesis.cancel()

  // Разбиваем на предложения
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    if (!sentence) continue

    await speakSentence(sentence, settings)

    // Пауза между предложениями (кроме последнего)
    if (i < sentences.length - 1) {
      await pause(SENTENCE_PAUSE_MS)
    }
  }
}

function speakSentence(text: string, settings: SpeechSettings): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text)

    // Выбор голоса
    const voice = settings.voiceName
      ? getVoiceByName(settings.voiceName)
      : selectBestFrenchVoice(speechSynthesis.getVoices())

    if (voice) {
      utterance.voice = voice
    }

    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.lang = 'fr-FR'

    utterance.onend = () => resolve()
    utterance.onerror = (event) => {
      console.error('Speech error:', event.error)
      resolve() // Не блокируем на ошибке
    }

    speechSynthesis.speak(utterance)
  })
}

function getVoiceByName(name: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  return voices.find(v => v.name === name) || null
}

function pause(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

### Обратная совместимость

Обновляем существующую функцию `speak()`:

```typescript
export function speak(
  text: string,
  options: {
    voice?: SpeechSynthesisVoice
    rate?: number
    pitch?: number
    onEnd?: () => void
    onError?: (error: string) => void
  } = {}
): void {
  // Получаем настройки пользователя
  const userSettings = useAppStore.getState().user?.speechSettings || defaultSpeechSettings

  const settings: SpeechSettings = {
    voiceName: options.voice?.name || userSettings.voiceName,
    rate: options.rate ?? userSettings.rate,
    pitch: options.pitch ?? userSettings.pitch,
  }

  speakWithPauses(text, settings)
    .then(() => options.onEnd?.())
    .catch((err) => options.onError?.(err.message))
}
```

## Изменения в файлах

| Файл | Изменение |
|------|-----------|
| `src/types/index.ts` | Добавить `SpeechSettings` интерфейс и поле в `User` |
| `src/modules/SpeechService.ts` | `selectBestFrenchVoice()`, `speakWithPauses()`, `getAvailableFrenchVoices()` |
| `src/store/useAppStore.ts` | Дефолтные `speechSettings` при создании пользователя |
| `src/components/Settings/SettingsScreen.tsx` | Секция настроек озвучки |
| `src/components/Conversation/ConversationScreen.tsx` | Использует обновлённую `speak()` |
| `src/components/GrammarPractice/PracticeScreen.tsx` | Использует обновлённую `speak()` |

## Миграция

Для существующих пользователей без `speechSettings`:

```typescript
// В useAppStore при загрузке
if (user && !user.speechSettings) {
  updateUser({
    speechSettings: defaultSpeechSettings
  })
}
```

## Тестирование

1. На macOS — проверить, что выбирается Amélie/Thomas Premium
2. На Windows — проверить Microsoft Neural голоса
3. В Chrome — проверить Google français
4. Проверить паузы между предложениями
5. Проверить, что слайдеры rate/pitch работают
6. Проверить выбор голоса вручную
7. Проверить кнопку "Прослушать пример"
