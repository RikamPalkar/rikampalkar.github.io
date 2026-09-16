import type { Task } from '../types'

// keep the same id for a task across turns (matched by title). Trust the AI's latest
// date/time/hours - it's told about manual UI edits via context notes, so it can also
// legitimately correct a value the user changes their mind about mid-conversation.
// Only quadrant (drag-and-drop) and spanDays (multi-day acceptance) are UI-only actions
// the AI never learns about, so those stay locked to whatever the user last set.
export const stabilizeTaskIds = (previous: Task[], next: Task[]): Task[] => {
  const usedPreviousIds = new Set<string>()

  return next.map((task) => {
    const match = previous.find(
      (prev) => !usedPreviousIds.has(prev.id) && prev.title.trim().toLowerCase() === task.title.trim().toLowerCase(),
    )
    if (!match) return task

    usedPreviousIds.add(match.id)
    return {
      ...task,
      id: match.id,
      quadrant: match.quadrant,
      spanDays: match.spanDays,
      completed: match.completed,
       category: match.category,
    }
  })
}
