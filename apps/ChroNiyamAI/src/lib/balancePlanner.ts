import type { BalanceCategory, Quadrant, Task } from '../types'

export const BALANCE_CATEGORY_LABELS: Record<BalanceCategory, string> = {
  work: 'Work',
  exercise: 'Exercise',
  relationships: 'Relationships',
  learning: 'Learning',
  hobbies: 'Hobbies',
  recovery: 'Recovery',
}

const CATEGORY_WEIGHTS: Record<BalanceCategory, number> = {
  work: 42,
  exercise: 10,
  relationships: 15,
  learning: 10,
  hobbies: 8,
  recovery: 15,
}

const addDays = (date: string, amount: number): string => {
  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + amount)
  return next.toISOString().slice(0, 10)
}

const createStarterTask = (category: BalanceCategory, title: string, quadrant: Quadrant, startDate: string, startTime: string, estimatedHours: number): Task => ({
  id: crypto.randomUUID(),
  title,
  quadrant,
  startDate,
  startTime,
  estimatedHours,
  durationSpecified: true,
  startSpecified: true,
  timeSpecified: true,
  completed: false,
  category,
  spanDays: 1,
})

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const toTime = (minutes: number): string => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const roundUpToHalfHour = (minutes: number): number => Math.ceil(minutes / 30) * 30

export const createBalanceStarterTasks = (
  referenceDate: string,
  planningDays: number,
  categories: BalanceCategory[],
  referenceTime: string,
  sleepHours: number,
): Task[] => {
  const selected = categories.length > 0 ? categories : ['work', 'recovery'] as BalanceCategory[]
  const dates = Array.from({ length: planningDays }, (_, index) => addDays(referenceDate, index))
  const tasks: Task[] = []

  if (selected.includes('work')) dates.filter((_, index) => index < 5).forEach((date) => tasks.push(createStarterTask('work', 'Focused work block', 'Schedule', date, '09:00', 3)))
  if (selected.includes('exercise')) dates.filter((_, index) => [1, 3, 5].includes(index)).forEach((date) => tasks.push(createStarterTask('exercise', 'Exercise and movement', 'Schedule', date, '18:00', 1)))
  if (selected.includes('relationships')) dates.filter((_, index) => [2, 5].includes(index)).forEach((date) => tasks.push(createStarterTask('relationships', 'Meaningful social time', 'Schedule', date, '19:30', 1.5)))
  if (selected.includes('learning')) dates.filter((_, index) => [1, 4].includes(index)).forEach((date) => tasks.push(createStarterTask('learning', 'Learning and growth', 'Schedule', date, '17:00', 1.5)))
  if (selected.includes('hobbies')) dates.filter((_, index) => [3, 6].includes(index)).forEach((date) => tasks.push(createStarterTask('hobbies', 'Hobby or creative time', 'Schedule', date, '20:00', 1.5)))
  if (selected.includes('recovery')) [dates[0], dates[dates.length - 1]].forEach((date) => date && tasks.push(createStarterTask('recovery', 'Low-demand recovery time', 'Schedule', date, '21:00', 1.5)))

  // Include explicit examples for the other matrix lanes so the starter board is useful immediately.
  if (selected.includes('work')) {
    tasks.unshift(createStarterTask('work', 'Review urgent work blocker', 'Do First', dates[0], '08:00', 1))
    tasks.push(createStarterTask('work', 'Delegate routine admin', 'Delegate', dates[0], '16:00', 0.5))
  }
  if (selected.includes('recovery')) {
    tasks.push(createStarterTask('recovery', 'Limit low-value scrolling', 'Eliminate', dates[0], '22:30', 0.5))
  }

  const tasksByDate = new Map<string, Task[]>()
  for (const task of tasks) tasksByDate.set(task.startDate, [...(tasksByDate.get(task.startDate) ?? []), task])

  for (const [date, dateTasks] of tasksByDate) {
    const isToday = date === referenceDate
    let cursor = isToday ? Math.max(sleepHours * 60, roundUpToHalfHour(toMinutes(referenceTime) + 30)) : sleepHours * 60
    for (const task of dateTasks.sort((left, right) => toMinutes(left.startTime) - toMinutes(right.startTime))) {
      const preferredStart = toMinutes(task.startTime)
      const start = Math.max(cursor, preferredStart)
      task.startTime = toTime(start)
      cursor = start + Math.round(task.estimatedHours * 60) + 30
    }
  }

  return tasks
}

export const getCategoryTargets = (categories: BalanceCategory[], availableHours: number) => {
  const selected = categories.length > 0 ? categories : ['work', 'recovery'] as BalanceCategory[]
  const totalWeight = selected.reduce((sum, category) => sum + CATEGORY_WEIGHTS[category], 0)

  return selected.map((category) => ({
    category,
    label: BALANCE_CATEGORY_LABELS[category],
    targetHours: (availableHours * CATEGORY_WEIGHTS[category]) / totalWeight,
  }))
}

export const getBalanceQuadrantGuidance = (tasks: Task[], totalCapacity: number) => {
  const hoursByQuadrant: Record<Quadrant, number> = {
    'Do First': 0,
    Schedule: 0,
    Delegate: 0,
    Eliminate: 0,
  }

  for (const task of tasks) hoursByQuadrant[task.quadrant] += Math.max(0, task.estimatedHours)

  const totalPlanned = Object.values(hoursByQuadrant).reduce((sum, hours) => sum + hours, 0)
  const q2Share = totalPlanned === 0 ? 0 : hoursByQuadrant.Schedule / totalPlanned
  const q1Share = totalPlanned === 0 ? 0 : hoursByQuadrant['Do First'] / totalPlanned
  const usedCapacity = totalCapacity === 0 ? 0 : totalPlanned / totalCapacity

  let message = 'Protect Q2 time for important work, health, relationships, and recovery.'
  let tone: 'good' | 'watch' = 'good'
  if (q1Share > 0.35) {
    message = 'Q1 is taking over. Move preventable work into Q2 before it becomes urgent.'
    tone = 'watch'
  } else if (q2Share < 0.45 && totalPlanned > 0) {
    message = 'Create more Q2 space for progress before filling the week with urgent work.'
    tone = 'watch'
  } else if (usedCapacity > 0.85) {
    message = 'Your plan is close to capacity. Keep room for transitions, breaks, and real life.'
    tone = 'watch'
  }

  return { hoursByQuadrant, totalPlanned, q2Share, message, tone }
}
