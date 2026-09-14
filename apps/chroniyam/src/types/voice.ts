import type { QuadrantKey } from './quadrant'

export type VoiceTaskSuggestion = {
  title: string
  quadrant: QuadrantKey
  startDate: string
  dueDate: string
  estimatedHours: number
  reasoning: string
  durationSpecified: boolean
  startSpecified: boolean
}

export type VoiceParseResponse = {
  tasks: VoiceTaskSuggestion[]
}
