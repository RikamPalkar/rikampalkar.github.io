/**
 * Robust Hours Allocation Engine
 * 
 * Manages time allocation across a weekly planning cycle with:
 * - Daily limit: 8 hours per day
 * - Weekly limit: 56 hours per week (7 days × 8)
 * - Multi-day selection support
 * - Real-time capacity calculation
 */

export const DAILY_LIMIT = 8
export const DAYS_IN_WEEK = 7
export const WEEKLY_LIMIT = DAILY_LIMIT * DAYS_IN_WEEK // 56 hours

/**
 * Represents the result of an allocation operation
 */
export type AllocationResult = {
  isValid: boolean
  maxAllowableHours: number
  weeklyRemaining: number
  perDayRemaining: Record<string, number>
  errors: string[]
  warnings: string[]
}

/**
 * Get date string in YYYY-MM-DD format
 * Uses local date components to avoid timezone issues
 */
const getDateStr = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse date string safely without timezone issues
 * Input: 'YYYY-MM-DD'
 * Output: Date object at local midnight
 */
const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Get start of week (Monday) for a given date
 */
export const getWeekStart = (date: Date | string): Date => {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date)
  d.setHours(0, 0, 0, 0)
  
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  
  d.setDate(diff)
  return d
}

/**
 * Get end of week (Sunday) for a given date
 */
export const getWeekEnd = (date: Date | string): Date => {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return end
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
// Note: Not currently used but available for future extensions
// const getDayOfWeek = (dateStr: string): number => {
//   return new Date(dateStr).getDay()
// }

/**
 * Get all dates in a week
 */
export const getWeekDates = (date: Date | string): string[] => {
  const start = getWeekStart(date)
  const dates: string[] = []
  
  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.push(getDateStr(d))
  }
  
  return dates
}

/**
 * Calculate remaining hours for a specific day
 * Returns value between 0 and dailyLimit
 */
export const getRemainingHoursForDay = (
  dateStr: string,
  currentHours: Record<string, number>,
  dailyLimit: number = DAILY_LIMIT
): number => {
  const used = currentHours[dateStr] || 0
  return Math.max(0, dailyLimit - used)
}

/**
 * Calculate total used hours in the week
 */
export const getWeeklyUsedHours = (
  weekDates: string[],
  currentHours: Record<string, number>
): number => {
  return weekDates.reduce((sum, date) => {
    return sum + (currentHours[date] || 0)
  }, 0)
}

/**
 * Get remaining capacity for each day
 */
export const getPerDayCapacity = (
  selectedDates: string[],
  currentHours: Record<string, number>,
  dailyLimit: number = DAILY_LIMIT
): Record<string, number> => {
  const capacity: Record<string, number> = {}
  
  selectedDates.forEach((date) => {
    capacity[date] = getRemainingHoursForDay(date, currentHours, dailyLimit)
  })
  
  return capacity
}

/**
 * Calculate maximum allocatable hours across selected days
 */
export const getMaxAllocatableHours = (
  selectedDates: string[],
  currentHours: Record<string, number>,
  weeklyUsed: number,
  dailyLimit: number = DAILY_LIMIT
): number => {
  // Sum remaining capacity across selected days
  const selectedCapacity = selectedDates.reduce((sum, date) => {
    return sum + getRemainingHoursForDay(date, currentHours, dailyLimit)
  }, 0)
  
  // Cap at weekly remaining
  const weeklyLimit = dailyLimit * DAYS_IN_WEEK
  const weeklyRemaining = weeklyLimit - weeklyUsed
  
  return Math.min(selectedCapacity, weeklyRemaining)
}

/**
 * Validate allocation request
 * Returns comprehensive validation result
 */
