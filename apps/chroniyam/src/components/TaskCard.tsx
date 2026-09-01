import type { Task } from '../types/quadrant'

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onCopy?: (task: Task) => void
}

const TaskCard = ({ task, onEdit, onDelete, onCopy }: TaskCardProps) => {
  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCopy) onCopy(task)
  }
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div 
      className="task-card" 
      title={task.description || undefined}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="task-main">
        <p className="task-title">{task.title}</p>
        <div className="task-meta">
          <span className="task-hours" title="Estimated hours">
            ⏱ {task.estimatedHours}h
          </span>
          <span className="task-due" title="Due date">
            ⏱ {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
      <div className="task-actions">
        {onCopy && (
          <button type="button" className="icon-btn" aria-label="Copy task" onClick={handleCopyClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        )}
        <button type="button" className="icon-btn" aria-label="Edit task" onClick={() => onEdit(task)}>
          ✎
        </button>
        <button type="button" className="icon-btn" aria-label="Delete task" onClick={() => onDelete(task.id)}>
          🗑️
        </button>
      </div>
    </div>
  )
}

export default TaskCard
