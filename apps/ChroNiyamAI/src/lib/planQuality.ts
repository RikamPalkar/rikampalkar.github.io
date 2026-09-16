import type { Task } from '../types'

type QualityInput = {
  tasks: Task[]
  totalCapacity: number
  balanceMode: boolean
}

export const getPlanQuality = ({ tasks, totalCapacity, balanceMode }: QualityInput) => {
  const activeTasks = tasks.filter((task) => !task.completed)
  const plannedHours = tasks.reduce((sum, task) => sum + Math.max(0, task.estimatedHours), 0)
  const capacityUsage = totalCapacity > 0 ? Math.min(100, (plannedHours / totalCapacity) * 100) : 0
  const q2Hours = tasks.filter((task) => task.quadrant === 'Schedule').reduce((sum, task) => sum + task.estimatedHours, 0)
  const q2Percentage = plannedHours > 0 ? (q2Hours / plannedHours) * 100 : 0
  const unscheduledTasks = activeTasks.filter((task) => !task.startSpecified || !task.durationSpecified).length
  const conflictCount = tasks.length - new Set(tasks.map((task) => `${task.startDate}|${task.startTime}`)).size
  const recoveryTime = tasks.filter((task) => task.category === 'recovery').reduce((sum, task) => sum + task.estimatedHours, 0)
  const deadlineRisk = activeTasks.filter((task) => task.quadrant === 'Do First' || !task.startSpecified).length
  const penalties = Math.min(100, unscheduledTasks * 12 + conflictCount * 15 + deadlineRisk * 4 + (balanceMode && q2Percentage < 45 ? 15 : 0))
  const score = Math.max(0, Math.round(100 - Math.max(0, capacityUsage - 85) * 1.5 - penalties))

  return { score, capacityUsage, q2Percentage, unscheduledTasks, conflictCount, recoveryTime, deadlineRisk }
}