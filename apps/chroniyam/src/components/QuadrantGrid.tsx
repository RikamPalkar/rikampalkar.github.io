import type { Quadrant, Task } from '../types/quadrant'
import TaskCard from './TaskCard'
import Tooltip from './Tooltip'
import BalanceValidator from './BalanceValidator'
import { useState } from 'react'

type QuadrantGridProps = {
  quadrants: Quadrant[]
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  helpMode: boolean
  onMoveTask: (taskId: string, newQuadrant: string) => void
  balanceMode: boolean
  onCopyTask?: (task: Task) => void
  onPasteTask?: (quadrant: string) => void
  copiedTask?: Task | null
}

const idealRanges: Record<string, { min: number; max: number; label: string }> = {
  'Do First': { min: 15, max: 25, label: '15-25%' },
  'Schedule': { min: 50, max: 65, label: '50-65%' },
  'Delegate': { min: 5, max: 15, label: '5-15%' },
  'Eliminate': { min: 5, max: 15, label: '5-15%' },
}

const QuadrantGrid = ({ quadrants, tasks, onEditTask, onDeleteTask, helpMode, onMoveTask, balanceMode, onCopyTask, onPasteTask, copiedTask }: QuadrantGridProps) => {
  const [dragOver, setDragOver] = useState<string | null>(null)

  const totalTasks = tasks.length
  const getPercentage = (count: number) => (totalTasks === 0 ? 0 : Math.round((count / totalTasks) * 100))
  
  const isHealthy = (quadrantTitle: string, percentage: number) => {
    const range = idealRanges[quadrantTitle]
    if (!range) return true
    return percentage >= range.min && percentage <= range.max
  }

  // Get task counts for balance validator
  const taskCounts = {
    q1: tasks.filter((task) => task.quadrant === 'Do First').length,
    q2: tasks.filter((task) => task.quadrant === 'Schedule').length,
    q3: tasks.filter((task) => task.quadrant === 'Delegate').length,
    q4: tasks.filter((task) => task.quadrant === 'Eliminate').length,
  }

  const handleDragOver = (e: React.DragEvent, quadrantTitle: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(quadrantTitle)
  }

  const handleDragLeave = () => {
    setDragOver(null)
  }

  const handleDrop = (e: React.DragEvent, quadrantTitle: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onMoveTask(taskId, quadrantTitle)
    }
    setDragOver(null)
  }

  const handleQuadrantClick = (quadrantTitle: string) => {
    if (copiedTask && onPasteTask) {
      onPasteTask(quadrantTitle)
    }
  }

  return (
    <>
      {balanceMode && <BalanceValidator taskCounts={taskCounts} totalTasks={totalTasks} />}
      <main className="matrix-grid" role="main">
        {quadrants.map((quadrant) => {
          const quadrantTasks = tasks.filter((task) => task.quadrant === quadrant.title)
          const taskCount = quadrantTasks.length
          const percentage = getPercentage(taskCount)
          const isDragOver = dragOver === quadrant.title
          const healthy = isHealthy(quadrant.title, percentage)
          const idealRange = idealRanges[quadrant.title]

          return (
            <Tooltip key={quadrant.title} content={quadrant.tooltip} show={helpMode}>
              <article
                className={`quadrant ${quadrant.className} ${isDragOver ? 'drag-over' : ''}`}
                role="gridcell"
                onDragOver={(e) => handleDragOver(e, quadrant.title)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, quadrant.title)}
                onClick={() => handleQuadrantClick(quadrant.title)}
                style={{ cursor: copiedTask ? 'copy' : 'default' }}
              >
                <div className="quadrant-header">
                  <div className="quadrant-info">
                    <h2 className="quadrant-title">{quadrant.title}</h2>
                    <p className="quadrant-description">
                      {quadrant.description}
                      {balanceMode && idealRange && (
                        <span className="quadrant-ideal-inline"> • {idealRange.label}</span>
                      )}
                    </p>
                  </div>
                  <div className="quadrant-count-wrapper">
                    <div className="quadrant-count">{taskCount}</div>
                    {balanceMode && totalTasks > 0 && (
                      <div className={`quadrant-percentage ${healthy ? 'healthy' : 'unhealthy'}`}>
                        {percentage}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="task-list" aria-label={`${quadrant.title} tasks`}>
                  {taskCount === 0 ? (
                    <p className="muted subtle">No tasks</p>
                  ) : (
                    quadrantTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onCopy={onCopyTask}
                      />
                    ))
                  )}
                </div>
              </article>
            </Tooltip>
          )
        })}
      </main>
    </>
  )
}

export default QuadrantGrid
