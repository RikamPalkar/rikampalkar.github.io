import { useEffect, useState } from 'react'
import type { QuadrantKey } from '../types/quadrant'
import type { VoiceTaskSuggestion } from '../types/voice'
import VoiceInputButton from './VoiceInputButton'

type VoiceTaskReviewModalProps = {
  isOpen: boolean
  suggestions: VoiceTaskSuggestion[]
  onClose: () => void
  onSave: (tasks: VoiceTaskSuggestion[]) => void
}

const getCurrentDate = () => new Date().toISOString().slice(0, 10)
const getCurrentTime = () => new Date().toTimeString().slice(0, 5)

const defaultSuggestion = (suggestion: VoiceTaskSuggestion, referenceDate: string): VoiceTaskSuggestion => ({
  ...suggestion,
  title: suggestion.title.trim() || 'New task',
  startDate: suggestion.startDate || referenceDate,
  dueDate: suggestion.dueDate || suggestion.startDate || referenceDate,
  estimatedHours: Number.isFinite(suggestion.estimatedHours) ? suggestion.estimatedHours : 1,
  quadrant: ['Do First', 'Schedule', 'Delegate', 'Eliminate'].includes(suggestion.quadrant) ? suggestion.quadrant : 'Schedule',
  durationSpecified: suggestion.durationSpecified ?? false,
  startSpecified: suggestion.startSpecified ?? false,
})

const VoiceTaskReviewModal = ({ isOpen, suggestions, onClose, onSave }: VoiceTaskReviewModalProps) => {
  const [step, setStep] = useState<'reference' | 'review'>('reference')
  const [referenceDate, setReferenceDate] = useState(getCurrentDate())
  const [referenceTime, setReferenceTime] = useState(getCurrentTime())
  const [drafts, setDrafts] = useState<VoiceTaskSuggestion[]>([])

  useEffect(() => {
    if (isOpen) {
      setStep('reference')
      setReferenceDate(getCurrentDate())
      setReferenceTime(getCurrentTime())
      setDrafts(suggestions.map((suggestion) => defaultSuggestion(suggestion, getCurrentDate())))
    }
  }, [isOpen, suggestions])

  const updateDraft = (index: number, updates: Partial<VoiceTaskSuggestion>) => {
    setDrafts((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...updates } : item)))
  }

  const removeDraft = (index: number) => {
    setDrafts((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSave = () => {
    const cleaned = drafts
      .map((draft) => defaultSuggestion(draft, referenceDate))
      .filter((draft) => draft.title.trim())

    onSave(cleaned)
    onClose()
  }

  const needsClarification = drafts.some((draft) => !draft.durationSpecified || !draft.startSpecified)

  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Review AI task suggestions">
      <div className="modal voice-review-modal">
        <header className="modal-header">
          <h2>Review AI Suggestions</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close review modal">
            ×
          </button>
        </header>

        {step === 'reference' ? (
          <>
            <div className="modal-form">
              <p className="voice-review-empty" style={{ paddingLeft: 0 }}>
                Confirm the current date and time so ChroNiyam can correctly resolve things like "tomorrow" or "next week".
              </p>
              <div className="field-row field-row-equal">
                <label className="field">
                  <span className="field-label">Current Date</span>
                  <input
                    type="date"
                    value={referenceDate}
                    onChange={(event) => setReferenceDate(event.target.value)}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Current Time</span>
                  <input
                    type="time"
                    value={referenceTime}
                    onChange={(event) => setReferenceTime(event.target.value)}
                  />
                </label>
              </div>
            </div>

            <footer className="modal-actions">
              <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
              <button type="button" className="btn primary" onClick={() => setStep('review')}>
                Continue
              </button>
            </footer>
          </>
        ) : (
          <>
            <div className="modal-form">
              <VoiceInputButton
                referenceDate={referenceDate}
                referenceTime={referenceTime}
                onTasksParsed={(tasks) => setDrafts((prev) => [...prev, ...tasks.map((task) => defaultSuggestion(task, referenceDate))])}
              />

              {drafts.length === 0 && (
                <p className="voice-review-empty">No suggestions to review.</p>
              )}
            </div>

            {drafts.length > 0 && (
              <div className="voice-task-list">
                {drafts.map((draft, index) => (
                  <div key={`${draft.title}-${index}`} className="voice-task-card">
                    <div className="voice-task-card-header">
                      <strong>Task {index + 1}</strong>
                      <button type="button" className="btn ghost" onClick={() => removeDraft(index)}>
                        Remove
                      </button>
                    </div>

                    <label className="field">
                      <span className="field-label">Title</span>
                      <input
                        value={draft.title}
                        onChange={(event) => updateDraft(index, { title: event.target.value })}
                      />
                    </label>

                    <div className="field-row field-row-equal">
                      <label className="field">
                        <span className="field-label">
                          {draft.startSpecified ? 'Start Date' : 'AI needs to know: When do you want to start?'}
                        </span>
                        <input
                          type="date"
                          className={draft.startSpecified ? undefined : 'field-needs-input'}
                          value={draft.startDate}
                          onChange={(event) => updateDraft(index, { startDate: event.target.value, startSpecified: true })}
                        />
                      </label>

                      <label className="field">
                        <span className="field-label">Due Date</span>
                        <input
                          type="date"
                          value={draft.dueDate}
                          onChange={(event) => updateDraft(index, { dueDate: event.target.value })}
                        />
                      </label>
                    </div>

                    <div className="field-row field-row-equal">
                      <label className="field">
                        <span className="field-label">
                          {draft.durationSpecified ? 'Hours' : 'AI needs to know: How long will this take?'}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          className={draft.durationSpecified ? undefined : 'field-needs-input'}
                          value={draft.estimatedHours}
                          onChange={(event) => updateDraft(index, { estimatedHours: Number(event.target.value) || 0, durationSpecified: true })}
                        />
                      </label>

                      <label className="field">
                        <span className="field-label">Quadrant</span>
                        <select
                          value={draft.quadrant}
                          onChange={(event) => updateDraft(index, { quadrant: event.target.value as QuadrantKey })}
                        >
                          <option value="Do First">Do First</option>
                          <option value="Schedule">Schedule</option>
                          <option value="Delegate">Delegate</option>
                          <option value="Eliminate">Eliminate</option>
                        </select>
                      </label>
                    </div>

                    <label className="field">
                      <span className="field-label">AI Reasoning</span>
                      <textarea
                        value={draft.reasoning}
                        onChange={(event) => updateDraft(index, { reasoning: event.target.value })}
                        rows={3}
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}

            <footer className="modal-actions">
              {needsClarification && (
                <span className="voice-review-empty" style={{ marginRight: 'auto', color: '#d97706' }}>
                  Confirm the highlighted fields before adding to your plan.
                </span>
              )}
              <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
              <button type="button" className="btn primary" onClick={handleSave} disabled={drafts.length === 0 || needsClarification}>
                Add to Plan
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

export default VoiceTaskReviewModal
