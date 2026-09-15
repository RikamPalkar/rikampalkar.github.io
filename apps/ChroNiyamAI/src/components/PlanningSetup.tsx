import { useState } from 'react'
import { addDays } from '../lib/scheduleValidator'
import type { PlanningMode } from '../types'

type PlanningSetupProps = {
  onStart: (mode: PlanningMode, days: number) => void
}

const MODE_OPTIONS: { mode: PlanningMode; label: string; hint: string; days: number }[] = [
  { mode: 'day', label: 'Day', hint: 'Plan just today', days: 1 },
  { mode: 'week', label: 'Week', hint: 'Plan the next 7 days', days: 7 },
  { mode: 'month', label: 'Month', hint: 'Plan the next 30 days', days: 30 },
]

const formatDisplayDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PlanningSetup = ({ onStart }: PlanningSetupProps) => {
  const [selected, setSelected] = useState<PlanningMode>('week')
  const [customDays, setCustomDays] = useState(3)

  const days = selected === 'custom' ? Math.max(1, customDays) : MODE_OPTIONS.find((o) => o.mode === selected)?.days ?? 7
  const today = new Date().toISOString().slice(0, 10)
  const endDate = addDays(today, days - 1)

  return (
    <div className="planning-setup">
      <div className="planning-setup-card">
        <h1>Chroniyam AI</h1>
        <p>How far ahead do you want to plan?</p>

        <div className="planning-mode-options">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              className={`planning-mode-btn ${selected === option.mode ? 'selected' : ''}`}
              onClick={() => setSelected(option.mode)}
            >
              <strong>{option.label}</strong>
              <span>{option.hint}</span>
            </button>
          ))}
          <button
            type="button"
            className={`planning-mode-btn ${selected === 'custom' ? 'selected' : ''}`}
            onClick={() => setSelected('custom')}
          >
            <strong>Custom</strong>
            <span>Pick number of days</span>
          </button>
        </div>

        {selected === 'custom' && (
          <label className="planning-custom-days">
            <span>Number of days</span>
            <input
              type="number"
              min="1"
              max="365"
              value={customDays}
              onChange={(event) => setCustomDays(Math.max(1, Number(event.target.value) || 1))}
            />
          </label>
        )}

        <p className="planning-range-preview">
          {formatDisplayDate(today)} → {formatDisplayDate(endDate)}, 11:59 PM
        </p>

        <button type="button" className="talk-button" onClick={() => onStart(selected, days)}>
          Start Planning ({days} day{days === 1 ? '' : 's'})
        </button>
      </div>
    </div>
  )
}

export default PlanningSetup
