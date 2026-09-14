import { useEffect, useRef, useState } from 'react'
import { continueConversation } from '../lib/openai'
import { loadState, saveState } from '../lib/storage'
import { startVoiceRecognition, type VoiceRecognitionHandle } from '../lib/voiceRecognition'
import type { ChatMessage, Task } from '../types'

type ChatPanelProps = {
  referenceDate: string
  referenceTime: string
  onTasksUpdate: (tasks: Task[]) => void
  pendingContext: string[]
  onContextConsumed: () => void
}

const OPENING_MESSAGE = "Hi, I'm ChroniyamAI. Tell me what's on your plate and I'll help you plan it out."

const ChatPanel = ({ referenceDate, referenceTime, onTasksUpdate, pendingContext, onContextConsumed }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadState('chatMessages', []))
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
      const result = await continueConversation(nextMessages, referenceRef.current.referenceDate, referenceRef.current.referenceTime)
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
      onTasksUpdate(result.tasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong talking to ChroniyamAI.')
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="chat-panel">
      <header className="chat-panel-header">
        <span className="chat-panel-title">ChroniyamAI</span>
      </header>

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
    </div>
  )
}

export default ChatPanel
