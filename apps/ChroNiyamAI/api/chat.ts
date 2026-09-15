import type { ChatMessage } from '../src/types'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Serverless OPENAI_API_KEY is not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  try {
    const body = await req.json()
    const { action, messages, referenceDate, referenceTime, title, currentHours, sarcasmLevel } = body

    // Phase 3 Hardening: Input validation and payload size caps
    if (action === 'suggest-duration') {
      if (typeof title !== 'string' || title.trim().length === 0 || title.length > 300) {
        return new Response(JSON.stringify({ error: 'Invalid task title provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } else if (action === 'continue-conversation') {
      if (!Array.isArray(messages) || messages.length > 50) {
        return new Response(JSON.stringify({ error: 'Invalid or excessive conversation history' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

    if (action === 'suggest-duration') {
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

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
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

      if (!response.ok) {
        const errorText = await response.text()
        return new Response(JSON.stringify({ error: `OpenAI error: ${response.status} ${errorText}` }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const data = await response.json()
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Default action: conversational task extraction
    const QUADRANTS = ['Do First', 'Schedule', 'Delegate', 'Eliminate']
    const safeSarcasmLevel = Math.min(100, Math.max(0, Number(sarcasmLevel) || 0))
    const systemPrompt = `
  You are Chroniyam AI, a ${safeSarcasmLevel === 0 ? 'clear and supportive' : safeSarcasmLevel < 70 ? 'witty and lightly playful' : 'dryly sarcastic but constructive'} conversational planning assistant.

  PERSONALITY INSTRUCTIONS:
  - Use a sarcasm intensity of ${safeSarcasmLevel}/100.
  - At 0, stay entirely straightforward and supportive. As the level rises, add occasional dry observations about unrealistic durations or procrastination, but never insult, shame, or derail the planning.
  - Keep replies short (1-3 sentences max) and text-message style. Never let humor obscure the next planning action.
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(messages as ChatMessage[]),
        ],
        temperature: 0.4,
        response_format: { type: 'json_schema', json_schema: conversationJsonSchema },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(JSON.stringify({ error: `OpenAI error: ${response.status} ${errorText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
