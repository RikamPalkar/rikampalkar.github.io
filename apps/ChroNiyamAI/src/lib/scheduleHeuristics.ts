import type { Task } from '../types'

type ScheduleOptions = {
  referenceDate: string
  referenceTime: string
}

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

const toTime = (minutes: number): string => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const roundToHalfHour = (minutes: number): number => Math.ceil(minutes / 30) * 30

const priority: Record<Task['quadrant'], number> = {
  'Do First': 0,
  Schedule: 1,
  Delegate: 2,
  Eliminate: 3,
}

const isDeepTask = (task: Task): boolean => task.category === 'work' || task.category === 'learning' || task.estimatedHours >= 2

export const applyScheduleHeuristics = (tasks: Task[], options: ScheduleOptions): Task[] => {
  const byDate = new Map<string, Task[]>()
  for (const task of tasks) byDate.set(task.startDate, [...(byDate.get(task.startDate) ?? []), task])

  const scheduled: Task[] = []
  for (const [date, dateTasks] of byDate) {
    const dayStart = date === options.referenceDate ? roundToHalfHour(toMinutes(options.referenceTime) + 30) : 9 * 60
    let cursor = Math.max(dayStart, 9 * 60)
    const ordered = [...dateTasks].sort((left, right) => {
      if (priority[left.quadrant] !== priority[right.quadrant]) return priority[left.quadrant] - priority[right.quadrant]
      if (isDeepTask(left) !== isDeepTask(right)) return Number(isDeepTask(right)) - Number(isDeepTask(left))
      if (left.category !== right.category) return String(left.category).localeCompare(String(right.category))
      return toMinutes(left.startTime) - toMinutes(right.startTime)
    })

    for (const task of ordered) {
      if (task.completed) {
        scheduled.push(task)
        continue
      }
      const start = Math.max(cursor, toMinutes(task.startTime), isDeepTask(task) ? 9 * 60 : 0)
      const duration = Math.max(30, Math.round(task.estimatedHours * 60))
      scheduled.push({ ...task, startTime: toTime(start), timeSpecified: true })
      cursor = start + duration + 30
    }
  }

  return scheduled
}
