export type VoiceRecognitionHandle = {
  start: () => void
  stop: () => void
  cleanup: () => void
}

export const startVoiceRecognition = (
  onResult: (text: string) => void,
  onEnd: () => void,
  onError: (message: string) => void,
): VoiceRecognitionHandle => {
  const SpeechRecognitionCtor =
    (window as typeof window & {
      SpeechRecognition?: new () => any
      webkitSpeechRecognition?: new () => any
    }).SpeechRecognition ??
    (window as typeof window & {
      SpeechRecognition?: new () => any
      webkitSpeechRecognition?: new () => any
    }).webkitSpeechRecognition

  if (!SpeechRecognitionCtor) {
    onError('Voice input is not supported in this browser.')
    return { start: () => undefined, stop: () => undefined, cleanup: () => undefined }
  }

  const recognition = new SpeechRecognitionCtor()
  recognition.lang = 'en-US'
  recognition.interimResults = true
  recognition.continuous = true

  let finalTranscript = ''
  let silenceTimer: ReturnType<typeof setTimeout> | null = null

  const clearSilenceTimer = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer)
      silenceTimer = null
    }
  }

  // longer grace window up front to allow for the mic permission prompt
  const scheduleAutoStop = (timeoutMs: number) => {
    clearSilenceTimer()
    silenceTimer = setTimeout(() => recognition.stop(), timeoutMs)
  }

  recognition.onresult = (event: any) => {
    let interimText = ''
    let finalText = ''

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalText += transcript
      } else {
        interimText += transcript
      }
    }

    if (finalText) finalTranscript += finalText
    onResult(`${finalTranscript}${interimText}`.trim())
    scheduleAutoStop(2500)
  }

  recognition.onerror = (event: any) => {
    clearSilenceTimer()
    onError(event?.error ? `Voice input error: ${event.error}` : 'Voice input failed.')
  }

  recognition.onend = () => {
    clearSilenceTimer()
    onEnd()
  }

  return {
    start: () => {
      finalTranscript = ''
      recognition.start()
      scheduleAutoStop(10000)
    },
    stop: () => recognition.stop(),
    cleanup: () => {
      clearSilenceTimer()
      recognition.stop()
    },
  }
}
