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
    const { action, messages, referenceDate, referenceTime, title, currentHours, sarcasmLevel, planningDays } = body

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
    const safePlanningDays = Math.min(365, Math.max(1, Number(planningDays) || 7))
    const systemPrompt = `
  You are Chroniyam AI, a ${safeSarcasmLevel === 0 ? 'clear and supportive' : safeSarcasmLevel < 70 ? 'witty and lightly playful' : 'dryly sarcastic but constructive'} conversational planning assistant.

  PERSONALITY INSTRUCTIONS:
  - Use a sarcasm intensity of ${safeSarcasmLevel}/100.
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

SCHEDULING HEURISTICS:
- Energy-based — deep/complex tasks in your peak focus hours, light tasks in low-energy slots.
- Deadline proximity — urgent-important tasks get earliest slots automatically.
- Context/location — grouping similar tasks together to reduce switching cost.
- Calendar-aware buffering — leaving gaps around meetings instead of cramming right after.
- Task chaining — sequencing dependent tasks (e.g., "review" only after "draft" is done).
- Recurring pattern learning — noticing you always do admin work at a certain time and defaulting to that.
- Apply these as planning defaults. Never invent a fixed meeting, location, dependency, or learned pattern the user has not provided; use reasonable proposals when context is missing.

For every task you must know:
- title
- when they want to start it (startDate, and startTime if they mention one)
- how long it will take (estimatedHours)
- activity area: work, exercise, relationships, learning, hobbies, recovery, or other.

Do not ask the user for the duration or start time of every task. Estimate a practical duration and choose a realistic planned date and time from the available planning window. Ask a follow-up only when a genuinely blocking fact is unclear, such as two possible hard deadlines or a fixed appointment that cannot move.

The current date and time is ${referenceDate} ${referenceTime}. The active planning window is exactly ${safePlanningDays} days, from ${referenceDate} through the end of that window. Every task occurrence, including repeated activities, MUST have a startDate inside this window. Use this as "today" when resolving relative dates like "tomorrow" or "next week". Do NOT ask the user what time of day they want to start a task unless it is a fixed appointment. If no time is given, choose a reasonable slot and set timeSpecified to true. If no duration or date is given, choose a reasonable value and set durationSpecified and startSpecified to true because the value is now part of the proposed plan.

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
