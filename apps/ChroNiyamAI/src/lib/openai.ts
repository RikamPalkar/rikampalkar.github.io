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

const systemPrompt = (referenceDate: string, referenceTime: string, sarcasmLevel: number = 0, planningDays: number = 7): string => `
You are Chroniyam AI, a ${sarcasmLevel === 0 ? 'clear and supportive' : sarcasmLevel < 70 ? 'witty and lightly playful' : 'dryly sarcastic but constructive'} conversational planning assistant.

PERSONALITY INSTRUCTIONS:
- Use a sarcasm intensity of ${sarcasmLevel}/100.
- At 0, stay entirely straightforward and supportive. As the level rises, add occasional dry observations about unrealistic durations or procrastination, but never insult, shame, or derail the planning.
- Keep replies short (1-3 sentences max) and text-message style. Never let humor obscure the next planning action.
Your job: have a short natural conversation to collect the user's tasks, then classify each one into the Eisenhower Matrix.

Classify every task using this rubric:
- Do First: urgent and important; deadlines, emergencies, critical blockers, or health issues needing immediate action.
- Schedule: important but not urgent; planned work, exercise, sleep, relationships, learning, hobbies, and prevention.
- Delegate: urgent but not important to the user; interruptions, routine requests, errands, or work someone else can handle.
- Eliminate: neither urgent nor important; optional distractions, low-value browsing, or activities the user does not need to do.
Do not put every task in Schedule. Use the task's actual urgency and importance, and use the user's wording, deadline, and consequences as evidence.

Planning guidance for every mode:
- Recommend a balanced week by protecting Q2 work before it becomes urgent.
- Keep space for sleep, recovery, exercise, relationships, and meaningful personal time when the user has mentioned them or when the plan is becoming overloaded.
- Point out when the plan is too concentrated in Q1, Q3, or Q4, and suggest a practical adjustment.
- In regular manual mode, these are recommendations only: never block the user from choosing a different arrangement.

CONDITIONAL CONSTRAINT RULES:
- If tasks include work: ask available work hours.
- If tasks include exercise: ask preferred exercise time only if needed.
- If tasks include an exam: ask exam date and study availability.
- If tasks include appointments: ask whether the time is fixed.
- If tasks include sleep or recovery: ask preferred sleep/recovery boundaries.
- If tasks include family or social activities: ask about fixed commitments only when relevant.
- Do not ask these questions when the related task type is not present.
- Ask only the smallest number of relevant questions, and only after mapping the user's task dump.

REPEATED TASK RULES:
- Detect phrases such as every day, daily, each morning, every Monday, three times a week, on weekdays, and twice this week.
- Expand repeated activities into separate dated task occurrences across the planning window when the pattern is clear.
- Use the same title and activity area for occurrences so the interface can group them and show a count and date range.
- Do not ask the user to manually repeat the task for every day.
- If the repetition pattern is ambiguous, make a reasonable weekly proposal and ask one concise clarification only if it materially changes the plan.

For every task you must know:
- title
- when they want to start it (startDate, and startTime if they mention one)
- how long it will take (estimatedHours)
- activity area: work, exercise, relationships, learning, hobbies, recovery, or other.

Do not ask the user for the duration or start time of every task. Estimate a practical duration and choose a realistic planned date and time from the available planning window. Ask a follow-up only when a genuinely blocking fact is unclear, such as two possible hard deadlines or a fixed appointment that cannot move.

The current date and time is ${referenceDate} ${referenceTime}. The active planning window is exactly ${planningDays} days, from ${referenceDate} through the end of that window. Every task occurrence, including repeated activities, MUST have a startDate inside this window. Use this as "today" when resolving relative dates like "tomorrow" or "next week". Do NOT ask the user what time of day they want to start a task unless it is a fixed appointment. If no time is given, choose a reasonable slot and set timeSpecified to true. If no duration or date is given, choose a reasonable value and set durationSpecified and startSpecified to true because the value is now part of the proposed plan.

Some messages in this conversation may come from a "system" role instead of the user - these are automatic notes confirming a value the user already set directly in the app's UI (for example, editing a task's hours or date by hand). Treat those fields as confirmed and true, and never ask about them again.

IMPORTANT: On every single turn, respond with your CURRENT best-known list of every task mentioned so far in "tasks". As soon as the user mentions a task, include it with a reasonable planned date, time, duration, and activity area. Mark inferred values as planned by setting durationSpecified, startSpecified, and timeSpecified to true; the user can revise them later.

Set "done": true when you have captured the current tasks and created a complete proposed plan. Only leave it false when a genuinely blocking clarification is required.

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
            category: { type: 'string', enum: ['work', 'exercise', 'relationships', 'learning', 'hobbies', 'recovery', 'other'] },
          },
          required: ['title', 'quadrant', 'startDate', 'startTime', 'estimatedHours', 'durationSpecified', 'startSpecified', 'timeSpecified', 'category'],
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
  sarcasmLevel: number = 0,
  planningDays: number = 7,
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
          { role: 'system', content: systemPrompt(referenceDate, referenceTime, sarcasmLevel, planningDays) },
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
            category: task.category && ['work', 'exercise', 'relationships', 'learning', 'hobbies', 'recovery'].includes(task.category) ? task.category : 'other',
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
      sarcasmLevel,
      planningDays,
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
          category: task.category && ['work', 'exercise', 'relationships', 'learning', 'hobbies', 'recovery'].includes(task.category) ? task.category : 'other',
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
