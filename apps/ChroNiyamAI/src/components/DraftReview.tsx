import { useState } from 'react'
import type { Quadrant, Task } from '../types'

const QUADRANTS: Quadrant[] = ['Do First', 'Schedule', 'Delegate', 'Eliminate']

type DraftReviewProps = {
  tasks: Task[]
  onConfirm: (tasks: Task[]) => void
  onCancel: () => void
}

const DraftReview = ({ tasks, onConfirm, onCancel }: DraftReviewProps) => {
  const [drafts, setDrafts] = useState<Task[]>(tasks)

  const updateDraft = (index: number, updates: Partial<Task>) => {
    setDrafts((prev) => prev.map((task, taskIndex) => (taskIndex === index ? { ...task, ...updates } : task)))
  }

  const removeDraft = (index: number) => {
    setDrafts((prev) => prev.filter((_, taskIndex) => taskIndex !== index))
  }

  return (
    <div className="chat-overlay">
      <div className="chat-overlay-backdrop" onClick={onCancel} />
      <div className="draft-panel" role="dialog" aria-modal="true" aria-label="Review draft plan">
        <header className="chat-panel-header">
          <span className="chat-panel-title">Review your plan</span>
          <button type="button" className="chat-close" onClick={onCancel} aria-label="Close">×</button>
        </header>

        <div className="draft-list">
          {drafts.map((task, index) => (
            <div key={task.id} className="draft-card">
              <div className="draft-card-header">
                <strong>Task {index + 1}</strong>
                <button type="button" className="draft-remove" onClick={() => removeDraft(index)}>Remove</button>
              </div>

              <label className="draft-field">
                <span>Title</span>
                <input value={task.title} onChange={(event) => updateDraft(index, { title: event.target.value })} />
              </label>

              <div className="draft-field-row">
                <label className="draft-field">
                  <span>Quadrant</span>
                  <select value={task.quadrant} onChange={(event) => updateDraft(index, { quadrant: event.target.value as Quadrant })}>
                    {QUADRANTS.map((quadrant) => (
                      <option key={quadrant} value={quadrant}>{quadrant}</option>
                    ))}
                  </select>
                </label>

                <label className="draft-field">
                  <span>Hours</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={task.estimatedHours}
                    onChange={(event) => updateDraft(index, { estimatedHours: Number(event.target.value) || 0 })}
                  />
                </label>
              </div>

              <div className="draft-field-row">
                <label className="draft-field">
                  <span>Start Date</span>
                  <input type="date" value={task.startDate} onChange={(event) => updateDraft(index, { startDate: event.target.value })} />
                </label>

                <label className="draft-field">
                  <span>Due Date</span>
                  <input type="date" value={task.dueDate} onChange={(event) => updateDraft(index, { dueDate: event.target.value })} />
                </label>
              </div>
            </div>
          ))}
        </div>

        <footer className="chat-panel-footer">
          <button type="button" className="draft-btn ghost" onClick={onCancel}>Back to chat</button>
          <button type="button" className="draft-btn primary" onClick={() => onConfirm(drafts)} disabled={drafts.length === 0}>
            Looks good, plan it
          </button>
        </footer>
      </div>
    </div>
  )
}

export default DraftReview
