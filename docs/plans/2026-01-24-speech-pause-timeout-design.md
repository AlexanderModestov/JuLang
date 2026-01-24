# Настраиваемый таймаут паузы для голосового ввода

## Проблема

Web Speech API завершает запись при паузе ~1-2 секунды. Для начинающих (A1-A2) это слишком мало — им нужно время на обдумывание и формулировку ответа на французском. Пользователь делает паузу, чтобы подумать, а система уже отправляет незаконченный ответ.

## Решение

Заменить Web Speech API на собственную систему записи с настраиваемым таймаутом тишины:
- Запись через `MediaRecorder`
- Анализ громкости через `AudioContext` + `AnalyserNode`
- Транскрипция через Whisper API
- Настройка таймаута в профиле пользователя (1-15 секунд)

## Настройка

### Поле в User

```typescript
interface User {
  id: string
  name: string
  nativeLanguage: string
  frenchLevel: FrenchLevel
  preferredAiProvider: 'openai' | 'anthropic'
  speechPauseTimeout: number  // NEW: 1-15 секунд
  createdAt: Date
}
```

### Значение по умолчанию

При создании пользователя таймаут устанавливается по уровню:

| Уровень | Таймаут |
|---------|---------|
| A1, A2  | 5 сек   |
| B1, B2  | 3 сек   |
| C1, C2  | 2 сек   |

```typescript
function getDefaultPauseTimeout(level: FrenchLevel): number {
  switch (level) {
    case 'A1':
    case 'A2':
      return 5
    case 'B1':
    case 'B2':
      return 3
    case 'C1':
    case 'C2':
      return 2
  }
}
```

### UI в настройках

```
┌─────────────────────────────────────┐
│  🎤 Голосовой ввод                  │
│                                     │
│  Пауза для завершения записи        │
│  ○────────────●──────────○  5 сек   │
│  1 сек                      15 сек  │
│                                     │
│  Чем больше значение, тем дольше    │
│  можно думать между фразами.        │
└─────────────────────────────────────┘
```

## Техническая реализация

### SilenceDetector

Класс для определения тишины в аудиопотоке:

```typescript
interface SilenceDetectorOptions {
  pauseTimeout: number        // секунды до завершения
  silenceThreshold: number    // порог громкости (0-255), default: 10
  checkInterval: number       // интервал проверки мс, default: 100
}

class SilenceDetector {
  private audioContext: AudioContext
  private analyser: AnalyserNode
  private source: MediaStreamAudioSourceNode
  private silenceStart: number | null = null
  private checkIntervalId: number | null = null
  private options: SilenceDetectorOptions
  private onSilenceDetected: () => void
  private dataArray: Uint8Array

  constructor(
    stream: MediaStream,
    options: SilenceDetectorOptions,
    onSilenceDetected: () => void
  ) {
    this.options = options
    this.onSilenceDetected = onSilenceDetected

    this.audioContext = new AudioContext()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

    this.source = this.audioContext.createMediaStreamSource(stream)
    this.source.connect(this.analyser)
  }

  start(): void {
    this.checkIntervalId = window.setInterval(() => {
      this.checkAudioLevel()
    }, this.options.checkInterval)
  }

  stop(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId)
      this.checkIntervalId = null
    }
    this.audioContext.close()
  }

  private checkAudioLevel(): void {
    this.analyser.getByteFrequencyData(this.dataArray)
    const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length

    if (average < this.options.silenceThreshold) {
      // Тишина
      if (this.silenceStart === null) {
        this.silenceStart = Date.now()
      } else {
        const silenceDuration = (Date.now() - this.silenceStart) / 1000
        if (silenceDuration >= this.options.pauseTimeout) {
          this.onSilenceDetected()
          this.stop()
        }
      }
    } else {
      // Есть звук — сброс таймера
      this.silenceStart = null
    }
  }

  // Текущий уровень громкости (0-100) для визуализации
  getAudioLevel(): number {
    this.analyser.getByteFrequencyData(this.dataArray)
    const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length
    return Math.round((average / 255) * 100)
  }
}
```

