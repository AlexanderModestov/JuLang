// Web Speech API wrapper for speech recognition and synthesis

import { languageTTSCodes, type Language } from '@/types'
import { apiFetch } from '@/lib/apiClient'

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

export interface SpeechRecognitionResultData {
  transcript: string
  confidence: number
  isFinal: boolean
}

type SpeechRecognitionCallback = (result: SpeechRecognitionResultData) => void
type SpeechErrorCallback = (error: string) => void

let recognition: ISpeechRecognition | null = null
let isListening = false

// Check if Web Speech API is available
export function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window
}

// Speech Recognition
export function startListening(
  onResult: SpeechRecognitionCallback,
  onError: SpeechErrorCallback,
  language: string = 'fr-FR'
): void {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser')
    return
  }

  if (isListening) {
    stopListening()
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = true
  recognition.lang = language

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const result = event.results[event.results.length - 1]
    onResult({
      transcript: result[0].transcript,
      confidence: result[0].confidence,
      isFinal: result.isFinal,
    })
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    let message = 'Unknown error'
    switch (event.error) {
      case 'no-speech':
        message = 'No speech detected'
        break
      case 'audio-capture':
        message = 'Microphone not available'
        break
      case 'not-allowed':
        message = 'Microphone permission denied'
        break
      case 'network':
        message = 'Network error'
        break
    }
    onError(message)
    isListening = false
  }

  recognition.onend = () => {
    isListening = false
  }

  recognition.start()
  isListening = true
}

export function stopListening(): void {
  if (recognition && isListening) {
    recognition.stop()
    isListening = false
  }
}

export function isCurrentlyListening(): boolean {
  return isListening
}

// Speech Synthesis
export function getAvailableVoices(language: string = 'fr'): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return []

  return speechSynthesis.getVoices().filter((voice) =>
    voice.lang.toLowerCase().startsWith(language.toLowerCase())
  )
}

// Get voices for a specific language with async loading support (voices load async in some browsers)
export function getVoicesForLanguage(language: Language = 'fr'): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices()
    const langCode = languageTTSCodes[language].split('-')[0] // 'fr-FR' -> 'fr'

    if (voices.length > 0) {
      resolve(voices.filter(v => v.lang.startsWith(langCode)))
      return
    }

    // Voices may load asynchronously
    speechSynthesis.onvoiceschanged = () => {
      const loadedVoices = speechSynthesis.getVoices()
      resolve(loadedVoices.filter(v => v.lang.startsWith(langCode)))
    }
  })
}

// Legacy alias for backward compatibility
export function getAvailableFrenchVoices(): Promise<SpeechSynthesisVoice[]> {
  return getVoicesForLanguage('fr')
}

// Voice quality scoring for auto-selection
interface VoiceQualityScore {
  voice: SpeechSynthesisVoice
  score: number
}

// Known good voices by language
const knownGoodVoicesByLanguage: Record<Language, string[]> = {
  fr: ['amélie', 'thomas', 'hortense', 'paul', 'google français', 'audrey'],
  en: ['samantha', 'daniel', 'alex', 'google us english', 'google uk english'],
  es: ['mónica', 'jorge', 'paulina', 'google español'],
  de: ['anna', 'markus', 'petra', 'google deutsch'],
  pt: ['luciana', 'felipe', 'google português'],
}

// Select the best voice for a language based on quality indicators
export function selectBestVoice(voices: SpeechSynthesisVoice[], language: Language = 'fr'): SpeechSynthesisVoice | null {
  const ttsCode = languageTTSCodes[language]
  const langCode = ttsCode.split('-')[0]

  const languageVoices = voices.filter(v =>
    v.lang.startsWith(ttsCode) || v.lang.startsWith(langCode)
  )

  if (languageVoices.length === 0) return null

  // Score each voice
  const scored: VoiceQualityScore[] = languageVoices.map(voice => {
    let score = 0
    const name = voice.name.toLowerCase()

    // Premium/Neural voices — highest priority
    if (name.includes('premium') || name.includes('neural') || name.includes('natural')) {
      score += 100
    }

    // Enhanced voices
    if (name.includes('enhanced')) {
      score += 80
    }

    // Known good voices by language
    const knownGoodVoices = knownGoodVoicesByLanguage[language] || []
    if (knownGoodVoices.some(good => name.includes(good))) {
      score += 50
    }

    // Local voices are usually better quality than network
    if (voice.localService) {
      score += 20
    }

    // Prefer exact TTS code match (e.g., fr-FR over fr-CA)
    if (voice.lang === ttsCode) {
      score += 10
    }

    return { voice, score }
  })

  // Sort by score and return best
  scored.sort((a, b) => b.score - a.score)
  return scored[0].voice
}

// Legacy alias for backward compatibility
export function selectBestFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return selectBestVoice(voices, 'fr')
}

// Get voice by name
export function getVoiceByName(name: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  return voices.find(v => v.name === name) || null
}

// Pause duration between sentences
const SENTENCE_PAUSE_MS = 300

// Helper to pause
function pause(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Speak a single sentence
function speakSentence(
  text: string,
  settings: { voiceName: string | null; rate: number; pitch: number },
  language: Language = 'fr'
): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)

    // Select voice
    const voice = settings.voiceName
      ? getVoiceByName(settings.voiceName)
      : selectBestVoice(speechSynthesis.getVoices(), language)

    if (voice) {
      utterance.voice = voice
    }

    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.lang = languageTTSCodes[language]

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve() // Don't block on error

    speechSynthesis.speak(utterance)
  })
}

// Speak text with pauses between sentences for natural rhythm
export async function speakWithPauses(
  text: string,
  settings: { voiceName: string | null; rate: number; pitch: number },
  language: Language = 'fr'
): Promise<void> {
  // Cancel any ongoing speech
  speechSynthesis.cancel()

  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    if (!sentence) continue

    await speakSentence(sentence, settings, language)

    // Pause between sentences (except after last)
    if (i < sentences.length - 1) {
      await pause(SENTENCE_PAUSE_MS)
    }
  }
}

export function speak(
  text: string,
  options: {
    voice?: SpeechSynthesisVoice
    rate?: number
    pitch?: number
    language?: Language
    onEnd?: () => void
    onError?: (error: string) => void
  } = {}
): void {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.('Speech synthesis is not supported')
    return
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel()

  const language = options.language ?? 'fr'
  const utterance = new SpeechSynthesisUtterance(text)

  // Set voice: use provided, or select best voice for the language
  if (options.voice) {
    utterance.voice = options.voice
  } else {
    const bestVoice = selectBestVoice(speechSynthesis.getVoices(), language)
    if (bestVoice) {
      utterance.voice = bestVoice
    }
  }

  utterance.rate = options.rate ?? 0.9
  utterance.pitch = options.pitch ?? 1.0
  utterance.lang = languageTTSCodes[language]

  utterance.onend = () => {
    options.onEnd?.()
  }

  utterance.onerror = (event) => {
    options.onError?.(event.error)
  }

  speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    speechSynthesis.cancel()
  }
}

export function isSpeaking(): boolean {
  return isSpeechSynthesisSupported() && speechSynthesis.speaking
}

// Silence detection options
interface SilenceDetectorOptions {
  pauseTimeout: number        // seconds until auto-stop
  silenceThreshold: number    // volume threshold (0-255), default: 10
  checkInterval: number       // check interval ms, default: 100
}

// Silence detector using AudioContext + AnalyserNode
export class SilenceDetector {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private silenceStart: number | null = null
  private checkIntervalId: number | null = null
  private options: SilenceDetectorOptions
  private onSilenceDetected: () => void
  private dataArray: Uint8Array | null = null

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
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.analyser = null
    this.source = null
    this.dataArray = null
  }

  private checkAudioLevel(): void {
    if (!this.analyser || !this.dataArray) return

    this.analyser.getByteFrequencyData(this.dataArray)
    const average = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length

    if (average < this.options.silenceThreshold) {
      // Silence detected
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
      // Sound detected — reset timer
      this.silenceStart = null
    }
  }

  // Current audio level (0-100) for visualization
  getAudioLevel(): number {
    if (!this.analyser || !this.dataArray) return 0

    this.analyser.getByteFrequencyData(this.dataArray)
    const average = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length
    return Math.round((average / 255) * 100)
  }
}

// Audio recording options
export interface AudioRecorderOptions {
  pauseTimeout?: number         // seconds, auto-stop after silence
  onAutoStop?: () => void       // called when auto-stopped
  onAudioLevel?: (level: number) => void  // for visualization
}

// Audio recording for Whisper API with silence detection
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private silenceDetector: SilenceDetector | null = null
  private onAutoStop: (() => void) | null = null
  private levelIntervalId: number | null = null

  async start(options?: AudioRecorderOptions): Promise<void> {
    try {
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

      // Setup silence detector if pauseTimeout provided
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

        // Callback for audio level visualization
        if (options.onAudioLevel) {
          this.levelIntervalId = window.setInterval(() => {
            if (this.silenceDetector) {
              options.onAudioLevel!(this.silenceDetector.getAudioLevel())
            } else {
              if (this.levelIntervalId) {
                clearInterval(this.levelIntervalId)
                this.levelIntervalId = null
              }
            }
          }, 50)
        }
      }
    } catch (error) {
      throw new Error('Failed to start audio recording')
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'))
        return
      }

      // Stop silence detector
      this.silenceDetector?.stop()
      this.silenceDetector = null

      // Stop level interval
      if (this.levelIntervalId) {
        clearInterval(this.levelIntervalId)
        this.levelIntervalId = null
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.cleanup()
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  cancel(): void {
    this.silenceDetector?.stop()
    this.silenceDetector = null

    if (this.levelIntervalId) {
      clearInterval(this.levelIntervalId)
      this.levelIntervalId = null
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    this.cleanup()
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}

// Singleton audio recorder
export const audioRecorder = new AudioRecorder()

// Whisper API transcription
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('audio', audioBlob)

  const response = await apiFetch('/api/whisper', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Transcription failed')
  }

  const data = await response.json()
  return data.text
}

