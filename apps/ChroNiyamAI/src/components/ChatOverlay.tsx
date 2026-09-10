import { useEffect, useRef, useState } from 'react'
import { continueConversation } from '../lib/openai'
import { startVoiceRecognition } from '../lib/voiceRecognition'
import type { ChatMessage, Task } from '../types'

type ChatOverlayProps = {
  onComplete: (tasks: Task[]) => void
  onCancel: () => void
}

const OPENING_MESSAGE = "Hi, I'm ChroniyamAI. Tell me what's on your plate and I'll help you plan it out."

const ChatOverlay = ({ onComplete, onCancel }: ChatOverlayProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState('')

  const transcriptRef = useRef('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking])

  useEffect(() => {
    if (!isListening) return

    const recognizer = startVoiceRecognition(
      (text) => {
        transcriptRef.current = text
        setInput(text)
      },
      () => setIsListening(false),
      (message) => {
        setError(message)
        setIsListening(false)
      },
    )

    recognizer.start()
    return () => recognizer.cleanup()
  }, [isListening])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setIsThinking(true)

    try {
      const result = await continueConversation(nextMessages)
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])

      if (result.done && result.tasks.length > 0) {
        setTimeout(() => onComplete(result.tasks), 600)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong talking to ChroniyamAI.')
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="chat-overlay">
      <div className="chat-overlay-backdrop" onClick={onCancel} />
      <div className="chat-panel" role="dialog" aria-modal="true" aria-label="ChroniyamAI conversation">
        <header className="chat-panel-header">
          <span className="chat-panel-title">ChroniyamAI</span>
          <button type="button" className="chat-close" onClick={onCancel} aria-label="Close">×</button>
        </header>

        <div className="chat-messages" ref={scrollRef}>
          <div className="chat-bubble assistant">{OPENING_MESSAGE}</div>
          {messages.map((message, index) => (
            <div key={index} className={`chat-bubble ${message.role}`}>
              {message.content}
            </div>
          ))}
          {isThinking && <div className="chat-bubble assistant thinking">...</div>}
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
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={isListening ? 'Listening...' : 'Type or speak your tasks...'}
            className="chat-input"
          />
          <button type="submit" className="chat-send" disabled={isThinking || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatOverlay
