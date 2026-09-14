import type { QuadrantKey } from '../types/quadrant'
import type { VoiceTaskSuggestion } from '../types/voice'

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fallbackTaskFromTranscript = (transcript: string, referenceDate: string): VoiceTaskSuggestion[] => {
  const cleaned = transcript.trim()
  if (!cleaned) return []

  const title = cleaned.replace(/\s+/g, ' ').split(/[.!?]/)[0].trim().slice(0, 80) || 'New task from voice'

  return [{
    title,
    quadrant: 'Do First',
    startDate: referenceDate,
    dueDate: referenceDate,
    estimatedHours: 1,
    reasoning: 'AI-generated from voice transcript; ready for review.',
    durationSpecified: false,
    startSpecified: false,
  }]
}

const buildPrompt = (transcript: string, referenceDate: string, referenceTime: string): string => `
You are a task prioritization assistant for ChroNiyam.
Classify the spoken task list into the Eisenhower Matrix:
- Do First: urgent and important
- Schedule: important but not urgent
- Delegate: urgent but not important
- Eliminate: not urgent and not important

Return valid JSON only with this schema:
{"tasks":[{"title":"string","quadrant":"Do First|Schedule|Delegate|Eliminate","startDate":"YYYY-MM-DD","dueDate":"YYYY-MM-DD","estimatedHours":1,"reasoning":"short explanation","durationSpecified":true,"startSpecified":true}]}

The current date and time is ${referenceDate} ${referenceTime}. Use this exact date as "today" when resolving relative dates like "tomorrow" or "next week". Split multiple tasks into separate entries.

Only set "durationSpecified" to true if the person actually said how long the task will take (a number of hours/minutes/days). Only set "startSpecified" to true if the person actually said when they want to start it. If either was not mentioned, still fill estimatedHours and startDate with a reasonable guess, but set the matching flag to false so the app can ask the user to confirm.

Transcript:
${transcript}
`

const extractJsonArray = (content: string, referenceDate: string): VoiceTaskSuggestion[] => {
  const jsonStart = content.indexOf('{')
  const jsonEnd = content.lastIndexOf('}')
  if (jsonStart === -1 || jsonEnd < jsonStart) return []

  try {
    const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1)) as Record<string, unknown>
    // model output key casing can vary; look up "tasks" case-insensitively
    const tasksKey = Object.keys(parsed).find((key) => key.toLowerCase() === 'tasks')
    const rawTasks = (tasksKey ? parsed[tasksKey] : []) as Array<{
      title?: string
      quadrant?: string
      startDate?: string
      dueDate?: string
      estimatedHours?: number
      reasoning?: string
      durationSpecified?: boolean
      startSpecified?: boolean
    }>

    return (rawTasks ?? []).filter((item) => item?.title).map((item) => ({
      title: String(item.title).trim(),
      quadrant: (['Do First', 'Schedule', 'Delegate', 'Eliminate'] as QuadrantKey[]).includes(item.quadrant as QuadrantKey)
        ? item.quadrant as QuadrantKey
        : 'Schedule',
      startDate: item.startDate || referenceDate,
      dueDate: item.dueDate || item.startDate || referenceDate,
      estimatedHours: Number(item.estimatedHours) > 0 ? Number(item.estimatedHours) : 1,
      reasoning: item.reasoning || 'Classified by AI based on urgency and importance.',
      durationSpecified: item.durationSpecified === true,
      startSpecified: item.startSpecified === true,
    }))
  } catch {
    return []
  }
}

const voiceTaskJsonSchema = {
  name: 'voice_task_suggestions',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            quadrant: { type: 'string', enum: ['Do First', 'Schedule', 'Delegate', 'Eliminate'] },
            startDate: { type: 'string' },
            dueDate: { type: 'string' },
            estimatedHours: { type: 'number' },
            reasoning: { type: 'string' },
            durationSpecified: { type: 'boolean' },
            startSpecified: { type: 'boolean' },
          },
          required: ['title', 'quadrant', 'startDate', 'dueDate', 'estimatedHours', 'reasoning', 'durationSpecified', 'startSpecified'],
          additionalProperties: false,
        },
      },
    },
    required: ['tasks'],
    additionalProperties: false,
  },
}

export type VoiceParseResult = {
  tasks: VoiceTaskSuggestion[]
  usedAI: boolean
  warning?: string
}

export const parseVoiceTranscript = async (
  transcript: string,
  referenceDate: string = formatDate(new Date()),
  referenceTime: string = new Date().toTimeString().slice(0, 5),
): Promise<VoiceParseResult> => {
  const cleaned = transcript.trim()
  if (!cleaned) return { tasks: [], usedAI: false }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

  if (!apiKey || apiKey === 'your-openai-api-key') {
    return {
      tasks: fallbackTaskFromTranscript(cleaned, referenceDate),
      usedAI: false,
      warning: 'OpenAI API key is not configured. Add a real key to .env.local to enable AI classification.',
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: buildPrompt(cleaned, referenceDate, referenceTime) }],
        temperature: 0.3,
        response_format: { type: 'json_schema', json_schema: voiceTaskJsonSchema },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content ?? ''
    const parsed = extractJsonArray(content, referenceDate)

    if (parsed.length === 0) {
      return {
        tasks: fallbackTaskFromTranscript(cleaned, referenceDate),
        usedAI: false,
        warning: 'AI response could not be parsed into tasks. Used a basic fallback instead.',
      }
    }

    return { tasks: parsed, usedAI: true }
  } catch (error) {
    return {
      tasks: fallbackTaskFromTranscript(cleaned, referenceDate),
      usedAI: false,
      warning: error instanceof Error ? error.message : 'AI request failed. Used a basic fallback instead.',
    }
  }
}