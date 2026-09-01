export type Theme = 'light' | 'dark'

export type Quadrant = {
  title: string
  description: string
  className: string
  tooltip: string[]
}

export type QuadrantKey = Quadrant['title']

export type TimeWindow = {
  startDate: string
  endDate: string
  days: number
  hoursPerDay: number
  totalHours: number
  allocatedHours: number
}

export type Task = {
  id: string
  title: string
  description?: string
  quadrant: QuadrantKey
  estimatedHours: number
  startDate: string
  dueDate: string
  completed: boolean
  isRecurring?: boolean
}
