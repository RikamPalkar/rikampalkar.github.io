import type { ChatMessage, ConversationResult, Quadrant } from '../types'

const QUADRANTS: Quadrant[] = ['Do First', 'Schedule', 'Delegate', 'Eliminate']

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const systemPrompt = (referenceDate: string, referenceTime: string): string => `
You are ChroniyamAI, a friendly conversational planning assistant.

Your job: have a short natural conversation to collect the user's tasks, then classify each one into the Eisenhower Matrix (Do First / Schedule / Delegate / Eliminate).

For every task you must know:
- title
- when they want to start it (startDate)
- when it is due (dueDate)
- how long it will take (estimatedHours)

If the user hasn't told you the duration or start date for a task, ask a short, natural follow-up question for exactly that missing detail. Ask about one or two missing things at a time, don't interrogate. Once you have enough information for all tasks mentioned so far, and the user has nothing more to add, finish the conversation.

The current date and time is ${referenceDate} ${referenceTime}. Use this as "today" when resolving relative dates like "tomorrow" or "next week".

Respond ONLY with JSON matching the schema. Set "done": false and fill "reply" with your next conversational message while you are still gathering info (tasks can be an empty array). Set "done": true, leave "reply" as a short friendly closing line, and fill "tasks" with the final list once everything is confirmed.
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
            dueDate: { type: 'string' },
            estimatedHours: { type: 'number' },
          },
          required: ['title', 'quadrant', 'startDate', 'dueDate', 'estimatedHours'],
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
): Promise<ConversationResult> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

  if (!apiKey || apiKey === 'your-openai-api-key') {
    return {
      reply: 'OpenAI API key is not configured. Add a real key to .env.local to enable ChroniyamAI.',
      done: false,
      tasks: [],
    }
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt(referenceDate, referenceTime) },
        ...history,
      ],
      temperature: 0.4,
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
          id: crypto.randomUUID(),
        }))
      : [],
  }
}
