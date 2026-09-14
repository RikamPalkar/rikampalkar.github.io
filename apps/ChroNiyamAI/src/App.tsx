import { useEffect, useState } from 'react'
import ChatPanel from './components/ChatPanel'
import PlanningSetup from './components/PlanningSetup'
import RightPanel from './components/RightPanel'
import { stabilizeTaskIds } from './lib/mergeTasks'
import { getDateRange } from './lib/scheduleValidator'
import { clearState, loadState, saveState } from './lib/storage'
import type { PlanningMode, Task } from './types'
import './App.css'

const getCurrentDate = () => new Date().toISOString().slice(0, 10)
const getCurrentTime = () => new Date().toTimeString().slice(0, 5)

function App() {
  const [planningMode, setPlanningMode] = useState<PlanningMode | null>(() => loadState('planningMode', null))
  const [planningDays, setPlanningDays] = useState(() => loadState('planningDays', 7))
  const [referenceDate] = useState(getCurrentDate())
  const [referenceTime] = useState(getCurrentTime())
  const [sleepHours, setSleepHours] = useState(() => loadState('sleepHours', 9))
  const [sleepOverriddenDates, setSleepOverriddenDates] = useState<Set<string>>(
    () => new Set(loadState<string[]>('sleepOverriddenDates', [])),
  )
  const [tasks, setTasks] = useState<Task[]>(() => loadState('tasks', []))
  const [locked, setLocked] = useState(() => loadState('locked', false))
  const [pendingContext, setPendingContext] = useState<string[]>([])

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

  const handleOverrideSleep = (date: string) => {
    setSleepOverriddenDates((prev) => new Set(prev).add(date))
  }

  const handleStartOver = () => {
    for (const key of ['planningMode', 'planningDays', 'sleepHours', 'sleepOverriddenDates', 'tasks', 'locked', 'chatMessages']) {
      clearState(key)
    }
    window.location.reload()
  }

  if (!planningMode) {
    return (
      <PlanningSetup
        onStart={(mode, days) => {
          setPlanningMode(mode)
          setPlanningDays(days)
        }}
      />
    )
  }

  const rangeDates = getDateRange(referenceDate, planningDays)

  return (
    <div className="split-screen">
      <ChatPanel
        referenceDate={referenceDate}
        referenceTime={referenceTime}
        onTasksUpdate={handleTasksUpdate}
        pendingContext={pendingContext}
        onContextConsumed={() => setPendingContext([])}
      />
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
        locked={locked}
        onFinalize={() => setLocked(true)}
        onStartOver={handleStartOver}
      />
    </div>
  )
}

export default App
