import type { Task, TimeWindow } from '../types/quadrant'

type TimeWindowish = Partial<TimeWindow> & { startDate: string; endDate: string; hoursPerDay: number }

/**
 * Round hours to 1 decimal place to avoid floating-point precision issues
 */
const roundHours = (hours: number): number => {
  return Math.round(hours * 10) / 10
}

/**
 * Check if hours is greater than or equal to another value (with tolerance)
 */
const hoursGreaterOrEqual = (a: number, b: number): boolean => {
  return a > b - 0.001
}

/**
 * Calculate remaining hours for each day in the time window
 * This is the source of truth for all capacity calculations
 */
export const getRemainingHoursByDay = (
  allTasks: Task[],
  timeWindow: TimeWindowish
): Map<string, number> => {
  const remainingHours = new Map<string, number>()

  // Initialize all days with full capacity
  const startDate = new Date(timeWindow.startDate)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(timeWindow.endDate)
  endDate.setHours(0, 0, 0, 0)

  for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
    const dateStr = current.toISOString().split('T')[0]
    remainingHours.set(dateStr, timeWindow.hoursPerDay)
  }

  // Subtract hours for each task
  allTasks.forEach((task) => {
    const taskStartDate = new Date(task.startDate)
    taskStartDate.setHours(0, 0, 0, 0)
    const taskEndDate = new Date(task.dueDate)
    taskEndDate.setHours(0, 0, 0, 0)
    const taskDays = getDateRange(taskStartDate, taskEndDate)
    const numDays = taskDays.length
    
    // Distribute hours evenly, putting any remainder on the last day
    const baseHoursPerDay = roundHours(task.estimatedHours / numDays)
    const remainder = roundHours(task.estimatedHours - (baseHoursPerDay * numDays))

    taskDays.forEach((dateStr, index) => {
      const current = remainingHours.get(dateStr) || timeWindow.hoursPerDay
      const hoursToSubtract = index === numDays - 1 ? baseHoursPerDay + remainder : baseHoursPerDay
      remainingHours.set(dateStr, Math.max(0, roundHours(current - hoursToSubtract)))
    })
  })

  return remainingHours
}

/**
 * Get all dates in a range (inclusive)
 */
const getDateRange = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * Check if we can allocate a certain number of hours across a date range
 * Returns { canAllocate: boolean, totalAvailable: number, shortfall: number }
 */
export const canAllocateHours = (
  taskStartDate: string,
  taskDueDate: string,
  estimatedHours: number,
  allTasks: Task[],
  timeWindow: TimeWindowish
): { canAllocate: boolean; totalAvailable: number; shortfall: number } => {
  const remainingByDay = getRemainingHoursByDay(allTasks, timeWindow)
  const taskDays = getDateRange(new Date(taskStartDate), new Date(taskDueDate))

  const totalAvailable = roundHours(taskDays.reduce((sum, dateStr) => {
    return sum + (remainingByDay.get(dateStr) || 0)
  }, 0))

  const shortfall = roundHours(Math.max(0, estimatedHours - totalAvailable))
  const canAllocate = hoursGreaterOrEqual(totalAvailable, estimatedHours)

  return { canAllocate, totalAvailable, shortfall }
}

/**
 * Get remaining hours for a specific date
 */
export const getRemainingHoursForDate = (
  date: string,
  allTasks: Task[],
  timeWindow: TimeWindowish
): number => {
  const remainingByDay = getRemainingHoursByDay(allTasks, timeWindow)
  return remainingByDay.get(date) || 0
}

/**
 * Get remaining hours across a date range (useful for multi-day task validation)
 */
export const getRemainingHoursForRange = (
  startDate: string,
  endDate: string,
  allTasks: Task[],
  timeWindow: TimeWindowish
): number => {
  const remainingByDay = getRemainingHoursByDay(allTasks, timeWindow)
  const taskDays = getDateRange(new Date(startDate), new Date(endDate))

  return roundHours(taskDays.reduce((sum, dateStr) => {
    return sum + (remainingByDay.get(dateStr) || 0)
  }, 0))
}

/**
 * Get capacity breakdown for a date range
 * Shows how many hours are available on each day
 */
export const getCapacityBreakdown = (
  startDate: string,
  endDate: string,
  allTasks: Task[],
  timeWindow: TimeWindowish
): Record<string, number> => {
  const remainingByDay = getRemainingHoursByDay(allTasks, timeWindow)
  const taskDays = getDateRange(new Date(startDate), new Date(endDate))
  const breakdown: Record<string, number> = {}

  taskDays.forEach((dateStr) => {
    breakdown[dateStr] = remainingByDay.get(dateStr) || 0
  })

  return breakdown
}

/**
 * Format a date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
/**
 * Format hours without decimals if no minutes
 * Examples: 2h, 2.5h, 8h (not 2.0h, 8.0h)
 */
export const formatHours = (hours: number): string => {
  if (hours === Math.floor(hours)) {
    return `${Math.floor(hours)}h`
  }
  return `${hours.toFixed(1)}h`
}