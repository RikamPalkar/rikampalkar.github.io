import { useState, useMemo } from 'react'
import type { QuadrantKey, Task } from '../types/quadrant'
import { validateAllocation, calculateCurrentHours } from '../utils/hoursAllocationEngine'

type TaskModalProps = {
  isOpen: boolean
  quadrants: QuadrantKey[]
  onClose: () => void
  onSave: (task: TaskInput) => void
  initialTask?: Task
  timeWindow?: { startDate: string; endDate: string; hoursPerDay: number; totalHours?: number; allocatedHours?: number; days?: number }
  allTasks?: Task[]
}

export type TaskInput = {
  id?: string
  title: string
  description?: string
  quadrant: QuadrantKey
  estimatedHours: number
  startDate: string
  dueDate: string
  completed: boolean
  isRecurring?: boolean
}

const TaskModal = ({ isOpen, quadrants, onClose, onSave, initialTask, timeWindow, allTasks = [] }: TaskModalProps) => {
  const getDefaultDueDate = () => {
    if (timeWindow) return timeWindow.startDate
    // Use local date to avoid timezone issues
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const emptyTask: TaskInput = {
    title: '',
    description: '',
    quadrant: quadrants[0],
    estimatedHours: 1,
    startDate: getDefaultDueDate(),
    dueDate: getDefaultDueDate(),
    completed: false,
    isRecurring: false,
  }
  
  const [draft, setDraft] = useState<TaskInput>(initialTask ?? emptyTask)
  const [error, setError] = useState<string>('')

  // Compute current hours allocation once per render
  const currentHours = useMemo(() => {
    // When editing a task, exclude it from current hours calculation
    // When adding a new task, include all existing tasks
    const tasksToUse = initialTask 
      ? allTasks.filter((t) => t.id !== initialTask.id)
      : allTasks
    return calculateCurrentHours(tasksToUse, timeWindow?.hoursPerDay || 8)
  }, [allTasks, initialTask, timeWindow?.hoursPerDay])

  // Helper to build date range without timezone issues
  const buildDateRange = (startDateStr: string, endDateStr: string): string[] => {
    const dates: string[] = []
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number)
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number)
    
    const current = new Date(startYear, startMonth - 1, startDay)
    const end = new Date(endYear, endMonth - 1, endDay)
    
    while (current <= end) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      const day = String(current.getDate()).padStart(2, '0')
      dates.push(`${year}-${month}-${day}`)
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const validateTask = (task: TaskInput): string => {
    // Start must be on/before due
    if (new Date(task.dueDate) < new Date(task.startDate)) {
      return 'Due date must be on or after the start date.'
    }

    // Get all dates in range
    const dateRange = buildDateRange(task.startDate, task.dueDate)

    // For recurring tasks, validate each day individually
    if (task.isRecurring) {
      for (const date of dateRange) {
        const result = validateAllocation({
          selectedDates: [date],
          requestedHours: task.estimatedHours,
          currentHours,
          dailyLimit: timeWindow?.hoursPerDay || 8,
        })

        if (!result.isValid && result.errors.length > 0) {
          const dateObj = new Date(date + 'T00:00:00')
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          return `${formattedDate}: ${result.errors[0]}`
        }
      }
    } else {
      // For non-recurring, validate entire date range at once
      const result = validateAllocation({
        selectedDates: dateRange,
        requestedHours: task.estimatedHours,
        currentHours,
        dailyLimit: timeWindow?.hoursPerDay || 8,
      })

      if (!result.isValid && result.errors.length > 0) {
        return result.errors[0]
      }
    }

    return ''
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    
    const validationError = validateTask(draft)
    if (validationError) {
      setError(validationError)
      return
    }
    
    onSave({ ...draft, id: initialTask?.id })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  const formatDateRange = (startString: string, endString: string) => {
    const start = new Date(startString)
    const end = new Date(endString)
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const startDay = start.getDate()
    const endDay = end.getDate()
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}`
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add task">
      <div className="modal">
        <header className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2>{initialTask ? 'Edit Task' : 'Add Task'}</h2>
            {timeWindow && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
                ({formatDateRange(timeWindow.startDate, timeWindow.endDate)})
              </span>
            )}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <label className="field">
            <span className="field-label">Title *</span>
            <input
              name="title"
              required
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Enter task title"
            />
          </label>

          <div className="field-row field-row-equal">
            <label className="field">
              <span className="field-label">Quadrant *</span>
              <select
                name="quadrant"
                value={draft.quadrant}
                onChange={(e) => setDraft({ ...draft, quadrant: e.target.value as QuadrantKey })}
              >
                {quadrants.map((quad) => (
                  <option key={quad} value={quad}>
                    {quad}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">
                <span className="label-full">Estimated Hours *</span>
                <span className="label-short">Est. Hrs *</span>
              </span>
              <div className="field-with-hint">
                <input
                  type="number"
                  name="estimatedHours"
                  required
                  min="0"
                  step="0.5"
                  value={draft.estimatedHours === 0 ? '' : draft.estimatedHours}
                  onChange={(e) => {
                    e.currentTarget.setCustomValidity('')
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                    setDraft({ ...draft, estimatedHours: isNaN(val) ? 0 : val })
                  }}
                  onInvalid={(e) => {
                    const el = e.currentTarget
                    el.setCustomValidity('Please enter a valid number of hours.')
                  }}
                />
              </div>
            </label>
          </div>

          <div className="field-row field-row-equal">
            <label className="field">
              <span className="field-label">Start Date *</span>
              <div className="field-with-hint">
                <input
                  type="date"
                  name="startDate"
                  required
                  value={draft.startDate}
                  onChange={(e) => {
                    const value = e.target.value
                    setDraft((prev) => ({
                      ...prev,
                      startDate: value,
                      dueDate: prev.dueDate < value ? value : prev.dueDate,
                    }))
                  }}
                  min={timeWindow?.startDate}
                  max={timeWindow?.endDate}
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Due Date *</span>
              <input
                type="date"
                name="dueDate"
                required
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                min={draft.startDate}
                max={timeWindow?.endDate}
              />
            </label>
          </div>

          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="isRecurring"
              checked={draft.isRecurring || false}
              onChange={(e) => setDraft({ ...draft, isRecurring: e.target.checked })}
              style={{ width: 'auto', margin: 0 }}
            />
            <span className="field-label" style={{ margin: 0 }}>Recurring</span>
          </label>
        </form>

        <div className="modal-actions">
          <button
            type="button"
            className="btn primary"
            onClick={(e) => {
              const form = e.currentTarget.closest('.modal')?.querySelector('form')
              form?.requestSubmit()
            }}
            title={initialTask ? 'Save changes to task' : 'Add this task'}
          >
            {initialTask ? 'Save Task' : 'Add Task'}
          </button>
          <button type="button" className="btn ghost" onClick={onClose} title="Cancel and close">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskModal
