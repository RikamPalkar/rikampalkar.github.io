import { useState, useMemo } from 'react'
import type { Task } from '../types/quadrant'

type CalendarViewProps = {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  startDate: string
  endDate: string
  hoursPerDay: number
}

const CalendarView = ({ isOpen, onClose, tasks, startDate, endDate, hoursPerDay }: CalendarViewProps) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)

  // Parse dates safely without timezone issues
  const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const getDateStr = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const start = useMemo(() => parseDate(startDate), [startDate])
  const end = useMemo(() => parseDate(endDate), [endDate])

  // Split date range into weeks (Monday-Sunday)
  const weeks = useMemo(() => {
    const allWeeks: Date[][] = []
    const current = new Date(start)
    
    while (current <= end) {
      const weekDays: Date[] = []
      
      // Get days for this week (up to 7 days or until end date)
      for (let i = 0; i < 7 && current <= end; i++) {
        weekDays.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      
      if (weekDays.length > 0) {
        allWeeks.push(weekDays)
      }
    }
    
    return allWeeks
  }, [start, end])

  // Get current view days based on mode
  const days = useMemo(() => {
    if (viewMode === 'month') {
      // Show all days
      const allDays: Date[] = []
      const current = new Date(start)
      while (current <= end) {
        allDays.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      return allDays
    } else {
      // Show current week only
      return weeks[currentWeekIndex] || []
    }
  }, [viewMode, currentWeekIndex, weeks, start, end])

  if (!isOpen) return null

  const canGoPrevious = currentWeekIndex > 0
  const canGoNext = currentWeekIndex < weeks.length - 1

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentWeekIndex(currentWeekIndex - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      setCurrentWeekIndex(currentWeekIndex + 1)
    }
  }

  // Calculate hours using sequential allocation algorithm
  const allocatedHoursPerDay: Record<string, number> = {}
  const taskAllocationByDate: Record<string, Array<{ task: Task; hours: number; dayIndex: number; totalDays: number }>> = {}

  tasks.forEach((task) => {
    const taskStart = parseDate(task.startDate)
    const taskEnd = parseDate(task.dueDate)
    
    // Get all dates this task spans
    const taskDates: string[] = []
    const taskCurrent = new Date(taskStart)
    while (taskCurrent <= taskEnd) {
      taskDates.push(getDateStr(taskCurrent))
      taskCurrent.setDate(taskCurrent.getDate() + 1)
    }
    
    const totalDays = taskDates.length
    
    if (task.isRecurring) {
      // For recurring tasks, allocate full hours to each day
      taskDates.forEach((date, dayIndex) => {
        const currentHours = allocatedHoursPerDay[date] || 0
        allocatedHoursPerDay[date] = currentHours + task.estimatedHours
        
        if (!taskAllocationByDate[date]) {
          taskAllocationByDate[date] = []
        }
        taskAllocationByDate[date].push({ task, hours: task.estimatedHours, dayIndex: dayIndex + 1, totalDays })
      })
    } else {
      // Fill each day sequentially up to hoursPerDay limit for non-recurring tasks
      let remainingHours = task.estimatedHours
      taskDates.forEach((date, dayIndex) => {
        const currentHours = allocatedHoursPerDay[date] || 0
        const availableInDay = hoursPerDay - currentHours
        const hoursToAllocate = Math.min(remainingHours, availableInDay)
        
        if (hoursToAllocate > 0) {
          allocatedHoursPerDay[date] = currentHours + hoursToAllocate
          remainingHours -= hoursToAllocate
          
          // Track which tasks and hours are on each day
          if (!taskAllocationByDate[date]) {
            taskAllocationByDate[date] = []
          }
          taskAllocationByDate[date].push({ task, hours: hoursToAllocate, dayIndex: dayIndex + 1, totalDays })
        }
      })
    }
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getDateKey = (date: Date) => {
    return getDateStr(date)
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Calendar view">
      <div className="calendar-modal">
        <header className="modal-header">
          <div className="calendar-header-content">
            <div className="calendar-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h2>Calendar</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="toggle-switch" style={{ marginBottom: 0 }}>
                <button
                  type="button"
                  className={`toggle-option ${viewMode === 'week' ? 'active' : ''}`}
                  onClick={() => setViewMode('week')}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                >
                  Week
                </button>
                <button
                  type="button"
                  className={`toggle-option ${viewMode === 'month' ? 'active' : ''}`}
                  onClick={() => setViewMode('month')}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                >
                  Month
                </button>
              </div>
              {viewMode === 'week' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={handlePrevious}
                    disabled={!canGoPrevious}
                    aria-label="Previous week"
                    style={{ opacity: canGoPrevious ? 1 : 0.3 }}
                  >
                    ←
                  </button>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'center' }}>
                    Week {currentWeekIndex + 1} of {weeks.length}
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={handleNext}
                    disabled={!canGoNext}
                    aria-label="Next week"
                    style={{ opacity: canGoNext ? 1 : 0.3 }}
                  >
                    →
                  </button>
                </div>
              )}
              <div className="calendar-subtitle">{hoursPerDay}h/day</div>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="calendar-content">
          <div className="calendar-grid">
            {days.map((day) => {
              const dateKey = getDateKey(day)
              const totalHours = allocatedHoursPerDay[dateKey] || 0
              const dayAllocations = taskAllocationByDate[dateKey] || []

              return (
                <div key={dateKey} className="calendar-day">
                  <div className="calendar-day-header">
                    <div className="calendar-day-name">{formatDate(day)}</div>
                    <div className="calendar-day-hours">{Math.round(totalHours * 10) / 10}h</div>
                  </div>
                  <div className="calendar-day-tasks">
                    {dayAllocations.length === 0 ? (
                      <div className="calendar-no-tasks">No tasks</div>
                    ) : (
                      <>
                        {dayAllocations.map(({ task, hours, dayIndex, totalDays }) => (
                          <div key={task.id} className="calendar-task" title={task.description || task.title}>
                            <div className="calendar-task-row">
                              <span className="calendar-task-title">{task.title}</span>
                              <span className="calendar-task-hours">{Math.round(hours * 10) / 10}h</span>
                            </div>
                            {totalDays > 1 && (
                              <div className="calendar-task-range">
                                Day {dayIndex} of {totalDays}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default CalendarView
