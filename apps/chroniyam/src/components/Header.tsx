import type { Theme, TimeWindow, Task } from '../types/quadrant'
import { formatHours } from '../utils/hoursCalculator'
import { calculateCurrentHours, getWeekDates, DAILY_LIMIT } from '../utils/hoursAllocationEngine'
import Tooltip from './Tooltip'

type HeaderProps = {
  title: string
  theme: Theme
  onToggleTheme: () => void
  timeWindow?: TimeWindow
  onFinalizePlan?: () => void
  onPreviousWeek?: () => void
  onNextWeek?: () => void
  canGoPrevious?: boolean
  canGoNext?: boolean
  currentWeekLabel?: string
  onCopyWeek?: () => void
  onPasteWeek?: () => void
  canCopyWeek?: boolean
  canPasteWeek?: boolean
  tasks?: Task[]
}

const Header = ({ title, theme, onToggleTheme, timeWindow, onFinalizePlan, onPreviousWeek, onNextWeek, canGoPrevious, canGoNext, currentWeekLabel, onCopyWeek, onPasteWeek, canCopyWeek, canPasteWeek, tasks = [] }: HeaderProps) => {
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'
  
  // Week navigation is shown when we have week controls
  const showWeekNavigation = timeWindow && onPreviousWeek && onNextWeek

  const allocatedHours = timeWindow?.allocatedHours || 0
  const totalHours = timeWindow?.totalHours || 56
  const progressPercentage = totalHours > 0 ? (allocatedHours / totalHours) * 100 : 0
  
  // Calculate daily hours allocation
  const dailyHours = timeWindow ? calculateCurrentHours(tasks, timeWindow.hoursPerDay || DAILY_LIMIT) : {}
  const weekDates = timeWindow ? getWeekDates(timeWindow.startDate) : []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  
  const formatDateRange = (startString: string, endString: string) => {
    const start = new Date(startString)
    const end = new Date(endString)
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const startDay = start.getDate()
    const endDay = end.getDate()
    
    if (startDay === endDay) {
      return `${startMonth} ${startDay}`
    }
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}`
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`
  }

  return (
    <header className="matrix-nav" aria-label="Application header">
      <div className="brand" style={{ paddingTop: showWeekNavigation ? '30px' : '15px' }}>
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="ChroNiyam Logo" className="brand-logo" />
        <div>
          <p className="brand-title">{title}</p>
        </div>
      </div>
      <div className="theme-toggle-wrapper" style={{ paddingTop: showWeekNavigation ? '30px' : '15px' }}>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-pressed={isDark}
          aria-label={label}
        >
          {isDark ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <div>
          <p className="theme-label-text">Theme</p>
        </div>
      </div>
      {timeWindow && (
        <div className="hours-tracker-container">
          <div className="hours-tracker">
            {/* Week navigation above progress bar */}
            {onPreviousWeek && onNextWeek && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                <button
                  type="button"
                  onClick={onPreviousWeek}
                  disabled={!canGoPrevious}
                  aria-label="Previous week"
                  style={{ 
                    background: 'none',
                    border: 'none',
                    cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                    opacity: canGoPrevious ? 1 : 0.3,
                    fontSize: '0.75rem',
                    padding: '0.25rem',
                    color: 'var(--text)'
                  }}
                >
                  ←
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                  {currentWeekLabel || formatDateRange(timeWindow.startDate, timeWindow.endDate)}
                </span>
                <button
                  type="button"
                  onClick={onNextWeek}
                  disabled={!canGoNext}
                  aria-label="Next week"
                  style={{ 
                    background: 'none',
                    border: 'none',
                    cursor: canGoNext ? 'pointer' : 'not-allowed',
                    opacity: canGoNext ? 1 : 0.3,
                    fontSize: '0.75rem',
                    padding: '0.25rem',
                    color: 'var(--text)'
                  }}
                >
                  →
                </button>
              </div>
            )}
            
            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <div className="progress-bar-container" style={{ flex: 1, minWidth: '100px' }}>
                <div className="progress-bar-bg" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${Math.min(progressPercentage, 100)}%`, height: '6px' }}
                    aria-valuenow={allocatedHours}
                    aria-valuemin={0}
                    aria-valuemax={totalHours}
                    role="progressbar"
                  />
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                {formatHours(allocatedHours)}/{formatHours(totalHours)}
              </span>
            </div>
            
            {/* Weekdays and buttons all in one row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Weekday indicators */}
              {weekDates.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '0.4rem',
                  fontSize: '0.75rem'
                }}>
                  {weekDates.map((date, index) => {
                    const dateObj = new Date(date)
                    const isPast = dateObj < today
                    const hoursUsed = dailyHours[date] || 0
                    const hoursLimit = timeWindow?.hoursPerDay || DAILY_LIMIT
                    const hoursLeft = isPast ? 0 : Math.max(0, hoursLimit - hoursUsed)
                    
                    return (
                      <div 
                        key={date}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          opacity: isPast ? 0.3 : 1,
                          minWidth: '24px',
                          padding: '0.08rem 0.1rem',
                          borderRadius: '3px',
                          background: hoursLeft === 0 ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                          pointerEvents: isPast ? 'none' : 'auto',
                          cursor: isPast ? 'not-allowed' : 'default'
                        }}
                        title={isPast ? 'Past days cannot be used' : `${hoursLeft}h available`}
                      >
                        <div style={{ fontWeight: '600', fontSize: '0.65rem' }}>
                          {weekdays[index]}
                        </div>
                        <div style={{ 
                          fontSize: '0.6rem',
                          color: hoursLeft === 0 ? 'var(--color-error)' : 'var(--color-text-muted)',
                          fontWeight: '500',
                          lineHeight: '1'
                        }}>
                          {hoursLeft}h
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              
              <div style={{ width: '1px', height: '18px', background: 'var(--border)' }} />
              
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {onCopyWeek && (
                  <Tooltip content={[canCopyWeek ? 'Copy all tasks from this week' : 'No tasks to copy']} show={true} position="bottom">
                    <button 
                      type="button" 
                      className="btn-finalize"
                      onClick={onCopyWeek}
                      disabled={!canCopyWeek}
                      style={{ opacity: canCopyWeek ? 1 : 0.5, cursor: canCopyWeek ? 'pointer' : 'not-allowed' }}
                      aria-label={canCopyWeek ? 'Copy all tasks from this week' : 'No tasks to copy'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </Tooltip>
                )}
                {onPasteWeek && (
                  <Tooltip content={['Paste tasks to this week']} show={canPasteWeek} position="bottom">
                    <button 
                      type="button" 
                      className="btn-finalize"
                      onClick={onPasteWeek}
                      disabled={!canPasteWeek}
                      style={{ opacity: canPasteWeek ? 1 : 0.5, cursor: canPasteWeek ? 'pointer' : 'not-allowed' }}
                      aria-label={canPasteWeek ? 'Paste tasks to this week' : 'Copy a week first'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </Tooltip>
                )}
                {onFinalizePlan && (
                  <Tooltip content={['Show calendar']} show={true} position="bottom">
                    <button 
                      type="button" 
                      className="btn-finalize"
                      onClick={onFinalizePlan}
                      aria-label="Show calendar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
