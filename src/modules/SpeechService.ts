// Web Speech API wrapper for speech recognition and synthesis

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
  if (!isSpeechSynthesisSupported()) {
    options.onError?.('Speech synthesis is not supported')
    return
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)

  // Set French voice if available
  if (options.voice) {
    utterance.voice = options.voice
  } else {
    const frenchVoices = getAvailableVoices('fr')
    if (frenchVoices.length > 0) {
      utterance.voice = frenchVoices[0]
    }
  }

  utterance.rate = options.rate ?? 1.0
  utterance.pitch = options.pitch ?? 1.0
  utterance.lang = 'fr-FR'

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

// Audio recording for Whisper API
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      })

      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start()
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

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.cleanup()
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  cancel(): void {
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