### Обновлённый AudioRecorder

```typescript
class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private silenceDetector: SilenceDetector | null = null
  private onAutoStop: (() => void) | null = null

  async start(options?: {
    pauseTimeout?: number
    onAutoStop?: () => void
    onAudioLevel?: (level: number) => void
  }): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm',
    })

    this.audioChunks = []
    this.onAutoStop = options?.onAutoStop ?? null

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    }

    this.mediaRecorder.start(100) // chunks every 100ms

    // Настройка детектора тишины
    if (options?.pauseTimeout) {
      this.silenceDetector = new SilenceDetector(
        this.stream,
        {
          pauseTimeout: options.pauseTimeout,
          silenceThreshold: 10,
          checkInterval: 100,
        },
        () => {
          this.stop().then(() => {
            this.onAutoStop?.()
          })
        }
      )
      this.silenceDetector.start()

      // Callback для визуализации уровня звука
      if (options.onAudioLevel) {
        const levelInterval = setInterval(() => {
          if (this.silenceDetector) {
            options.onAudioLevel!(this.silenceDetector.getAudioLevel())
          } else {
            clearInterval(levelInterval)
          }
        }, 50)
      }
    }
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'))
        return
      }

      this.silenceDetector?.stop()
      this.silenceDetector = null

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.cleanup()
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  // ... остальные методы без изменений
}
```

### Whisper API эндпоинт

**api/whisper.ts**

```typescript
import OpenAI from 'openai'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const formData = await req.formData()
  const audioFile = formData.get('audio') as Blob

  if (!audioFile) {
    return new Response('No audio file provided', { status: 400 })
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const transcription = await openai.audio.transcriptions.create({
    file: new File([audioFile], 'audio.webm', { type: 'audio/webm' }),
    model: 'whisper-1',
    language: 'fr',
  })

  return Response.json({ text: transcription.text })
}
```

### Функция транскрипции на клиенте

```typescript
async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('audio', audioBlob)

  const response = await fetch('/api/whisper', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Transcription failed')
  }

  const data = await response.json()
  return data.text
}
```

## Использование в компонентах

### PracticeScreen (пример)

```typescript
const { user } = useAppStore()

const handleVoiceInput = async () => {
  setIsListening(true)

  await audioRecorder.start({
    pauseTimeout: user.speechPauseTimeout,
    onAutoStop: async () => {
      setIsListening(false)
      const audioBlob = await audioRecorder.stop()
      const transcript = await transcribeAudio(audioBlob)
      setUserAnswer(transcript)
      // ... проверка ответа
    },
    onAudioLevel: (level) => {
      setAudioLevel(level)  // для визуализации
    },
  })
}
```

## Изменения в файлах

| Файл | Изменение |
|------|-----------|
| `src/types/index.ts` | Добавить `speechPauseTimeout: number` в `User` |
| `src/modules/SpeechService.ts` | Добавить `SilenceDetector`, обновить `AudioRecorder` |
| `src/store/useAppStore.ts` | `getDefaultPauseTimeout()`, установка при онбординге |
| `src/components/Settings/SettingsScreen.tsx` | Слайдер настройки паузы |
| `src/components/GrammarPractice/PracticeScreen.tsx` | Использовать новый `AudioRecorder` |
| `src/components/Conversation/ConversationScreen.tsx` | Использовать новый `AudioRecorder` |
| `api/whisper.ts` | **Новый** — эндпоинт Whisper API |
| `vercel.json` | Добавить роут `/api/whisper` |

## Миграция

Для существующих пользователей без `speechPauseTimeout`:

```typescript
// В useAppStore при загрузке
if (user && user.speechPauseTimeout === undefined) {
  updateUser({
    speechPauseTimeout: getDefaultPauseTimeout(user.frenchLevel)
  })
}
```
