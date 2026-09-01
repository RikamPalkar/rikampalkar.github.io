import Tooltip from './Tooltip'

type SideActionsProps = {
  onAddTask: () => void
  onClear: () => void
  hasTasks: boolean
  helpMode: boolean
  onToggleHelp: () => void
  balanceMode: boolean
  onToggleBalance: () => void
  onPlan: () => void
  onViewCalendar: () => void
  onShowGuide: () => void
}

const SideActions = ({ onAddTask, onClear, hasTasks, helpMode, onToggleHelp, balanceMode, onToggleBalance, onPlan, onViewCalendar, onShowGuide }: SideActionsProps) => {
  return (
    <aside className="side-actions" aria-label="Task actions">
      <Tooltip content={['Getting Started Guide', 'Learn how to use ChroNiyam effectively with a step-by-step walkthrough.']} show={helpMode} position="right">
        <button
          type="button"
          className="icon-tile ghost"
          onClick={onShowGuide}
          aria-label="Show guide"
          title="Show getting started guide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </Tooltip>
      <Tooltip content={['Plan Time Window', 'Set up your time window and define productive hours for better task planning.']} show={helpMode} position="right">
        <button
          type="button"
          className="icon-tile ghost"
          onClick={onPlan}
          aria-label="Plan time window"
          title="Plan time window"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </Tooltip>
      <Tooltip content={['Add New Task', 'Create a task and assign it to a quadrant based on urgency and importance.']} show={helpMode} position="right">
        <button
          type="button"
          className="icon-tile ghost"
          onClick={onAddTask}
          aria-label="Add task"
          title="Add task"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </Tooltip>
      <Tooltip content={['View Calendar', 'View your tasks in calendar format with daily schedule.']} show={helpMode} position="right">
        <button
          type="button"
          className="icon-tile ghost"
          onClick={onViewCalendar}
          aria-label="View calendar"
          title="View calendar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </Tooltip>
      <Tooltip content={['Help Mode', 'Toggle tooltips on or off to show or hide helpful explanations.']} show={helpMode} position="right">
        <button
          type="button"
          className={`icon-tile ${helpMode ? 'primary' : 'ghost'}`}
          onClick={onToggleHelp}
          aria-label="Toggle help"
          title="Toggle help"
          aria-pressed={helpMode}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </button>
      </Tooltip>
      <Tooltip content={['Work-Life Balance Mode', 'Toggle to view task distribution analysis across quadrants.', 'Ensure Q2 (Important & Not Urgent) is your primary focus area.']} show={helpMode} position="right">
        <button
          type="button"
          className={`icon-tile ${balanceMode ? 'primary' : 'ghost'}`}
          onClick={onToggleBalance}
          aria-label="Work-Life Balance Mode"
          title="Work-Life Balance Mode"
          aria-pressed={balanceMode}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3M6.34 6.34l2.12 2.12m7.07 7.07l2.12 2.12M6.34 17.66l2.12-2.12m7.07-7.07l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </Tooltip>
      <Tooltip content={['Clear All Tasks', 'Remove all tasks from all quadrants.', 'Warning: This action cannot be undone.']} show={helpMode} position="right">
        <button
          type="button"
          className="icon-tile ghost"
          onClick={onClear}
          disabled={!hasTasks}
          aria-label="Clear tasks"
          title="Clear tasks"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 11v6m4-6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </Tooltip>
    </aside>
  )
}

export default SideActions
