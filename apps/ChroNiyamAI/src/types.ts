export type Quadrant = 'Do First' | 'Schedule' | 'Delegate' | 'Eliminate'

export type PlanningMode = 'day' | 'week' | 'month' | 'custom'

export type Task = {
  id: string
  title: string
  quadrant: Quadrant
  startDate: string
  startTime: string
  estimatedHours: number
  durationSpecified: boolean
  startSpecified: boolean
  timeSpecified: boolean
  // how many consecutive days this task is spread across, once the user accepts a multi-day suggestion
  spanDays: number
}

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type ConversationResult = {
  reply: string
  done: boolean
  tasks: Task[]
}
