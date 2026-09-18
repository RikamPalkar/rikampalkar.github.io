import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BALANCE_CATEGORY_LABELS, getBalanceQuadrantGuidance, getCategoryTargets } from '../lib/balancePlanner'
import { downloadCalendarFile } from '../lib/calendarExport'
import { suggestTaskDuration } from '../lib/openai'
import { findEmptySlot, formatTime12, getPlanOverview, getTaskWarning } from '../lib/scheduleValidator'
import type { BalanceCategory, PlanningMode, Quadrant, Task } from '../types'
import { getPlanQuality } from '../lib/planQuality'

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
  theme: 'clay' | 'neo'
  planningMode: PlanningMode
  planningDays: number
  balanceCategories: BalanceCategory[]
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
  onCleanTasks: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  locked: boolean
  onFinalize: () => void
  onStartOver: () => void
}

const getWeekdayAbbr = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return ''
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short' })
}

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  if (!year || !month || !day) return dateStr
  const weekday = getWeekdayAbbr(dateStr)
  return weekday ? `${weekday} ${day}-${month}` : `${day}-${month}`
}

const formatRangeDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-')
  const weekday = getWeekdayAbbr(dateStr)
  return weekday ? `${weekday} ${day}-${month}-${year}` : `${day}-${month}-${year}`
}

type DisplayTask = Task & { repeatCount: number; repeatEndDate: string }

const getDisplayTasks = (tasks: Task[], selectedDate: string): DisplayTask[] => {
  if (selectedDate !== 'all') return tasks.map((task) => ({ ...task, repeatCount: 1, repeatEndDate: task.startDate }))

  const grouped = new Map<string, DisplayTask>()
  for (const task of tasks) {
    const key = `${task.title.trim().toLowerCase()}|${task.category ?? 'other'}|${task.quadrant}`
    const current = grouped.get(key)
    if (!current) {
      grouped.set(key, { ...task, repeatCount: 1, repeatEndDate: task.startDate })
      continue
    }
    current.repeatCount += 1
    current.repeatEndDate = task.startDate > current.repeatEndDate ? task.startDate : current.repeatEndDate
    current.estimatedHours += task.estimatedHours
    current.completed = current.completed && task.completed
  }
  return [...grouped.values()]
}

