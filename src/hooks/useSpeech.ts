import { useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  speak as rawSpeak,
  speakWithPauses as rawSpeakWithPauses,
  getVoiceByName,
  selectBestVoice,
} from '@/modules/SpeechService'
import { DEFAULT_SPEECH_SETTINGS } from '@/types'
import type { Language } from '@/types'

/**
 * Hook that wraps speak() and speakWithPauses() with the user's saved speech settings.
 * All TTS calls should use this hook instead of importing speak() directly.
 */
export function useSpeech() {
  const { profile, currentLanguage } = useAuthContext()

  const settings = profile?.speech_settings ?? DEFAULT_SPEECH_SETTINGS

  const speak = useCallback(
    (text: string, options?: { language?: Language; onEnd?: () => void; onError?: (error: string) => void }) => {
      const language = options?.language ?? currentLanguage

      // Resolve the user's chosen voice, or auto-select best
      const voice = settings.voiceName
        ? getVoiceByName(settings.voiceName)
        : selectBestVoice(speechSynthesis.getVoices(), language)

      rawSpeak(text, {
        voice: voice ?? undefined,
        rate: settings.rate,
        pitch: settings.pitch,
        language,
        onEnd: options?.onEnd,
        onError: options?.onError,
      })
    },
    [settings.voiceName, settings.rate, settings.pitch, currentLanguage]
  )

  const speakWithPauses = useCallback(
    (text: string, language?: Language) => {
      return rawSpeakWithPauses(text, settings, language ?? currentLanguage)
    },
    [settings, currentLanguage]
  )

  return { speak, speakWithPauses }
}