export const validateAllocation = (input: {
  selectedDates: string[]
  requestedHours: number
  currentHours: Record<string, number>
  dailyLimit?: number
  existingTaskId?: string
  allTasks?: Array<{ id: string; startDate: string; dueDate: string; estimatedHours: number }>
}): AllocationResult => {
  const {
    selectedDates,
    requestedHours,
    currentHours,
    dailyLimit = DAILY_LIMIT,
    existingTaskId,
    allTasks = []
  } = input

  const errors: string[] = []
  const warnings: string[] = []

  // Validate inputs
  if (!selectedDates || selectedDates.length === 0) {
    errors.push('At least one day must be selected.')
    return {
      isValid: false,
      maxAllowableHours: 0,
      weeklyRemaining: 0,
      perDayRemaining: {},
      errors,
      warnings
    }
  }

  if (requestedHours <= 0) {
    errors.push('Hours must be greater than 0.')
    return {
      isValid: false,
      maxAllowableHours: 0,
      weeklyRemaining: 0,
      perDayRemaining: {},
      errors,
      warnings
    }
  }

  // Get week dates (use first selected date as reference)
  const weekDates = getWeekDates(selectedDates[0])
  
  // Calculate used hours excluding the task being edited
  const adjustedCurrentHours = { ...currentHours }
  if (existingTaskId && allTasks.length > 0) {
    const taskToExclude = allTasks.find((t) => t.id === existingTaskId)
    if (taskToExclude) {
      const taskStartDate = parseDate(taskToExclude.startDate)
      const taskEndDate = parseDate(taskToExclude.dueDate)
      const taskDates = getTaskDates(taskStartDate, taskEndDate)
      
      // Subtract hours sequentially (matching how they were allocated)
      let remainingHours = taskToExclude.estimatedHours
      taskDates.forEach((date) => {
        if (adjustedCurrentHours[date] && remainingHours > 0) {
          const hoursToSubtract = Math.min(remainingHours, adjustedCurrentHours[date])
          adjustedCurrentHours[date] = Math.max(0, adjustedCurrentHours[date] - hoursToSubtract)
          remainingHours -= hoursToSubtract
        }
      })
    }
  }

  // Get per-day capacity
  const perDayRemaining = getPerDayCapacity(selectedDates, adjustedCurrentHours, dailyLimit)
  
  // Check for full days in selection
  const fullDays = selectedDates.filter((date) => perDayRemaining[date] === 0)
  if (fullDays.length > 0) {
    const dayStr = fullDays.length === 1 ? 'day' : 'days'
    warnings.push(`${fullDays.length} ${dayStr} ${fullDays.length === 1 ? 'is' : 'are'} already full (${dailyLimit} hours allocated).`)
  }

  // Calculate weekly capacity
  const weeklyUsed = getWeeklyUsedHours(weekDates, adjustedCurrentHours)
  const weeklyLimit = dailyLimit * DAYS_IN_WEEK
  const weeklyRemaining = weeklyLimit - weeklyUsed

  // Get max allocatable hours
  const maxAllocatable = getMaxAllocatableHours(
    selectedDates,
    adjustedCurrentHours,
    weeklyUsed,
    dailyLimit
  )

  // Validate requested hours
  if (requestedHours > maxAllocatable) {
    const selectedCapacity = selectedDates.reduce((sum, date) => {
      return sum + perDayRemaining[date]
    }, 0)

    if (requestedHours > selectedCapacity) {
      errors.push(
        `Not enough capacity. Requested: ${requestedHours}h, Available: ${selectedCapacity}h`
      )
    } else if (requestedHours > weeklyRemaining) {
      errors.push(
        `Weekly limit exceeded. Requested: ${requestedHours}h, Available this week: ${weeklyRemaining}h`
      )
    }
  }

  return {
    isValid: errors.length === 0,
    maxAllowableHours: maxAllocatable,
    weeklyRemaining,
    perDayRemaining,
    errors,
    warnings
  }
}

/**
 * Helper to get all dates a task spans
 */
function getTaskDates(startDate: Date, endDate: Date): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    dates.push(getDateStr(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * Calculate current hours per day from all tasks
 * Fills each day to maximum (dailyLimit) before moving to next day
 */
export const calculateCurrentHours = (
  tasks: Array<{ startDate: string; dueDate: string; estimatedHours: number; isRecurring?: boolean }>,
  dailyLimit: number = DAILY_LIMIT
): Record<string, number> => {
  const hours: Record<string, number> = {}

  tasks.forEach((task) => {
    const startDate = parseDate(task.startDate)
    const endDate = parseDate(task.dueDate)
    const taskDates = getTaskDates(startDate, endDate)
    
    if (task.isRecurring) {
      // For recurring tasks, add hours to each day in the range
      taskDates.forEach((date) => {
        hours[date] = (hours[date] || 0) + task.estimatedHours
      })
    } else {
      // Fill each day sequentially up to dailyLimit for non-recurring tasks
      let remainingHours = task.estimatedHours
      taskDates.forEach((date) => {
        const currentHours = hours[date] || 0
        const availableInDay = dailyLimit - currentHours
        const hoursToAllocate = Math.min(remainingHours, availableInDay)
        
        if (hoursToAllocate > 0) {
          hours[date] = currentHours + hoursToAllocate
          remainingHours -= hoursToAllocate
        }
      })
    }
  })

  return hours
}

/**
 * Get human-readable week range
 */
export const formatWeekRange = (date: Date | string): string => {
  const start = getWeekStart(date)
  const end = getWeekEnd(date)
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  return `${startStr} - ${endStr}`
}
