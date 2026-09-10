import type { Quadrant, Task } from '../types'

const QUADRANT_INFO: { key: Quadrant; label: string; hint: string; className: string }[] = [
  { key: 'Do First', label: 'Do First', hint: 'Urgent & Important', className: 'quadrant-urgent-important' },
  { key: 'Schedule', label: 'Schedule', hint: 'Important, Not Urgent', className: 'quadrant-not-urgent-important' },
  { key: 'Delegate', label: 'Delegate', hint: 'Urgent, Not Important', className: 'quadrant-urgent-not-important' },
  { key: 'Eliminate', label: 'Eliminate', hint: 'Not Urgent, Not Important', className: 'quadrant-not-urgent-not-important' },
]

type MatrixViewProps = {
  tasks: Task[]
  onStartOver: () => void
}

const MatrixView = ({ tasks, onStartOver }: MatrixViewProps) => {
  return (
    <div className="matrix-page">
      <header className="matrix-header">
        <h1>Your Plan</h1>
        <button type="button" className="draft-btn ghost" onClick={onStartOver}>Talk to ChroniyamAI again</button>
      </header>

      <div className="matrix-grid">
        {QUADRANT_INFO.map((quadrant) => (
          <div key={quadrant.key} className={`matrix-quadrant ${quadrant.className}`}>
            <div className="matrix-quadrant-header">
              <h2>{quadrant.label}</h2>
              <span>{quadrant.hint}</span>
            </div>
            <div className="matrix-quadrant-tasks">
              {tasks.filter((task) => task.quadrant === quadrant.key).map((task) => (
                <div key={task.id} className="matrix-task-card">
                  <strong>{task.title}</strong>
                  <span>{task.startDate} → {task.dueDate}</span>
                  <span>{task.estimatedHours}h</span>
                </div>
              ))}
              {tasks.filter((task) => task.quadrant === quadrant.key).length === 0 && (
                <p className="matrix-empty">No tasks here</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MatrixView
