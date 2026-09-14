import type { ChatMessage, ConversationResult, Quadrant } from '../types'

const QUADRANTS: Quadrant[] = ['Do First', 'Schedule', 'Delegate', 'Eliminate']

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeTime = (value: string | undefined, fallback: string): string => {
  const match = value?.match(/(\d{1,2}):(\d{2})/)
  if (!match) return fallback
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return fallback
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const durationJsonSchema = {
  name: 'task_duration_suggestion',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      estimatedHours: { type: 'number' },
      reasoning: { type: 'string' },
    },
    required: ['estimatedHours', 'reasoning'],
    additionalProperties: false,
  },
}

const systemPrompt = (referenceDate: string, referenceTime: string, isSarcastic: boolean = false): string => `
You are ChroniyamAI, a ${isSarcastic ? 'witty, dryly sarcastic, and humorously playful' : 'friendly'} conversational planning assistant.

${isSarcastic ? `PERSONALITY INSTRUCTIONS:
- Be witty, sarcastically funny, and teasingly dry in your responses.
- Gently mock the user's task choices, unrealistic durations, or procrastination habits if appropriate, but stay constructive and get the planning done.
- Keep replies short (1-3 sentences max) and text-message style. Never break character.
` : ''}
Your job: have a short natural conversation to collect the user's tasks, then classify each one into the Eisenhower Matrix (Do First / Schedule / Delegate / Eliminate).

For every task you must know:
- title
- when they want to start it (startDate, and startTime if they mention one)
- how long it will take (estimatedHours)

If the user hasn't told you the duration or start date for a task, ask a short, natural follow-up question for exactly that missing detail. Ask about one or two missing things at a time, don't interrogate.

The current date and time is ${referenceDate} ${referenceTime}. Use this as "today" when resolving relative dates like "tomorrow" or "next week". Do NOT ask the user what time of day they want to start a task - if they don't mention a specific time, just set "timeSpecified" to false and leave startTime as the current time; the app will suggest a free time slot on its own.

Some messages in this conversation may come from a "system" role instead of the user - these are automatic notes confirming a value the user already set directly in the app's UI (for example, editing a task's hours or date by hand). Treat those fields as confirmed and true, and never ask about them again.

IMPORTANT: On every single turn, respond with your CURRENT best-known list of every task mentioned so far in "tasks" - not just once at the end. As soon as the user mentions a task, include it right away, even if some fields are still guesses. For any field you are guessing rather than something the user actually said, still fill in a reasonable value, but set the matching "durationSpecified" (for estimatedHours), "startSpecified" (for startDate), or "timeSpecified" (for startTime) flag to false. Once the user actually confirms that field (directly or via a system note), set the flag to true.

Set "done": true once you have nothing left to ask and every task has durationSpecified and startSpecified true and the user seems finished. Otherwise "done": false.

CRITICAL: "reply" must be ONLY a short, natural conversational message (1-3 sentences max), like you're texting a friend. NEVER include markdown, bullet points, numbered lists, or a field-by-field breakdown of tasks (no "Title:", "Start Date:", "Duration Specified:", etc.) in "reply" - the task list is already shown to the user visually in a separate panel, so do not restate it in text.

Respond ONLY with JSON matching the schema.
`

const conversationJsonSchema = {
  name: 'chroniyamai_conversation',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      reply: { type: 'string' },
      done: { type: 'boolean' },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            quadrant: { type: 'string', enum: QUADRANTS },
            startDate: { type: 'string' },
            startTime: { type: 'string' },
            estimatedHours: { type: 'number' },
            durationSpecified: { type: 'boolean' },
            startSpecified: { type: 'boolean' },
            timeSpecified: { type: 'boolean' },
          },
          required: ['title', 'quadrant', 'startDate', 'startTime', 'estimatedHours', 'durationSpecified', 'startSpecified', 'timeSpecified'],
          additionalProperties: false,
        },
      },
    },
    required: ['reply', 'done', 'tasks'],
    additionalProperties: false,
  },
}

export const continueConversation = async (
  history: ChatMessage[],
  referenceDate: string = formatDate(new Date()),
  referenceTime: string = new Date().toTimeString().slice(0, 5),
  isSarcastic: boolean = false,
): Promise<ConversationResult> => {
  const clientKey = import.meta.env.VITE_OPENAI_API_KEY
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

  if (clientKey && clientKey !== 'your-openai-api-key') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt(referenceDate, referenceTime, isSarcastic) },
          ...history,
        ],
        temperature: 0.5,
        response_format: { type: 'json_schema', json_schema: conversationJsonSchema },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as ConversationResult

    return {
      reply: parsed.reply || '',
      done: parsed.done === true,
      tasks: Array.isArray(parsed.tasks)
        ? parsed.tasks.map((task) => ({
            ...task,
            title: task.title?.trim() || 'Untitled task',
            startDate: task.startDate || referenceDate,
            startTime: normalizeTime(task.startTime, referenceTime),
            estimatedHours: Number(task.estimatedHours) > 0 ? Number(task.estimatedHours) : 1,
            id: crypto.randomUUID(),
            durationSpecified: task.durationSpecified === true,
            startSpecified: task.startSpecified === true,
            timeSpecified: task.timeSpecified === true,
            spanDays: 1,
          }))
        : [],
    }
  }

  // Serverless Proxy route
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'continue-conversation',
      messages: history,
      referenceDate,
      referenceTime,
      isSarcastic,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Proxy request failed with status ${response.status}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(content) as ConversationResult

  return {
    reply: parsed.reply || '',
    done: parsed.done === true,
    tasks: Array.isArray(parsed.tasks)
      ? parsed.tasks.map((task) => ({
          ...task,
          title: task.title?.trim() || 'Untitled task',
          startDate: task.startDate || referenceDate,
          startTime: normalizeTime(task.startTime, referenceTime),
          estimatedHours: Number(task.estimatedHours) > 0 ? Number(task.estimatedHours) : 1,
          id: crypto.randomUUID(),
          durationSpecified: task.durationSpecified === true,
          startSpecified: task.startSpecified === true,
          timeSpecified: task.timeSpecified === true,
          spanDays: 1,
        }))
      : [],
  }
}

export const suggestTaskDuration = async (title: string, currentHours: number): Promise<number> => {
  const clientKey = import.meta.env.VITE_OPENAI_API_KEY
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

  if (clientKey && clientKey !== 'your-openai-api-key') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: `Estimate a realistic focused-work duration in hours for this task. Use practical planning judgment, not an extreme maximum. Task: ${title}. Current estimate: ${currentHours || 'not specified'} hours. Return only the requested JSON.`,
        }],
        temperature: 0.2,
        response_format: { type: 'json_schema', json_schema: durationJsonSchema },
      }),
    })

    if (!response.ok) throw new Error('AI duration suggestion failed.')
    const data = await response.json()
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content ?? '{}') as { estimatedHours?: number }
    const hours = Number(parsed.estimatedHours)
    if (!Number.isFinite(hours) || hours <= 0) throw new Error('AI returned an invalid duration.')
    return Math.min(hours, 24)
  }

  // Serverless Proxy route
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'suggest-duration',
      title,
      currentHours,
    }),
  })

  if (!response.ok) throw new Error('AI duration suggestion via proxy failed.')
  const data = await response.json()
  const parsed = JSON.parse(data?.choices?.[0]?.message?.content ?? '{}') as { estimatedHours?: number }
  const hours = Number(parsed.estimatedHours)
  if (!Number.isFinite(hours) || hours <= 0) throw new Error('AI returned an invalid duration.')
  return Math.min(hours, 24)
}
