import { useState } from 'react'
import ChatOverlay from './components/ChatOverlay'
import DraftReview from './components/DraftReview'
import MatrixView from './components/MatrixView'
import type { Task } from './types'
import './App.css'

type Phase = 'landing' | 'chat' | 'draft' | 'matrix'

function App() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [draftTasks, setDraftTasks] = useState<Task[]>([])
  const [finalTasks, setFinalTasks] = useState<Task[]>([])

  return (
    <div className="app-shell">
      {phase !== 'matrix' && (
        <div className="landing">
          <h1>ChroniyamAI</h1>
          <p>Talk through your day and let AI turn it into a plan.</p>
          <button type="button" className="talk-button" onClick={() => setPhase('chat')}>
            Talk to ChroniyamAI
          </button>
        </div>
      )}

      {phase === 'chat' && (
        <ChatOverlay
          onCancel={() => setPhase('landing')}
          onComplete={(tasks) => {
            setDraftTasks(tasks)
            setPhase('draft')
          }}
        />
      )}

      {phase === 'draft' && (
        <DraftReview
          tasks={draftTasks}
          onCancel={() => setPhase('chat')}
          onConfirm={(tasks) => {
            setFinalTasks(tasks)
            setPhase('matrix')
          }}
        />
      )}

      {phase === 'matrix' && (
        <MatrixView tasks={finalTasks} onStartOver={() => setPhase('chat')} />
      )}
    </div>
  )
}

export default App
