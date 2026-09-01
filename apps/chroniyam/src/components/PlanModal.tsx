import { useEffect, useMemo, useState } from 'react'
import type { TimeWindow } from '../types/quadrant'

const getNextMonday = (from: Date) => {
  const date = new Date(from)
  const day = date.getDay() // 0 Sun ... 6 Sat
  const diff = ((8 - day) % 7) || 7 // always at least 1 day ahead
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]
}

const getSundayFromStart = (startIso: string) => {
  const start = new Date(startIso)
  const sunday = new Date(start)
  sunday.setDate(start.getDate() + 6)
  return sunday.toISOString().split('T')[0]
}

type PlanModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (timeWindow: TimeWindow) => void
  currentPlan?: TimeWindow
  existingPlans?: TimeWindow[]
}

const PlanModal = ({ isOpen, onClose, onSave, currentPlan, existingPlans = [] }: PlanModalProps) => {
  const [planMode, setPlanMode] = useState<'current' | 'future'>('current')
  const [hoursPerDay, setHoursPerDay] = useState<number | ''>(currentPlan?.hoursPerDay || 8)
  const [startFromTomorrow, setStartFromTomorrow] = useState(false)
  const [todayHours, setTodayHours] = useState<number | ''>(() => {
    const now = new Date()
    const hoursLeft = 24 - now.getHours() - (now.getMinutes() / 60)
    const rounded = Math.floor(hoursLeft * 2) / 2 // Round down to nearest 0.5
    return Math.max(0, rounded)
  })
  const [futureStartDate, setFutureStartDate] = useState(() => getNextMonday(new Date()))

  const isWeekOverlappingCurrentPlan = (startIso: string, endIso: string) => {
    const start = new Date(startIso)
    const end = new Date(endIso)
    
    return existingPlans.some((plan) => {
      const plannedStart = new Date(plan.startDate)
      const plannedEnd = new Date(plan.endDate)
      return start <= plannedEnd && end >= plannedStart
    })
  }

  const futureWeekOptions = useMemo(() => {
    const options: { start: string; end: string; isPlanned: boolean }[] = []
    let cursor = new Date()
    for (let i = 0; i < 4; i += 1) {
      const startIso = getNextMonday(cursor)
      const endIso = getSundayFromStart(startIso)
      const isPlanned = isWeekOverlappingCurrentPlan(startIso, endIso)
      options.push({ start: startIso, end: endIso, isPlanned })
      const nextCursor = new Date(startIso)
      nextCursor.setDate(nextCursor.getDate() + 7)
      cursor = nextCursor
    }
    return options
  }, [existingPlans, currentPlan])

  const ensureFutureStartIsAvailable = () => {
    const firstAvailable = futureWeekOptions.find((o) => !o.isPlanned)
    if (firstAvailable) {
      setFutureStartDate(firstAvailable.start)
    }
  }

  useEffect(() => {
    if (planMode === 'future') {
      ensureFutureStartIsAvailable()
      if (startFromTomorrow) setStartFromTomorrow(false)
    }
  }, [planMode, futureWeekOptions])

  const getStartDate = () => {
    if (planMode === 'future') return futureStartDate
    const today = new Date()
    if (startFromTomorrow) {
      today.setDate(today.getDate() + 1)
    }
    return today.toISOString().split('T')[0]
  }

  const getNumericHoursPerDay = () => (hoursPerDay === '' ? 0 : hoursPerDay)
  const getNumericTodayHours = () => (todayHours === '' ? 0 : todayHours)

  const getRemainingHoursToday = () => {
    const now = new Date()
    const hoursLeft = 24 - now.getHours() - (now.getMinutes() / 60)
    const rounded = Math.floor(hoursLeft * 2) / 2
    return Math.max(0, rounded)
  }

  const showStartDateOption = () => {
    if (planMode === 'future') return false
    const remaining = getRemainingHoursToday()
    return getNumericHoursPerDay() > remaining
  }

  const getUpcomingSunday = () => {
    const start = new Date(getStartDate())
    const dayOfWeek = start.getDay()
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const sunday = new Date(start)
    sunday.setDate(start.getDate() + daysUntilSunday)
    return sunday.toISOString().split('T')[0]
  }

  const getDays = () => {
    if (planMode === 'future') return 7
    const start = new Date(getStartDate())
    const end = new Date(getUpcomingSunday())
    const diffMs = end.getTime() - start.getTime()
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
  }

  const getEndDate = () => {
    if (planMode === 'future') return getSundayFromStart(futureStartDate)
    return getUpcomingSunday()
  }

  const getTotalHours = () => {
    const days = getDays()
    const daily = getNumericHoursPerDay()
    if (planMode === 'future') return days * daily
    if (startFromTomorrow) return days * daily
    const remaining = getRemainingHoursToday()
    if (daily > remaining) {
      return getNumericTodayHours() + ((days - 1) * daily)
    }
    return days * daily
  }

  const days = getDays()
  const totalHours = getTotalHours()
  const startDateStr = getStartDate()
  const endDateStr = getEndDate()

  const showPlanned =
    existingPlans.length > 0 ||
    currentPlan ||
    isWeekOverlappingCurrentPlan(startDateStr, endDateStr)

  const plannedWeekLabel = useMemo(() => {
    if (existingPlans.length === 0) return ''
    const sorted = [...existingPlans].sort((a, b) => a.startDate.localeCompare(b.startDate))

    const start = new Date(startDateStr)
    const end = new Date(endDateStr)

    // Exact match first (editing existing week)
    const exactIndex = sorted.findIndex(
      (plan) => plan.startDate === startDateStr && plan.endDate === endDateStr
    )
    if (exactIndex >= 0) return `Week ${exactIndex + 1}`

    // Any overlapping planned week
    const overlapIndex = sorted.findIndex((plan) => {
      const plannedStart = new Date(plan.startDate)
      const plannedEnd = new Date(plan.endDate)
      return start <= plannedEnd && end >= plannedStart
    })
    if (overlapIndex >= 0) return `Week ${overlapIndex + 1}`

    return ''
  }, [existingPlans, startDateStr, endDateStr])

  const handleSave = () => {
    const numericHoursPerDay = getNumericHoursPerDay()
    const plan: TimeWindow = {
      startDate: startDateStr,
      endDate: endDateStr,
      days,
      hoursPerDay: numericHoursPerDay,
      totalHours,
      allocatedHours: currentPlan?.allocatedHours ?? 0,
    }

    onSave(plan)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal plan-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Plan Your Time Window</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-form">
          <div className="field">
            <label className="field-label">Plan For</label>
            <div className="window-type-selector">
              <button
                type="button"
                className={`btn ${planMode === 'current' ? 'primary' : 'secondary'}`}
                onClick={() => setPlanMode('current')}
                title="Plan the rest of this week"
              >
                This Week
              </button>
              <button
                type="button"
                className={`btn ${planMode === 'future' ? 'primary' : 'secondary'}`}
                onClick={() => setPlanMode('future')}
                title="Plan an upcoming Monday-Sunday week"
              >
                Future Week
              </button>
            </div>
          </div>

          {showPlanned && plannedWeekLabel && (
            <div className="field-hint" style={{ marginTop: '0.5rem', marginBottom: '0.5rem', color: '#22c55e', fontWeight: 600 }}>
              {plannedWeekLabel} is already planned.
            </div>
          )}

          {planMode === 'future' ? (
            <div className="field-row plan-date-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="field">
                <label className="field-label">Choose Week (Mon-Sun)</label>
                <select
                  value={futureStartDate}
                  onChange={(e) => setFutureStartDate(e.target.value)}
                  style={{ padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)', width: '100%' }}
                >
                  {futureWeekOptions.map((option) => {
                    const label = `${new Date(option.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(option.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${option.isPlanned ? ' (planned)' : ''}`
                    return (
                      <option key={option.start} value={option.start}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="field">
                <label className="field-label">Daily Hours</label>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={hoursPerDay === '' ? '' : hoursPerDay}
                  style={{ height: '2.5rem' }}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') {
                      setHoursPerDay('')
                      return
                    }
                    const val = parseFloat(raw)
                    if (Number.isNaN(val)) return
                    setHoursPerDay(Math.min(24, Math.max(0.5, val)))
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="field-row plan-date-row">
              <div className="field">
                <label className="field-label">Daily Hours</label>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={hoursPerDay === '' ? '' : hoursPerDay}
                  style={{ height: '2.5rem' }}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') {
                      setHoursPerDay('')
                      return
                    }
                    const val = parseFloat(raw)
                    if (Number.isNaN(val)) return
                    setHoursPerDay(Math.min(24, Math.max(0.5, val)))
                  }}
                />
              </div>
            </div>
          )}

          {planMode === 'current' && showStartDateOption() && (
            <>
              <div className="field-hint error" style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                Only {getRemainingHoursToday()}h remaining today. Choose to include today or start tomorrow.
              </div>

              <div className="field-row field-row-equal">
                <div className="field">
                  <label className="field-label">Start Date</label>
                  <div className="toggle-switch">
                    <button
                      type="button"
                      className={`toggle-option ${!startFromTomorrow ? 'active' : ''}`}
                      onClick={() => setStartFromTomorrow(false)}
                      title={`Include today with ${getRemainingHoursToday()}h remaining`}
                    >
                      Include Today
                    </button>
                    <button
                      type="button"
                      className={`toggle-option ${startFromTomorrow ? 'active' : ''}`}
                      onClick={() => setStartFromTomorrow(true)}
                      title="Start planning from tomorrow"
                    >
                      Start Tomorrow
                    </button>
                  </div>
                </div>

                {!startFromTomorrow ? (
                  <div className="field">
                    <label className="field-label">Hours for Today</label>
                    <input
                      type="number"
                      min="0.5"
                      max={getRemainingHoursToday()}
                      step="0.5"
                      value={todayHours === '' ? '' : todayHours}
                      style={{ height: '2.5rem' }}
                      onChange={(e) => {
                        const raw = e.target.value
                        if (raw === '') {
                          setTodayHours('')
                          return
                        }
                        const val = parseFloat(raw)
                        if (Number.isNaN(val)) return
                        const max = getRemainingHoursToday()
                        setTodayHours(Math.min(max, Math.max(0.5, val)))
                      }}
                    />
                  </div>
                ) : (
                  <div className="field field-spacer"></div>
                )}
              </div>

              {!startFromTomorrow && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginTop: '0.5rem' }}>
                  <div className="field-hint">{getRemainingHoursToday()}h remaining today</div>
                  <div></div>
                </div>
              )}
            </>
          )}

          <div className="plan-summary">
            <div className="summary-inline" style={{ marginBottom: '0.5rem' }}>
              <span className="summary-part">
                <span className="summary-label">Starts</span>
                <span className="summary-value start-date">
                  {planMode === 'future'
                    ? new Date(startDateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : startFromTomorrow
                      ? 'Tomorrow'
                      : 'Today'}
                </span>
              </span>
              <span className="summary-separator">•</span>
              <span className="summary-part">
                <span className="summary-label">Ends</span>
                <span className="summary-value">{new Date(endDateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </span>
            </div>
            <div className="summary-inline">
              {planMode === 'current' && showStartDateOption() && !startFromTomorrow ? (
                <>
                  <span className="summary-part">
                    <span className="summary-label">Today: {getNumericTodayHours()}h</span>
                  </span>
                  <span className="summary-separator">•</span>
                  <span className="summary-part">
                    <span className="summary-label">{days - 1} {days - 1 === 1 ? 'day' : 'days'}</span>
                    <span className="summary-value">× {getNumericHoursPerDay()}h</span>
                  </span>
                </>
              ) : (
                <span className="summary-part">
                  <span className="summary-label">{days} {days === 1 ? 'day' : 'days'}</span>
                  <span className="summary-value">× {getNumericHoursPerDay()}h</span>
                </span>
              )}
              <span className="summary-separator">•</span>
              <span className="summary-part highlight">
                <span className="summary-value">{totalHours}h total</span>
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn primary" onClick={handleSave} title="Save this time window plan">
            Save Plan
          </button>
          <button type="button" className="btn secondary" onClick={onClose} title="Cancel and close">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanModal
