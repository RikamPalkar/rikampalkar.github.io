import { useEffect, useRef, useState } from 'react'
import ChatPanel from './components/ChatPanel'
import HelpCarousel from './components/HelpCarousel'
import PlanningSetup from './components/PlanningSetup'
import RightPanel from './components/RightPanel'
import { stabilizeTaskIds } from './lib/mergeTasks'
import { getDateRange } from './lib/scheduleValidator'
import { clearState, loadState, saveState } from './lib/storage'
import type { PlanningMode, Task } from './types'
import './App.css'

const getCurrentDate = () => new Date().toISOString().slice(0, 10)
const getCurrentTime = () => new Date().toTimeString().slice(0, 5)

type FloatPosition = { left: number; top: number }

const AppHeader = ({ onOpenHelp }: { onOpenHelp: () => void }) => (
  <header className="app-header">
    <div className="app-brand">
      <img src="/tictactoe-icon.svg" alt="Chroniyam AI logo" className="app-brand-logo" />
      <span>Chroniyam AI</span>
    </div>
    <button type="button" className="app-help-button" onClick={onOpenHelp} title="About Chroniyam AI" aria-label="About Chroniyam AI">?</button>
  </header>
)

function App() {
  const [planningMode, setPlanningMode] = useState<PlanningMode | null>(() => loadState('planningMode', null))
  const [planningDays, setPlanningDays] = useState(() => loadState('planningDays', 7))
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [aiButtonPosition, setAiButtonPosition] = useState<FloatPosition | null>(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [referenceDate] = useState(getCurrentDate())
  const [referenceTime] = useState(getCurrentTime())
  const [sleepHours, setSleepHours] = useState(() => loadState('sleepHours', 9))
  const [sleepOverriddenDates, setSleepOverriddenDates] = useState<Set<string>>(
    () => new Set(loadState<string[]>('sleepOverriddenDates', [])),
  )
  const [tasks, setTasks] = useState<Task[]>(() => loadState('tasks', []))
  const [locked, setLocked] = useState(() => loadState('locked', false))
  const [pendingContext, setPendingContext] = useState<string[]>([])
  const aiButtonDragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 })

  useEffect(() => saveState('planningMode', planningMode), [planningMode])
  useEffect(() => saveState('planningDays', planningDays), [planningDays])
  useEffect(() => saveState('sleepHours', sleepHours), [sleepHours])
  useEffect(() => saveState('sleepOverriddenDates', [...sleepOverriddenDates]), [sleepOverriddenDates])
  useEffect(() => saveState('tasks', tasks), [tasks])
  useEffect(() => saveState('locked', locked), [locked])

  const handleTasksUpdate = (incoming: Task[]) => {
    if (locked) return
    setTasks((prev) => stabilizeTaskIds(prev, incoming))
  }

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    // let the AI know about fields the user just confirmed by hand, so it stops asking about them
    const existing = tasks.find((task) => task.id === id)
    if (existing) {
      const notes: string[] = []
      if (updates.durationSpecified && !existing.durationSpecified) {
        notes.push(`"${existing.title}" duration is confirmed: ${updates.estimatedHours ?? existing.estimatedHours}h.`)
      }
      if (updates.startSpecified && !existing.startSpecified) {
        notes.push(`"${existing.title}" start date is confirmed: ${updates.startDate ?? existing.startDate}.`)
      }
      if (updates.timeSpecified && !existing.timeSpecified) {
        notes.push(`"${existing.title}" start time is confirmed: ${updates.startTime ?? existing.startTime}.`)
      }
      if (notes.length > 0) setPendingContext((prev) => [...prev, ...notes])
    }

    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const handleRemoveTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const handleCleanTasks = () => {
    if (tasks.length === 0) return
    if (!window.confirm('Clear all tasks from this plan?')) return
    setTasks([])
    setLocked(false)
  }

  const handleOverrideSleep = (date: string) => {
    setSleepOverriddenDates((prev) => new Set(prev).add(date))
  }

  const handleStartOver = () => {
    for (const key of ['planningMode', 'planningDays', 'sleepHours', 'sleepOverriddenDates', 'tasks', 'locked', 'chatMessages']) {
      clearState(key)
    }
    window.location.reload()
  }

  const handleAiButtonPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const bounds = button.getBoundingClientRect()
    aiButtonDragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    }
    button.setPointerCapture(event.pointerId)
  }

  const handleAiButtonPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = aiButtonDragRef.current
    if (!drag.active) return

    const nextLeft = Math.min(
      Math.max(8, event.clientX - drag.offsetX),
      window.innerWidth - event.currentTarget.offsetWidth - 8,
    )
    const nextTop = Math.min(
      Math.max(8, event.clientY - drag.offsetY),
      window.innerHeight - event.currentTarget.offsetHeight - 8,
    )

    if (Math.abs(event.clientX - drag.startX) > 4 || Math.abs(event.clientY - drag.startY) > 4) {
      drag.moved = true
    }
    if (drag.moved) setAiButtonPosition({ left: nextLeft, top: nextTop })
  }

  const handleAiButtonPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId)
    aiButtonDragRef.current.active = false
  }

  const handleAiButtonClick = () => {
    if (aiButtonDragRef.current.moved) {
      aiButtonDragRef.current.moved = false
      return
    }
    setIsAiOpen((value) => !value)
  }

  if (!planningMode) {
    return (
      <div className="app-shell">
        <AppHeader onOpenHelp={() => setIsHelpOpen(true)} />
        <PlanningSetup
          onStart={(mode, days) => {
            setPlanningMode(mode)
            setPlanningDays(days)
          }}
        />
        {isHelpOpen && <HelpCarousel onClose={() => setIsHelpOpen(false)} />}
      </div>
    )
  }

  const rangeDates = getDateRange(referenceDate, planningDays)

  return (
    <div className="app-shell">
      <AppHeader onOpenHelp={() => setIsHelpOpen(true)} />

      <RightPanel
        planningMode={planningMode}
        planningDays={planningDays}
        rangeDates={rangeDates}
        referenceDate={referenceDate}
        referenceTime={referenceTime}
        sleepHours={sleepHours}
        onSleepHoursChange={setSleepHours}
        sleepOverriddenDates={sleepOverriddenDates}
        onOverrideSleep={handleOverrideSleep}
        tasks={tasks}
        onUpdateTask={handleUpdateTask}
        onRemoveTask={handleRemoveTask}
        onCleanTasks={handleCleanTasks}
        locked={locked}
        onFinalize={() => setLocked(true)}
        onStartOver={handleStartOver}
      />

      {isAiOpen && (
        <ChatPanel
          isCollapsed={false}
          onToggleCollapse={() => setIsAiOpen(false)}
          referenceDate={referenceDate}
          referenceTime={referenceTime}
          onTasksUpdate={handleTasksUpdate}
          pendingContext={pendingContext}
          onContextConsumed={() => setPendingContext([])}
        />
      )}
      <button
        type="button"
        className={`ai-float-button ${isAiOpen ? 'active' : ''}`}
        style={aiButtonPosition ? { left: aiButtonPosition.left, top: aiButtonPosition.top, right: 'auto', bottom: 'auto' } : undefined}
        onPointerDown={handleAiButtonPointerDown}
        onPointerMove={handleAiButtonPointerMove}
        onPointerUp={handleAiButtonPointerUp}
        onPointerCancel={handleAiButtonPointerUp}
        onClick={handleAiButtonClick}
        aria-label={isAiOpen ? 'Hide Chroniyam AI chat' : 'Open Chroniyam AI chat'}
        title={isAiOpen ? 'Hide Chroniyam AI chat' : 'Open Chroniyam AI chat'}
      >
        <img src="/tictactoe-icon.svg" alt="" aria-hidden="true" />
        <span>{isAiOpen ? 'Hide AI' : 'Ask AI'}</span>
      </button>
      {isHelpOpen && <HelpCarousel onClose={() => setIsHelpOpen(false)} />}
    </div>
  )
}

export default App
