import type { Task } from '../types'

const MINUTES_PER_DAY = 24 * 60

export type TaskWarning =
  | { type: 'invalid-hours'; message: string }
  | { type: 'past-time'; message: string }
  | { type: 'multi-day-suggested'; message: string; days: number }
  | { type: 'day-overloaded'; message: string; date: string; totalHours: number; capacityHours: number }
  | { type: 'slot-suggested'; message: string; suggestedTime: string }
  | { type: 'time-conflict'; message: string; conflictingTaskId: string; suggestedTime: string | null }

// tolerant of malformed values (e.g. a stray ISO datetime) - returns null instead of NaN
const timeToMinutes = (time: string): number | null => {
  const match = time?.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

// storage/inputs stay in 24h HH:MM; use this only for user-facing text
export const formatTime12 = (time: string): string => {
  const match = time?.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return time
  const minutes = match[2]
  let hours = Number(match[1])
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${period}`
}

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export const addDays = (dateStr: string, days: number): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const getDateRange = (startDate: string, spanDays: number): string[] =>
  Array.from({ length: spanDays }, (_, i) => addDays(startDate, i))

// hours this task contributes to a single day's capacity, spread evenly across its span
const perDayHours = (task: Task): number => task.estimatedHours / Math.max(task.spanDays, 1)

export const getWakingHours = (sleepHours: number): number => 24 - sleepHours

export const getDailyAllocatedHours = (
  tasks: Task[],
  sleepHours: number,
  sleepOverriddenDates: Set<string>,
): Record<string, { total: number; capacity: number }> => {
  const byDate: Record<string, number> = {}

  for (const task of tasks) {
    for (const date of getDateRange(task.startDate, task.spanDays)) {
      byDate[date] = (byDate[date] || 0) + perDayHours(task)
    }
  }

  const result: Record<string, { total: number; capacity: number }> = {}
  for (const [date, total] of Object.entries(byDate)) {
    const capacity = sleepOverriddenDates.has(date) ? 24 : getWakingHours(sleepHours)
    result[date] = { total, capacity }
  }
  return result
}

// aggregate capacity vs demand across the user's whole selected planning window (day/week/month/custom)
export type PlanOverview = {
  totalCapacity: number
  totalAllocated: number
  remaining: number
  isOverCapacity: boolean
}

const formatDateForMessage = (date: string): string => {
  const [year, month, day] = date.split('-')
  return `${day}-${month}-${year}`
}

export const getPlanOverview = (
  tasks: Task[],
  sleepHours: number,
  sleepOverriddenDates: Set<string>,
  rangeDates: string[],
): PlanOverview => {
  const rangeSet = new Set(rangeDates)
  const daily = getDailyAllocatedHours(tasks, sleepHours, sleepOverriddenDates)

  let totalCapacity = 0
  let totalAllocated = 0

  for (const date of rangeDates) {
    totalCapacity += sleepOverriddenDates.has(date) ? 24 : getWakingHours(sleepHours)
  }

  for (const [date, info] of Object.entries(daily)) {
    if (rangeSet.has(date)) totalAllocated += info.total
  }

  return {
    totalCapacity,
    totalAllocated,
    remaining: totalCapacity - totalAllocated,
    isOverCapacity: totalAllocated > totalCapacity,
  }
}

export const findEmptySlot = (
  task: Task,
  allTasks: Task[],
  sleepHours: number,
  sleepOverriddenDates: Set<string>,
  referenceDate: string,
  referenceTime: string,
): string | null => {
  const durationMinutes = Math.round(task.estimatedHours * 60)
  if (durationMinutes <= 0 || durationMinutes > MINUTES_PER_DAY) return null

  const overridden = sleepOverriddenDates.has(task.startDate)
  let windowStart = overridden ? 0 : sleepHours * 60

  // never suggest a time that has already passed today
  if (task.startDate === referenceDate) {
    const nowMinutes = timeToMinutes(referenceTime)
    if (nowMinutes !== null) windowStart = Math.max(windowStart, nowMinutes)
  }

  const windowEnd = MINUTES_PER_DAY

  const busy = allTasks
    .filter((t) => t.id !== task.id && t.timeSpecified && t.spanDays === 1 && t.startDate === task.startDate)
    .map((t) => {
      const start = timeToMinutes(t.startTime)
      return start === null ? null : { start, end: start + t.estimatedHours * 60 }
    })
    .filter((block): block is { start: number; end: number } => block !== null)
    .sort((a, b) => a.start - b.start)

  let cursor = windowStart
  for (const block of busy) {
    if (block.start - cursor >= durationMinutes) {
      return minutesToTime(cursor)
    }
    cursor = Math.max(cursor, block.end)
  }

  if (windowEnd - cursor >= durationMinutes) {
    return minutesToTime(cursor)
  }

  return null
}

// two tasks on the same day both claiming an explicit time that overlaps
const findTimeConflict = (task: Task, allTasks: Task[]): Task | null => {
  const start = timeToMinutes(task.startTime)
  if (start === null) return null
  const end = start + task.estimatedHours * 60

  return (
    allTasks.find((other) => {
      if (other.id === task.id || !other.timeSpecified || other.spanDays !== 1 || other.startDate !== task.startDate) return false
      const otherStart = timeToMinutes(other.startTime)
      if (otherStart === null) return false
      const otherEnd = otherStart + other.estimatedHours * 60
      return start < otherEnd && otherStart < end
    }) ?? null
  )
}

export const getTaskWarning = (
  task: Task,
  allTasks: Task[],
  sleepHours: number,
  sleepOverriddenDates: Set<string>,
  referenceDate: string,
  referenceTime: string,
): TaskWarning | null => {
  if (task.estimatedHours > 24) {
    return {
      type: 'invalid-hours',
      message: `A single day only has 24 hours, so "${task.title}" can't take ${task.estimatedHours}h in one day.`,
    }
  }

  if (task.timeSpecified && task.startDate === referenceDate) {
    const startMinutes = timeToMinutes(task.startTime)
    const nowMinutes = timeToMinutes(referenceTime)
    if (startMinutes !== null && nowMinutes !== null && startMinutes < nowMinutes) {
      return {
        type: 'past-time',
        message: `${formatTime12(task.startTime)} on ${formatDateForMessage(task.startDate)} has already passed — it's ${formatTime12(referenceTime)} now. Pick a later time.`,
      }
    }
  }

  const waking = getWakingHours(sleepHours)

  if (task.spanDays === 1 && task.estimatedHours > waking) {
    const neededDays = Math.ceil(task.estimatedHours / waking)
    return {
      type: 'multi-day-suggested',
      message: `"${task.title}" needs ${task.estimatedHours}h, more than your ${waking}h waking day (24h − ${sleepHours}h sleep). Stretch it across ${neededDays} days starting ${formatDateForMessage(task.startDate)}?`,
      days: neededDays,
    }
  }

  const perDay = perDayHours(task)
  for (const date of getDateRange(task.startDate, task.spanDays)) {
    const overridden = sleepOverriddenDates.has(date)
    const capacity = overridden ? 24 : waking

    const others = allTasks
      .filter((t) => t.id !== task.id)
      .filter((t) => getDateRange(t.startDate, t.spanDays).includes(date))
      .reduce((sum, t) => sum + perDayHours(t), 0)

    const total = others + perDay
    if (total > capacity) {
      return {
        type: 'day-overloaded',
        date,
        totalHours: total,
        capacityHours: capacity,
        message: overridden
          ? `${date} would have ${total.toFixed(1)}h planned, more than 24h even with sleep skipped.`
          : `${date} already has ${others.toFixed(1)}h planned. Adding this makes ${total.toFixed(1)}h, more than your ${capacity}h waking day (24h − ${sleepHours}h sleep). Skip sleep for this day, or move it elsewhere.`,
      }
    }
  }

  if (!task.timeSpecified) {
    const suggested = findEmptySlot(task, allTasks, sleepHours, sleepOverriddenDates, referenceDate, referenceTime)
    if (suggested) {
      return {
        type: 'slot-suggested',
        suggestedTime: suggested,
        message: `No time given for "${task.title}". I see an empty slot at ${formatTime12(suggested)} on ${formatDateForMessage(task.startDate)} — push it there?`,
      }
    }
    return null
  }

  const conflict = findTimeConflict(task, allTasks)
  if (conflict) {
    const suggested = findEmptySlot(task, allTasks, sleepHours, sleepOverriddenDates, referenceDate, referenceTime)
    return {
      type: 'time-conflict',
      conflictingTaskId: conflict.id,
      suggestedTime: suggested,
      message: suggested
        ? `This slot is taken by "${conflict.title}" (${formatTime12(conflict.startTime)}, ${conflict.estimatedHours}h). Move this to ${formatTime12(suggested)}, or update "${conflict.title}" instead.`
        : `This slot is taken by "${conflict.title}" (${formatTime12(conflict.startTime)}, ${conflict.estimatedHours}h). Update this task's time, or move "${conflict.title}" instead.`,
    }
  }

  return null
}
