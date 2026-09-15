import { useEffect, useRef, useState } from 'react'
import { continueConversation } from '../lib/openai'
import { loadState, saveState } from '../lib/storage'
import { startVoiceRecognition, type VoiceRecognitionHandle } from '../lib/voiceRecognition'
import type { ChatMessage, Task } from '../types'

type ChatPanelProps = {
  isCollapsed: boolean
  onToggleCollapse: () => void
  referenceDate: string
  referenceTime: string
  onTasksUpdate: (tasks: Task[]) => void
  pendingContext: string[]
  onContextConsumed: () => void
}

const OPENING_MESSAGE = "Hi, I'm Chroniyam AI. Tell me what's on your plate and I'll help you plan it out."

const getStoredSarcasmLevel = (): number => {
  const stored = loadState<number | boolean>('isSarcastic', 0)
  if (typeof stored === 'boolean') return stored ? 70 : 0
  return Math.min(100, Math.max(0, Number(stored) || 0))
}

const getSarcasmLabel = (level: number): string => {
  if (level === 0) return 'Straightforward'
  if (level < 35) return 'Light touch'
  if (level < 70) return 'Witty'
  return 'Sharp'
}

type VoiceTone = 'calm' | 'bright' | 'direct'

const VOICE_TONES: Record<VoiceTone, { label: string; pitch: number }> = {
  calm: { label: 'Calm', pitch: 0.9 },
  bright: { label: 'Bright', pitch: 1.15 },
  direct: { label: 'Direct', pitch: 0.78 },
}

const VOICE_SPEEDS = [0.85, 1, 1.15, 1.3, 1.5, 1.75, 2]

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

const speakText = (text: string, tone: VoiceTone, speed: number): boolean => {
  if (!canSpeak() || !text.trim()) return false

  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text.trim())
  const voice = synth.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith('en'))
  if (voice) utterance.voice = voice
  utterance.lang = voice?.lang || 'en-US'
  utterance.rate = speed
  utterance.pitch = VOICE_TONES[tone].pitch
  utterance.volume = 1
  synth.speak(utterance)
  return true
}

const ChatPanel = ({ isCollapsed, onToggleCollapse, referenceDate, referenceTime, onTasksUpdate, pendingContext, onContextConsumed }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadState('chatMessages', []))
  const [sarcasmLevel, setSarcasmLevel] = useState(getStoredSarcasmLevel)
  const [voiceRepliesEnabled, setVoiceRepliesEnabled] = useState(() => loadState('voiceRepliesEnabled', false))
  const [voiceTone, setVoiceTone] = useState<VoiceTone>(() => loadState<VoiceTone>('voiceTone', 'calm'))
  const [voiceSpeed, setVoiceSpeed] = useState(() => loadState('voiceSpeed', 1.3))
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState('')

  const transcriptRef = useRef('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognizerRef = useRef<VoiceRecognitionHandle | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suppressResultsRef = useRef(false)
  const referenceRef = useRef({ referenceDate, referenceTime })

  useEffect(() => saveState('chatMessages', messages), [messages])
  useEffect(() => saveState('isSarcastic', sarcasmLevel), [sarcasmLevel])
  useEffect(() => saveState('voiceRepliesEnabled', voiceRepliesEnabled), [voiceRepliesEnabled])
  useEffect(() => saveState('voiceTone', voiceTone), [voiceTone])
  useEffect(() => saveState('voiceSpeed', voiceSpeed), [voiceSpeed])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  useEffect(() => {
    referenceRef.current = { referenceDate, referenceTime }
  }, [referenceDate, referenceTime])

  useEffect(() => {
    if (pendingContext.length === 0) return
    // fold manual UI edits into the conversation history silently, so the AI stops re-asking about them
    setMessages((prev) => [...prev, ...pendingContext.map((note) => ({ role: 'system' as const, content: note }))])
    onContextConsumed()
  }, [pendingContext, onContextConsumed])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
    textarea.style.overflowY = textarea.scrollHeight > 160 ? 'auto' : 'hidden'
  }, [input])

  useEffect(() => {
    if (!isListening) return
    suppressResultsRef.current = false

    const recognizer = startVoiceRecognition(
      (text) => {
        // recognition.stop() still delivers one final async onresult; ignore it once sent
        if (suppressResultsRef.current) return
        transcriptRef.current = text
        setInput(text)
      },
      () => setIsListening(false),
      (message) => {
        setError(message)
        setIsListening(false)
      },
    )

    recognizerRef.current = recognizer
    recognizer.start()
    return () => {
      recognizer.cleanup()
      recognizerRef.current = null
    }
  }, [isListening])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return

    // stop the mic explicitly and suppress its trailing async result, otherwise it repopulates the box
    suppressResultsRef.current = true
    recognizerRef.current?.stop()
    setIsListening(false)

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setIsThinking(true)

    try {
      const result = await continueConversation(
        nextMessages,
        referenceRef.current.referenceDate,
        referenceRef.current.referenceTime,
        sarcasmLevel,
      )
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
      if (voiceRepliesEnabled && result.reply) {
        speakText(result.reply, voiceTone, voiceSpeed)
      }
      onTasksUpdate(result.tasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong talking to Chroniyam AI.')
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className={`chat-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <header className="chat-panel-header">
        <div className="chat-panel-brand">
          <img src="/tictactoe-icon.svg" alt="Chroniyam AI logo" className="chat-panel-logo" />
          {!isCollapsed && <span className="chat-panel-title">Chroniyam AI</span>}
        </div>

        <div className="chat-panel-actions">
          {!isCollapsed && (
            <>
              <button
                type="button"
                className={`voice-icon-button ${voiceRepliesEnabled ? 'active' : ''}`}
                onClick={() => {
                  setVoiceRepliesEnabled((value) => !value)
                  if (voiceRepliesEnabled) window.speechSynthesis?.cancel()
                }}
                disabled={!canSpeak()}
                aria-pressed={voiceRepliesEnabled}
                aria-label={voiceRepliesEnabled ? 'Turn voice replies off' : 'Turn voice replies on'}
                title={voiceRepliesEnabled ? 'Turn voice replies off' : 'Turn voice replies on'}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                  <path d="M17 9.5a4 4 0 0 1 0 5M19.5 7a7.5 7.5 0 0 1 0 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                className={`voice-settings-button ${isVoiceSettingsOpen ? 'active' : ''}`}
                onClick={() => setIsVoiceSettingsOpen((value) => !value)}
                aria-expanded={isVoiceSettingsOpen}
                aria-label="Open voice settings"
                title="Voice settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M19 13.2v-2.4l-2-.5a7.3 7.3 0 0 0-.6-1.4l1.1-1.7-1.7-1.7-1.7 1.1a7.3 7.3 0 0 0-1.4-.6l-.5-2h-2.4l-.5 2a7.3 7.3 0 0 0-1.4.6L6.2 5.5 4.5 7.2l1.1 1.7a7.3 7.3 0 0 0-.6 1.4l-2 .5v2.4l2 .5c.2.5.4 1 .6 1.4l-1.1 1.7 1.7 1.7 1.7-1.1c.4.2.9.5 1.4.6l.5 2h2.4l.5-2c.5-.2 1-.4 1.4-.6l1.7 1.1 1.7-1.7-1.1-1.7c.2-.4.5-.9.6-1.4l2-.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
          <button
            type="button"
            className="chat-panel-toggle"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand AI sidebar' : 'Collapse AI sidebar'}
            aria-label={isCollapsed ? 'Expand AI sidebar' : 'Collapse AI sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={isCollapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {!isCollapsed && isVoiceSettingsOpen && (
        <div className="voice-settings-menu">
          <label className="voice-tone-control">
            <span>Tone</span>
            <select value={voiceTone} onChange={(event) => setVoiceTone(event.target.value as VoiceTone)}>
              {Object.entries(VOICE_TONES).map(([value, tone]) => <option key={value} value={value}>{tone.label}</option>)}
            </select>
          </label>
          <label className="voice-tone-control">
            <span>Speed</span>
            <select value={voiceSpeed} onChange={(event) => setVoiceSpeed(Number(event.target.value))}>
              {VOICE_SPEEDS.map((speed) => <option key={speed} value={speed}>{speed}x</option>)}
            </select>
          </label>
          <button
            type="button"
            className="voice-test-button"
            onClick={() => {
              speakText('Voice replies are working.', voiceTone, voiceSpeed)
            }}
            disabled={!canSpeak()}
          >
            Test
          </button>
        </div>
      )}

      {!isCollapsed && (
        <div className="chat-panel-controls">
          <div className="sarcasm-control">
            <div className="sarcasm-control-header">
              <span>AI sarcasm</span>
              <strong>{getSarcasmLabel(sarcasmLevel)}</strong>
            </div>
            <div className="sarcasm-slider-wrap">
              <div className="sarcasm-progress" style={{ '--sarcasm-level': `${sarcasmLevel}%` } as React.CSSProperties} />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sarcasmLevel}
                onChange={(event) => setSarcasmLevel(Number(event.target.value))}
                aria-label="AI sarcasm level"
              />
            </div>
            <div className="sarcasm-scale" aria-hidden="true"><span>Focused</span><span>Playful</span><span>Dry</span></div>
          </div>
        </div>
      )}

      {!isCollapsed && (
        <>
          <div className="chat-messages" ref={scrollRef}>
            <div className="chat-bubble assistant">{OPENING_MESSAGE}</div>
            {messages.filter((message) => message.role !== 'system').map((message, index) => (
              <div key={index} className={`chat-bubble ${message.role}`}>
                {message.content}
              </div>
            ))}
            {isThinking && (
              <div className="chat-bubble assistant thinking">
                <span /><span /><span />
              </div>
            )}
          </div>

          {error && <div className="chat-error">{error}</div>}

          <form
            className="chat-input-row"
            onSubmit={(event) => {
              event.preventDefault()
              void send(input)
            }}
          >
            <button
              type="button"
              className={`chat-mic ${isListening ? 'active' : ''}`}
              onClick={() => setIsListening((value) => !value)}
              aria-label="Speak"
              title="Speak"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19 11a7 7 0 1 1-14 0M12 18v4M8 22h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void send(input)
                }
              }}
              placeholder={isListening ? 'Listening...' : 'Type or speak your tasks...'}
              className="chat-input"
              rows={1}
            />
            <button type="submit" className="chat-send" disabled={isThinking || !input.trim()}>
              Send
            </button>
          </form>
        </>
      )}

    </div>
  )
}

export default ChatPanel
