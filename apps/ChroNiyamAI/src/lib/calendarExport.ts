import type { Task } from '../types'

const escapeIcsText = (value: string): string => value
  .replace(/\\/g, '\\\\')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')
  .replace(/\r?\n/g, '\\n')

const toIcsDateTime = (date: string, time: string): string => {
  const [year, month, day] = date.split('-')
  const [hours, minutes] = time.split(':')
  return `${year}${month}${day}T${hours || '00'}${minutes || '00'}00`
}

const addMinutes = (date: Date, minutes: number): Date => new Date(date.getTime() + minutes * 60 * 1000)

const formatIcsDateTime = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

export const downloadCalendarFile = (tasks: Task[]): void => {
  const events = tasks.map((task) => {
    const start = toIcsDateTime(task.startDate, task.startTime)
    const startDate = new Date(
      Number(start.slice(0, 4)),
      Number(start.slice(4, 6)) - 1,
      Number(start.slice(6, 8)),
      Number(start.slice(9, 11)),
      Number(start.slice(11, 13)),
    )
    const end = formatIcsDateTime(addMinutes(startDate, Math.max(30, task.estimatedHours * 60)))

    return [
      'BEGIN:VEVENT',
      `UID:${escapeIcsText(task.id)}@chroniyamai`,
      `DTSTAMP:${formatIcsDateTime(new Date())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(task.title)}`,
      `DESCRIPTION:${escapeIcsText(`${task.quadrant} | ${task.estimatedHours} hours`)}`,
      'END:VEVENT',
    ].join('\r\n')
  })

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChroNiyam AI//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([`${calendar}\r\n`], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'chroniyam-ai-plan.ics'
  link.click()
  URL.revokeObjectURL(url)
}