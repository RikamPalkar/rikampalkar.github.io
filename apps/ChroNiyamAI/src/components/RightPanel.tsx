import { useState } from 'react'
import { suggestTaskDuration } from '../lib/openai'
import { findEmptySlot, formatTime12, getPlanOverview, getTaskWarning } from '../lib/scheduleValidator'
import type { PlanningMode, Quadrant, Task } from '../types'

const QUADRANT_INFO: { key: Quadrant; label: string; hint: string; className: string }[] = [
  { key: 'Do First', label: 'Do First', hint: 'Urgent & Important', className: 'quadrant-urgent-important' },
  { key: 'Schedule', label: 'Schedule', hint: 'Important, Not Urgent', className: 'quadrant-not-urgent-important' },
  { key: 'Delegate', label: 'Delegate', hint: 'Urgent, Not Important', className: 'quadrant-urgent-not-important' },
  { key: 'Eliminate', label: 'Eliminate', hint: 'Not Urgent, Not Important', className: 'quadrant-not-urgent-not-important' },
]

// stable per-note tilt so the board doesn't jitter on re-render, but still looks hand-placed
const getNoteRotation = (id: string): number => {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ((Math.abs(hash) % 7) - 3) * 0.9
}

const SHORT_WARNING_LABEL: Record<string, string> = {
  'invalid-hours': 'Invalid hours',
  'past-time': 'Time has passed',
  'multi-day-suggested': 'Spans days?',
  'day-overloaded': 'Day overloaded',
  'slot-suggested': 'No time set',
  'time-conflict': 'Time conflict',
}

type RightPanelProps = {
  planningMode: PlanningMode
  planningDays: number
  rangeDates: string[]
  referenceDate: string
  referenceTime: string
  sleepHours: number
  onSleepHoursChange: (value: number) => void
  sleepOverriddenDates: Set<string>
  onOverrideSleep: (date: string) => void
  tasks: Task[]
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onRemoveTask: (id: string) => void
  locked: boolean
  onFinalize: () => void
  onStartOver: () => void
}

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  if (!year || !month || !day) return dateStr
  return `${month}/${day}`
}

const formatRangeDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const RightPanel = ({
  planningMode,
  planningDays,
  rangeDates,
  referenceDate,
  referenceTime,
  sleepHours,
  onSleepHoursChange,
  sleepOverriddenDates,
  onOverrideSleep,
  tasks,
  onUpdateTask,
  onRemoveTask,
  locked,
  onFinalize,
  onStartOver,
}: RightPanelProps) => {
  const [dragOverQuadrant, setDragOverQuadrant] = useState<Quadrant | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [aiFillingTaskId, setAiFillingTaskId] = useState<string | null>(null)
  const [aiFillError, setAiFillError] = useState('')

  const warningsByTask = new Map(tasks.map((task) => [task.id, getTaskWarning(task, tasks, sleepHours, sleepOverriddenDates, referenceDate, referenceTime)]))
  const activeWarningCount = [...warningsByTask.values()].filter(Boolean).length
  const allConfirmed = tasks.length > 0 && tasks.every((task) => task.durationSpecified && task.startSpecified)
  const canFinalize = allConfirmed && activeWarningCount === 0

  const overview = getPlanOverview(tasks, sleepHours, sleepOverriddenDates, rangeDates)

  const handleDrop = (quadrant: Quadrant) => (event: React.DragEvent) => {
    event.preventDefault()
    setDragOverQuadrant(null)
    const taskId = event.dataTransfer.getData('text/plain')
    if (taskId) onUpdateTask(taskId, { quadrant })
  }

  const handleAiFill = async (task: Task) => {
    setAiFillingTaskId(task.id)
    setAiFillError('')

    try {
      const estimatedHours = await suggestTaskDuration(task.title, task.estimatedHours)
      const proposedTask = { ...task, estimatedHours, timeSpecified: false }
      const suggestedTime = findEmptySlot(
        proposedTask,
        tasks,
        sleepHours,
        sleepOverriddenDates,
        referenceDate,
        referenceTime,
      )

      onUpdateTask(task.id, {
        startDate: task.startDate || referenceDate,
        startTime: suggestedTime || task.startTime,
        estimatedHours,
        startSpecified: true,
        timeSpecified: Boolean(suggestedTime),
        durationSpecified: true,
      })

      if (!suggestedTime) {
        setAiFillError('AI found the duration, but no free slot is available. Move another task or choose a different time.')
      }
    } catch (error) {
      setAiFillError(error instanceof Error ? error.message : 'AI Fill failed.')
    } finally {
      setAiFillingTaskId(null)
    }
  }

  return (
    <div className="right-panel">
      <header className="right-panel-header">
        <div>
          <h1>
            Your Plan <span className="planning-mode-chip">{planningMode}</span>
          </h1>
          <p className="right-panel-subtitle">
            {formatRangeDate(rangeDates[0])} → {formatRangeDate(rangeDates[rangeDates.length - 1])}, 11:59 PM · building live as you talk on the left
          </p>
        </div>

        <div className="reference-config">
          <label>
            <span>Today's date</span>
            <input type="date" value={referenceDate} disabled className="readonly-field" />
          </label>
          <label>
            <span>Current time</span>
            <input type="time" value={referenceTime} disabled className="readonly-field" />
          </label>
          <label>
            <span>Sleep hours/day</span>
            <input
              type="number"
              min="0"
              max="24"
              value={sleepHours}
              onChange={(event) => onSleepHoursChange(Math.min(24, Math.max(0, Number(event.target.value) || 0)))}
              disabled={locked}
            />
          </label>
          <button type="button" className="start-over-btn" onClick={onStartOver}>
            Start Over
          </button>
        </div>
      </header>

      {locked && <div className="plan-locked-banner">✅ Plan finalized</div>}

      {tasks.length > 0 && (
        <div className={`plan-overview ${overview.isOverCapacity ? 'over' : ''}`}>
          <span>
            {overview.totalAllocated.toFixed(1)}h planned of {overview.totalCapacity.toFixed(1)}h available over {planningDays} day{planningDays === 1 ? '' : 's'}
          </span>
          {overview.isOverCapacity && (
            <span className="plan-overview-warning">
              Over capacity by {Math.abs(overview.remaining).toFixed(1)}h - extend your planning window, skip sleep on busy days, or trim tasks.
            </span>
          )}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="right-panel-empty">Start talking on the left and your tasks will show up here.</div>
      ) : (
        <div className="matrix-grid">
          {QUADRANT_INFO.map((quadrant) => (
            <div
              key={quadrant.key}
              className={`matrix-quadrant ${quadrant.className} ${dragOverQuadrant === quadrant.key ? 'drag-over' : ''}`}
              onDragOver={(event) => {
                event.preventDefault()
                setDragOverQuadrant(quadrant.key)
              }}
              onDragLeave={() => setDragOverQuadrant((current) => (current === quadrant.key ? null : current))}
              onDrop={handleDrop(quadrant.key)}
            >
              <div className="matrix-quadrant-header">
                <h2><span className="quadrant-pin" aria-hidden="true" />{quadrant.label}</h2>
                <span>{quadrant.hint}</span>
              </div>
              <div className="matrix-quadrant-tasks">
                {tasks.filter((task) => task.quadrant === quadrant.key).map((task) => {
                  const isEditing = editingTaskId === task.id
                  const needsInput = !task.durationSpecified || !task.startSpecified
                  const warning = getTaskWarning(task, tasks, sleepHours, sleepOverriddenDates, referenceDate, referenceTime)
                  const shortWarning = warning ? SHORT_WARNING_LABEL[warning.type] : null

                  const dateInvalid = !task.startSpecified || warning?.type === 'day-overloaded'
                  const timeInvalid = !task.timeSpecified || warning?.type === 'slot-suggested' || warning?.type === 'time-conflict' || warning?.type === 'past-time'
                  const hoursInvalid = !task.durationSpecified || warning?.type === 'invalid-hours' || warning?.type === 'multi-day-suggested' || warning?.type === 'day-overloaded'

                  return (
                    <div key={task.id} className={`sticky-note-wrapper ${isEditing ? 'editing' : ''}`}>
                      <div
                        className={`sticky-note ${needsInput ? 'needs-input' : ''} ${warning ? 'has-warning' : ''}`}
                        style={{ '--note-rotate': `${getNoteRotation(task.id)}deg` } as React.CSSProperties}
                        draggable={!locked && !isEditing}
                        onDragStart={(event) => event.dataTransfer.setData('text/plain', task.id)}
                        onClick={() => !locked && setEditingTaskId(task.id)}
                      >
                        {!locked && !isEditing && (
                          <button
                            type="button"
                            className="sticky-note-remove"
                            onClick={(event) => {
                              event.stopPropagation()
                              onRemoveTask(task.id)
                            }}
                            aria-label="Remove task"
                          >
                            ×
                          </button>
                        )}

                        {isEditing ? (
                          <div className="sticky-note-edit" onClick={(event) => event.stopPropagation()}>
                            <div className="sticky-note-edit-header">
                              <input
                                className="sticky-note-title-input"
                                value={task.title}
                                onChange={(event) => onUpdateTask(task.id, { title: event.target.value })}
                                autoFocus
                              />
                              {!locked && (
                                <button
                                  type="button"
                                  className="sticky-note-remove-inline"
                                  onClick={() => onRemoveTask(task.id)}
                                  aria-label="Remove task"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            <div className="sticky-note-edit-row">
                              <label className={`sticky-note-edit-field ${dateInvalid ? 'invalid' : ''}`}>
                                <span>Date</span>
                                <input
                                  type="date"
                                  value={task.startDate}
                                  onChange={(event) => onUpdateTask(task.id, { startDate: event.target.value, startSpecified: true })}
                                />
                              </label>
                              <label className={`sticky-note-edit-field ${timeInvalid ? 'invalid' : ''}`}>
                                <span>Time</span>
                                <input
                                  type="time"
                                  value={task.startTime}
                                  onChange={(event) => onUpdateTask(task.id, { startTime: event.target.value, timeSpecified: true })}
                                />
                              </label>
                              <label className={`sticky-note-edit-field hours ${hoursInvalid ? 'invalid' : ''}`}>
                                <span>Hrs</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="0.5"
                                  value={task.estimatedHours}
                                  onChange={(event) => onUpdateTask(task.id, { estimatedHours: Number(event.target.value) || 0, durationSpecified: true })}
                                />
                              </label>
                            </div>

                            {warning && (
                              <div className="note-error">
                                <p>{warning.message}</p>
                                {warning.type === 'slot-suggested' && (
                                  <button
                                    type="button"
                                    className="warning-action"
                                    onClick={() => onUpdateTask(task.id, { startTime: warning.suggestedTime, timeSpecified: true })}
                                  >
                                    Use {formatTime12(warning.suggestedTime)}
                                  </button>
                                )}
                                {warning.type === 'multi-day-suggested' && (
                                  <button
                                    type="button"
                                    className="warning-action"
                                    onClick={() => onUpdateTask(task.id, { spanDays: warning.days })}
                                  >
                                    Spread across {warning.days} days
                                  </button>
                                )}
                                {warning.type === 'day-overloaded' && !sleepOverriddenDates.has(warning.date) && (
                                  <button type="button" className="warning-action" onClick={() => onOverrideSleep(warning.date)}>
                                    Skip sleep on {warning.date}
                                  </button>
                                )}
                                {warning.type === 'time-conflict' && warning.suggestedTime && (
                                  <button
                                    type="button"
                                    className="warning-action"
                                    onClick={() => onUpdateTask(task.id, { startTime: warning.suggestedTime as string, timeSpecified: true })}
                                  >
                                    Move to {formatTime12(warning.suggestedTime)}
                                  </button>
                                )}
                              </div>
                            )}

                            {aiFillError && aiFillingTaskId === null && <div className="note-error"><p>{aiFillError}</p></div>}
                            <button
                              type="button"
                              className="sticky-note-ai"
                              onClick={() => void handleAiFill(task)}
                              disabled={aiFillingTaskId !== null}
                            >
                              {aiFillingTaskId === task.id ? 'Planning…' : 'AI Fill'}
                            </button>

                            <button
                              type="button"
                              className="sticky-note-done"
                              onClick={() => {
                                // clicking Done without touching a field means the user accepted the shown default
                                onUpdateTask(task.id, { durationSpecified: true, startSpecified: true, timeSpecified: true })
                                setEditingTaskId(null)
                              }}
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <>
                            <strong className="sticky-note-title">{task.title}</strong>
                            <div className="sticky-note-meta">
                              <span>{formatDisplayDate(task.startDate)}</span>
                              <span>{formatTime12(task.startTime)}</span>
                              <span>{task.estimatedHours}h{task.spanDays > 1 ? ` · ${task.spanDays}d` : ''}</span>
                            </div>
                            {shortWarning && (
                              <span className="sticky-note-flag" title={warning?.message}>⚠ {shortWarning}</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
                {tasks.filter((task) => task.quadrant === quadrant.key).length === 0 && (
                  <p className="matrix-empty">Drop a task here</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="right-panel-footer">
        {!locked && !canFinalize && tasks.length > 0 && (
          <span className="right-panel-hint">
            {activeWarningCount > 0
              ? `Resolve ${activeWarningCount} issue${activeWarningCount === 1 ? '' : 's'} above before finalizing.`
              : 'Tap the highlighted notes to confirm date and duration.'}
          </span>
        )}
        <button type="button" className="draft-btn primary" onClick={onFinalize} disabled={!canFinalize || locked}>
          {locked ? 'Plan Finalized' : 'Finalize Plan'}
        </button>
      </footer>
    </div>
  )
}

export default RightPanel