const RightPanel = ({
  theme,
  planningMode,
  planningDays,
  balanceCategories,
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
  onCleanTasks,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  locked,
  onFinalize,
  onStartOver,
}: RightPanelProps) => {
  const [dragOverQuadrant, setDragOverQuadrant] = useState<Quadrant | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingPosition, setEditingPosition] = useState<{ top: number; left: number; placement: 'overlap' } | null>(null)
  const [aiFillingTaskId, setAiFillingTaskId] = useState<string | null>(null)
  const [aiFillError, setAiFillError] = useState('')
  const [selectedDate, setSelectedDate] = useState('all')

  useEffect(() => {
    if (selectedDate !== 'all' && !rangeDates.includes(selectedDate)) setSelectedDate('all')
  }, [rangeDates, selectedDate])

  const warningsByTask = new Map(tasks.map((task) => [task.id, task.completed ? null : getTaskWarning(task, tasks, sleepHours, sleepOverriddenDates, referenceDate, referenceTime)]))
  const activeWarningCount = [...warningsByTask.values()].filter(Boolean).length
  const allConfirmed = tasks.length > 0 && tasks.every((task) => task.completed || (task.durationSpecified && task.startSpecified))
  const overview = getPlanOverview(tasks, sleepHours, sleepOverriddenDates, rangeDates)
  const balanceTargets = planningMode === 'balance' ? getCategoryTargets(balanceCategories, overview.totalCapacity) : []
  const balanceGuidance = planningMode === 'balance' ? getBalanceQuadrantGuidance(tasks, overview.totalCapacity) : null
  const balanceReady = planningMode !== 'balance' || (balanceGuidance?.tone === 'good' && !overview.isOverCapacity)
  const canFinalize = allConfirmed && activeWarningCount === 0 && balanceReady
  const planQuality = getPlanQuality({ tasks, totalCapacity: overview.totalCapacity, balanceMode: planningMode === 'balance' })
  const completedTaskCount = tasks.filter((task) => task.completed).length
  const completionPercent = tasks.length === 0 ? 0 : Math.round((completedTaskCount / tasks.length) * 100)
  const visibleTasks = selectedDate === 'all' ? tasks : tasks.filter((task) => task.startDate === selectedDate)
  const displayTasks = getDisplayTasks(visibleTasks, selectedDate)
  const quadrantHours = QUADRANT_INFO.map((quadrant) => ({
    ...quadrant,
    hours: tasks
      .filter((task) => task.quadrant === quadrant.key)
      .reduce((total, task) => total + Math.max(0, task.estimatedHours), 0),
  }))

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
            {formatRangeDate(rangeDates[0])} → {formatRangeDate(rangeDates[rangeDates.length - 1])}, 11:59 PM · {planningMode === 'balance' ? 'Balance Mode protects Q2 time' : 'building live as you talk with Ask AI'}
          </p>
        </div>

        <div className="reference-config">
          <label>
            <span>View</span>
            <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="date-filter" aria-label="Filter tasks by date">
              <option value="all">All dates</option>
              {rangeDates.map((date) => <option key={date} value={date}>{formatRangeDate(date)}</option>)}
            </select>
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
          <div className="plan-actions">
            <button type="button" className="history-btn" onClick={onUndo} disabled={!canUndo} aria-label="Undo last change" title="Undo last change">↶</button>
            <button type="button" className="history-btn" onClick={onRedo} disabled={!canRedo} aria-label="Redo last change" title="Redo last change">↷</button>
            <button type="button" className="clean-tasks-btn" onClick={onCleanTasks} disabled={tasks.length === 0}>Clean</button>
            <button type="button" className="start-over-btn" onClick={onStartOver}>Start Over</button>
          </div>
        </div>
      </header>

      {locked && <div className="plan-locked-banner">Plan finalized</div>}

      {tasks.length > 0 && (
        <div className="plan-overview-row">
          <section className="plan-quality" aria-label="Plan quality">
            <div><strong>{planQuality.score}</strong><span>Plan score</span></div>
            <div><strong>{planQuality.capacityUsage.toFixed(0)}%</strong><span>Capacity</span></div>
            <div><strong>{planQuality.q2Percentage.toFixed(0)}%</strong><span>Q2 time</span></div>
            <div><strong>{planQuality.recoveryTime.toFixed(1)}h</strong><span>Recovery</span></div>
            <div><strong>{planQuality.unscheduledTasks + planQuality.conflictCount}</strong><span>Issues</span></div>
          </section>
          <section className={`plan-summary ${overview.isOverCapacity ? 'over' : ''} ${completionPercent === 100 ? 'complete' : ''}`} aria-label="Plan summary">
            <div className="plan-summary-capacity">
              <strong>{overview.totalAllocated.toFixed(1)}h</strong>
              <span>of {overview.totalCapacity.toFixed(1)}h / {planningDays}d</span>
              {overview.isOverCapacity && <small>Over capacity by {Math.abs(overview.remaining).toFixed(1)}h</small>}
            </div>
            <div className="plan-summary-balance">
              {quadrantHours.map((quadrant) => (
                <div className="summary-quadrant" key={quadrant.key} title={`${quadrant.label}: ${quadrant.hours.toFixed(1)}h of ${overview.totalCapacity.toFixed(1)}h available`}>
                  <span className={`balance-dot ${quadrant.className}`} />
                  <span>{quadrant.hours.toFixed(1)}h / {overview.totalCapacity.toFixed(1)}h</span>
                  <div className="summary-bar-track"><span className={`balance-bar-fill ${quadrant.className}`} style={{ width: `${Math.min(100, (quadrant.hours / Math.max(overview.totalCapacity, 1)) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="plan-summary-progress" title={`${completedTaskCount} of ${tasks.length} tasks complete`}>
              <strong>{completionPercent}%</strong>
              <span>{completedTaskCount}/{tasks.length} done</span>
              <div className="summary-progress-track"><span style={{ width: `${completionPercent}%` }} /></div>
            </div>
          </section>
        </div>
      )}

      {planningMode === 'balance' && (
        <section className={`balance-guide ${balanceGuidance?.tone === 'watch' ? 'watch' : ''}`} aria-labelledby="balance-guide-title">
          <div className="balance-guide-heading">
            <div>
              <h2 id="balance-guide-title">Balance Mode</h2>
              <p>Recommended room for your selected areas</p>
            </div>
            <strong>Q2 first</strong>
          </div>
          <div className="balance-category-targets">
            {balanceTargets.map((target) => (
              <span key={target.category}>{target.label} <b>{target.targetHours.toFixed(1)}h</b></span>
            ))}
          </div>
          <p className="balance-guide-message">{balanceGuidance?.message || 'Protect Q2 time for important work, health, relationships, and recovery.'}</p>
        </section>
      )}

      {tasks.length === 0 ? (
        <div className="right-panel-empty">Open Ask AI below to describe your tasks and build your plan.</div>
      ) : visibleTasks.length === 0 ? (
        <div className="right-panel-empty">No tasks planned for {formatRangeDate(selectedDate)}.</div>
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
                {displayTasks.filter((task) => task.quadrant === quadrant.key).sort((left, right) => Number(left.completed) - Number(right.completed)).map((task) => {
                  const isEditing = editingTaskId === task.id
                  const isAllDatesView = selectedDate === 'all'
                  const needsInput = !isAllDatesView && (!task.durationSpecified || !task.startSpecified)
                  const warning = isAllDatesView ? null : getTaskWarning(task, tasks, sleepHours, sleepOverriddenDates, referenceDate, referenceTime)
                  const shortWarning = warning ? SHORT_WARNING_LABEL[warning.type] : null

                  const dateInvalid = !task.startSpecified || warning?.type === 'day-overloaded'
                  const timeInvalid = !task.timeSpecified || warning?.type === 'slot-suggested' || warning?.type === 'time-conflict' || warning?.type === 'past-time'
                  const hoursInvalid = !task.durationSpecified || warning?.type === 'invalid-hours' || warning?.type === 'multi-day-suggested' || warning?.type === 'day-overloaded'

                  const note = (
                    <div
                      key={task.id}
                      className={`${theme === 'neo' ? 'theme-neo' : 'theme-clay'} ${quadrant.className} sticky-note-wrapper ${isEditing ? `editing popover-${editingPosition?.placement ?? 'overlap'}` : ''}`}
                      style={isEditing && editingPosition ? { top: editingPosition.top, left: editingPosition.left } : undefined}
                    >
                      <div
                        className={`sticky-note ${needsInput ? 'needs-input' : ''} ${warning ? 'has-warning' : ''}`}
                        style={{ '--note-rotate': `${getNoteRotation(task.id)}deg` } as React.CSSProperties}
                        data-task-title={task.title}
                        draggable={!locked && !isEditing}
                        onDragStart={(event) => event.dataTransfer.setData('text/plain', task.id)}
                        onClick={(event) => {
                          if (locked) return
                          const bounds = event.currentTarget.getBoundingClientRect()
                          const popupWidth = Math.min(560, window.innerWidth - 32)
                          const left = Math.max(16, Math.min(bounds.left, window.innerWidth - popupWidth - 16))
                          const top = Math.max(16, Math.min(bounds.top, window.innerHeight - 360))
                          setEditingPosition({
                            top,
                            left,
                            placement: 'overlap',
                          })
                          setEditingTaskId(task.id)
                        }}
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
                              <button
                                type="button"
                                className="sticky-note-close-inline"
                                onClick={() => setEditingTaskId(null)}
                                aria-label="Close editor"
                              >
                                ×
                              </button>
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
                            <label className="sticky-note-edit-field task-category-field">
                              <span>Area</span>
                              <select
                                value={task.category ?? 'other'}
                                onChange={(event) => onUpdateTask(task.id, { category: event.target.value as Task['category'] })}
                              >
                                <option value="other">Other</option>
                                {Object.entries(BALANCE_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                              </select>
                            </label>

                            {warning ? (
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
                                    Skip sleep on {formatRangeDate(warning.date)}
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
                            ) : null}

                            {aiFillError && aiFillingTaskId === null && <div className="note-error"><p>{aiFillError}</p></div>}
                            <div className="sticky-note-edit-actions">
                              <button
                                type="button"
                                className="sticky-note-ai"
                                onClick={() => void handleAiFill(task)}
                                disabled={aiFillingTaskId !== null}
                              >
                                {aiFillingTaskId === task.id ? 'Planning…' : 'AI Fill'}
                              </button>

                              <div className="sticky-note-save-actions">
                                {!locked && (
                                  <button
                                    type="button"
                                    className="sticky-note-delete"
                                    onClick={() => {
                                      setEditingTaskId(null)
                                      onRemoveTask(task.id)
                                    }}
                                  >
                                    Delete
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="sticky-note-done"
                                  onClick={() => {
                                    onUpdateTask(task.id, { durationSpecified: true, startSpecified: true, timeSpecified: true })
                                    setEditingTaskId(null)
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="sticky-note-title-row">
                              <input
                                type="checkbox"
                                className="task-complete-checkbox"
                                checked={task.completed === true}
                                onChange={(event) => onUpdateTask(task.id, { completed: event.target.checked })}
                                onClick={(event) => event.stopPropagation()}
                                aria-label={`Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`}
                              />
                              <strong className={`sticky-note-title ${task.completed ? 'completed' : ''}`}>{task.title}</strong>
                            </div>
                            <div className="sticky-note-meta">
                              {selectedDate === 'all' && (
                                <span>{task.repeatCount > 1 ? `${formatDisplayDate(task.startDate)} : ${formatDisplayDate(task.repeatEndDate)}` : formatDisplayDate(task.startDate)}</span>
                              )}
                              <span>{formatTime12(task.startTime)}</span>
                              <span>{task.estimatedHours}h{task.spanDays > 1 ? ` · ${task.spanDays}d` : ''}</span>
                              {task.repeatCount > 1 && <span className="task-repeat-count" aria-label={`${task.repeatCount} repeated days`}>{task.repeatCount}</span>}
                            </div>
                            {task.completed ? (
                              <span className="sticky-note-complete-label">Done</span>
                            ) : (shortWarning || needsInput) ? (
                              <span className="sticky-note-flag">⚠ Needs review</span>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  )

                  return isEditing ? createPortal(note, document.body) : note
                })}
                {displayTasks.filter((task) => task.quadrant === quadrant.key).length === 0 && (
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
              : planningMode === 'balance' && !balanceReady
                ? 'Balance Mode needs more Q2 time and a plan within available capacity before finalizing.'
              : 'Tap the highlighted notes to confirm date and duration.'}
          </span>
        )}
        <div className="plan-footer-actions">
          <button
            type="button"
            className="draft-btn"
            onClick={() => downloadCalendarFile(tasks)}
            disabled={!locked || tasks.length === 0}
            title={locked ? 'Export finalized plan to your calendar' : 'Finalize the plan to enable calendar export'}
          >
            Export Calendar
          </button>
          <button type="button" className="draft-btn primary" onClick={onFinalize} disabled={!canFinalize || locked}>
            {locked ? 'Plan Finalized' : 'Finalize Plan'}
          </button>
        </div>
      </footer>
    </div>
  )
}

export default RightPanel
