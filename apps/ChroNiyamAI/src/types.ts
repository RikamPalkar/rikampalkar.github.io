export type Quadrant = 'Do First' | 'Schedule' | 'Delegate' | 'Eliminate'

export type Task = {
  id: string
  title: string
  quadrant: Quadrant
  startDate: string
  dueDate: string
  estimatedHours: number
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ConversationResult = {
  reply: string
  done: boolean
  tasks: Task[]
}
