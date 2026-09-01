import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import QuadrantGrid from './components/QuadrantGrid'
import SideActions from './components/SideActions'
import TaskModal, { type TaskInput } from './components/TaskModal'
import ConfirmDialog from './components/ConfirmDialog'
import Footer from './components/Footer'
import PlanModal from './components/PlanModal'
import CalendarView from './components/CalendarView'
import GuideModal from './components/GuideModal'
import type { Quadrant, QuadrantKey, Task, Theme, TimeWindow } from './types/quadrant'
import { canAllocateHours } from './utils/hoursCalculator'
import { calculateCurrentHours, getWeekDates, validateAllocation } from './utils/hoursAllocationEngine'

const quadrants: Quadrant[] = [
  {
    title: 'Do First',
    description: 'Urgent and Important',
    className: 'quadrant-urgent-important',
    tooltip: [
      'Crisis mode: Deadlines, emergencies, and pressing problems.',
      'Handle these immediately but work to minimize time here through better planning.',
    ],
  },
  {
    title: 'Schedule',
    description: 'Not Urgent but Important',
    className: 'quadrant-not-urgent-important',
    tooltip: [
      'Strategic zone: Planning, personal development, and relationship building.',
      'This is where you should spend most of your time for long-term success.',
    ],
  },
  {
    title: 'Delegate',
    description: 'Urgent but Not Important',
    className: 'quadrant-urgent-not-important',
    tooltip: [
      'Distraction zone: Interruptions, some calls and emails, other people\'s priorities.',
      'Learn to say no or delegate these tasks.',
    ],
  },
  {
    title: 'Eliminate',
    description: 'Not Urgent and Not Important',
    className: 'quadrant-not-urgent-not-important',
    tooltip: [
      'Time wasters: Busy work, excessive social media, and trivial tasks.',
      'Minimize or eliminate these activities entirely.',
    ],
  },
]

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme())
  const [tasks, setTasks] = useState<Task[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [helpMode, setHelpMode] = useState(false)
  const [balanceMode, setBalanceMode] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [weekPlans, setWeekPlans] = useState<TimeWindow[]>([])
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [copiedWeekTemplate, setCopiedWeekTemplate] = useState<Task[] | null>(null)
  const [copiedWeekIndex, setCopiedWeekIndex] = useState<number | null>(null)
  const [copiedTask, setCopiedTask] = useState<Task | null>(null)
  const [pasteError, setPasteError] = useState<string>('')

  // Sort weeks chronologically
  const sortedWeeks = useMemo(() => {
    return [...weekPlans].sort((a, b) => a.startDate.localeCompare(b.startDate))
  }, [weekPlans])

  const currentWeek = sortedWeeks[currentWeekIndex]
  const canGoPrevious = currentWeekIndex > 0
  const canGoNext = currentWeekIndex < sortedWeeks.length - 1

  // Get combined date range for calendar
  const combinedDateRange = useMemo(() => {
    if (sortedWeeks.length === 0) return { startDate: '', endDate: '' }
    return {
      startDate: sortedWeeks[0].startDate,
      endDate: sortedWeeks[sortedWeeks.length - 1].endDate,
    }
  }, [sortedWeeks])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const title = useMemo(() => 'Chroनियम', [])
  const quadrantNames = useMemo<QuadrantKey[]>(() => quadrants.map((q) => q.title), [])

  // Calculate allocated hours for current week only
  const allocatedHours = useMemo(() => {
    if (!currentWeek) return 0
    
    const weekStart = new Date(currentWeek.startDate)
    const weekEnd = new Date(currentWeek.endDate)
    
    return tasks.reduce((sum, task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.dueDate)
      
      // Only count tasks that overlap with current week
      if (taskStart > weekEnd || taskEnd < weekStart) return sum
      
      if (task.isRecurring) {
        // For recurring tasks within the week
        const overlapStart = taskStart > weekStart ? taskStart : weekStart
        const overlapEnd = taskEnd < weekEnd ? taskEnd : weekEnd
        const daysDiff = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
        return sum + (task.estimatedHours * daysDiff)
      }
      return sum + task.estimatedHours
    }, 0)
  }, [tasks, currentWeek])

  // Create computed time window with updated allocated hours for current week
  const currentTimeWindow = useMemo(() => {
    if (!currentWeek) return undefined
    return { ...currentWeek, allocatedHours }
  }, [currentWeek, allocatedHours])

  // Filter tasks for current week
  const weekTasks = useMemo(() => {
    if (!currentWeek) return tasks
    
    const weekStart = new Date(currentWeek.startDate)
    const weekEnd = new Date(currentWeek.endDate)
    
    return tasks.filter((task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.dueDate)
      // Include task if it overlaps with current week
      return taskStart <= weekEnd && taskEnd >= weekStart
    })
  }, [tasks, currentWeek])

  const handleCopyWeek = () => {
    if (!currentWeek) return
    
    // Helper: Get day of week (0=Monday, 1=Tuesday, ..., 6=Sunday)
    const getDayOfWeek = (dateStr: string): number => {
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      const dayIndex = date.getDay()
      return dayIndex === 0 ? 6 : dayIndex - 1 // Convert Sunday=0 to Sunday=6, Monday=1 to Monday=0
    }
    
    const currentWeekStart = new Date(currentWeek.startDate)
    const currentWeekEnd = new Date(currentWeek.endDate)
    
    // Get all tasks from current week
    const tasksThisWeek = tasks.filter((task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.dueDate)
      return taskStart <= currentWeekEnd && taskEnd >= currentWeekStart
    })
    
    // Store day-of-week instead of offsets
    const templateTasks = tasksThisWeek.map((task) => {
      const startDayOfWeek = getDayOfWeek(task.startDate)
      const endDayOfWeek = getDayOfWeek(task.dueDate)
      
      return {
        ...task,
        startDate: '',
        dueDate: '',
        metadata: { startDayOfWeek, endDayOfWeek },
      } as Task & { metadata: { startDayOfWeek: number; endDayOfWeek: number } }
    })
    
    setCopiedWeekTemplate(templateTasks as Task[])
    setCopiedWeekIndex(currentWeekIndex)
  }

  const handlePasteWeek = () => {
    if (!currentWeek || !copiedWeekTemplate) return
    
    // Helper: Get day of week (0=Monday, 1=Tuesday, ..., 6=Sunday)
    const getDayOfWeek = (dateStr: string): number => {
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      const dayIndex = date.getDay()
      return dayIndex === 0 ? 6 : dayIndex - 1
    }
    
    // Helper: Find date in target week that matches the day of week
    const findDateForDayOfWeek = (targetDayOfWeek: number): string | null => {
      const weekStart = new Date(currentWeek.startDate)
      const weekEnd = new Date(currentWeek.endDate)
      
      for (let i = 0; i <= 6; i++) {
        const checkDate = new Date(weekStart)
        checkDate.setDate(checkDate.getDate() + i)
        
        if (checkDate > weekEnd) break
        
        const currentDayOfWeek = getDayOfWeek(
          `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
        )
        
        if (currentDayOfWeek === targetDayOfWeek) {
          return `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
        }
      }
      return null
    }
    
    // Create new tasks with dates adjusted to target week
    const pastedTasks = copiedWeekTemplate
      .map((template: any) => {
        const { metadata, ...taskWithoutMetadata } = template
        
        const newStartDate = findDateForDayOfWeek(metadata.startDayOfWeek)
        const newDueDate = findDateForDayOfWeek(metadata.endDayOfWeek)
        
        // Skip if the day doesn't exist in target week
        if (!newStartDate || !newDueDate) return null
        
        return {
          ...taskWithoutMetadata,
          id: crypto.randomUUID(),
          startDate: newStartDate,
          dueDate: newDueDate,
          completed: false,
        }
      })
      .filter(Boolean)
    
    // Validate against daily and weekly limits
    const weekDates = getWeekDates(currentWeek.startDate)
    const dailyLimit = currentWeek.hoursPerDay || 8
    const weeklyLimit = currentWeek.totalHours || 56
    
    // Calculate current hours from existing tasks
    const targetWeekStart = new Date(currentWeek.startDate)
    const targetWeekEnd = new Date(currentWeek.endDate)
    const existingTasks = tasks.filter((task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.dueDate)
      return taskStart <= targetWeekEnd && taskEnd >= targetWeekStart
    })
    
    const currentDailyHours = calculateCurrentHours(existingTasks, dailyLimit)
    const violations: string[] = []
    
    // Validate each pasted task
    for (const pastedTask of pastedTasks) {
      // Get all dates this task spans
      const taskDates: string[] = []
      const taskStart = new Date(pastedTask.startDate)
      const taskEnd = new Date(pastedTask.dueDate)
      const currentDate = new Date(taskStart)
      
      while (currentDate <= taskEnd) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
        if (weekDates.includes(dateStr)) {
          taskDates.push(dateStr)
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // Validate this task
      const validation = validateAllocation({
        selectedDates: taskDates,
        requestedHours: pastedTask.estimatedHours,
        currentHours: currentDailyHours,
        dailyLimit,
        allTasks: existingTasks,
      })
      
      if (!validation.isValid) {
        violations.push(...validation.errors)
      }
      
      // Update tracking for next task
      if (validation.isValid) {
        let remainingHours = pastedTask.estimatedHours
        taskDates.forEach((date) => {
          if (remainingHours > 0) {
            const available = dailyLimit - (currentDailyHours[date] || 0)
            const toAdd = Math.min(remainingHours, available)
            currentDailyHours[date] = (currentDailyHours[date] || 0) + toAdd
            remainingHours -= toAdd
          }
        })
      }
    }
    
    // Check weekly total
    const totalWeekHours = weekDates.reduce((sum, date) => sum + (currentDailyHours[date] || 0), 0)
    if (totalWeekHours > weeklyLimit) {
      violations.push(`Total ${totalWeekHours.toFixed(1)}h exceeds weekly limit of ${weeklyLimit}h`)
    }
    
    if (violations.length > 0) {
      setPasteError(`Cannot paste tasks:\n${violations.join('\n')}`)
      setTimeout(() => setPasteError(''), 5000)
      return
    }
    
    setTasks((prev) => [...prev, ...pastedTasks])
    setPasteError('')
  }

  // Check if we can copy/paste
  const canCopyWeek = !!currentWeek && weekTasks.length > 0
  const canPasteWeek = !!currentWeek && !!copiedWeekTemplate && copiedWeekIndex !== currentWeekIndex

  const handlePreviousWeek = () => {
    if (canGoPrevious) {
      setCurrentWeekIndex(currentWeekIndex - 1)
    }
  }

  const handleNextWeek = () => {
    if (canGoNext) {
      setCurrentWeekIndex(currentWeekIndex + 1)
    }
  }

  const currentWeekLabel = useMemo(() => {
    if (sortedWeeks.length <= 1) return undefined
    const week = sortedWeeks[currentWeekIndex]
    if (!week) return undefined
    
    const start = new Date(week.startDate)
    const end = new Date(week.endDate)
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const startDay = start.getDate()
    const endDay = end.getDate()
    
    let dateRange = ''
    if (startDay === endDay) {
      dateRange = `${startMonth} ${startDay}`
    } else if (startMonth === endMonth) {
      dateRange = `${startMonth} ${startDay}–${endDay}`
    } else {
      dateRange = `${startMonth} ${startDay} – ${endMonth} ${endDay}`
    }
    
    return `Week ${currentWeekIndex + 1} of ${sortedWeeks.length} (${dateRange})`
  }, [sortedWeeks, currentWeekIndex])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const handlePlanUpdate = (plan: TimeWindow) => {
    setWeekPlans((prev) => {
      // Check if this week already exists
      const existingIndex = prev.findIndex(
        (w) => w.startDate === plan.startDate && w.endDate === plan.endDate
      )
      
      if (existingIndex >= 0) {
        // Update existing week
        const updated = [...prev]
        updated[existingIndex] = plan
        return updated
      } else {
        // Add new week
        const newPlans = [...prev, plan]
        // Set current index to the newly added week
        const sorted = [...newPlans].sort((a, b) => a.startDate.localeCompare(b.startDate))
        const newIndex = sorted.findIndex((w) => w.startDate === plan.startDate)
        setCurrentWeekIndex(newIndex)
        return newPlans
      }
    })
  }

  const upsertTask = (input: TaskInput) => {
    const id = input.id ?? crypto.randomUUID()
    setTasks((prev) => {
      const exists = prev.some((task) => task.id === id)
      if (exists) {
        return prev.map((task) => (task.id === id ? { ...task, ...input, id } : task))
      }
      return [...prev, { ...input, id }]
    })
  }

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setEditingTask(undefined)
    setShowModal(false)
  }

  const handleAddClick = () => {
    setEditingTask(undefined)
    setShowModal(true)
  }

  const handleClearTasks = () => {
    setShowClearConfirm(true)
  }

  const handleConfirmClear = () => {
    if (!currentWeek) return
    
    const weekStart = new Date(currentWeek.startDate)
    const weekEnd = new Date(currentWeek.endDate)
    
    // Only keep tasks outside current week
    const filteredTasks = tasks.filter((task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.dueDate)
      // Keep task if it doesn't overlap with current week
      return taskStart > weekEnd || taskEnd < weekStart
    })
    
    setTasks(filteredTasks)
    setShowClearConfirm(false)
  }

  const handleCancelClear = () => {
    setShowClearConfirm(false)
  }

  const handleMoveTask = (taskId: string, newQuadrant: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, quadrant: newQuadrant } : task
      )
    )
  }

  const handleCopyTask = (task: Task) => {
    setCopiedTask(task)
  }

  const handlePasteTask = (quadrant: string) => {
    if (!copiedTask || !currentWeek) return

    // Check if pasting this task would exceed daily capacity
    const validation = canAllocateHours(
      copiedTask.startDate,
      copiedTask.dueDate,
      copiedTask.estimatedHours,
      weekTasks,
      currentWeek
    )

    if (!validation.canAllocate) {
      setPasteError(
        `Cannot paste task: Not enough capacity. Need ${copiedTask.estimatedHours}h but only ${validation.totalAvailable}h available (shortfall: ${validation.shortfall}h).`
      )
      return
    }

    const newTask = {
      ...copiedTask,
      id: crypto.randomUUID(),
      quadrant,
    }
    setTasks((prev) => [...prev, newTask])
    setCopiedTask(null)
  }

  // Handle ESC key to cancel copy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && copiedTask) {
        setCopiedTask(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [copiedTask])

  return (
    <div className="app-shell">
      <Header 
        title={title} 
        theme={theme} 
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        timeWindow={currentTimeWindow}
        onFinalizePlan={() => setShowCalendar(true)}
        onPreviousWeek={sortedWeeks.length > 1 ? handlePreviousWeek : undefined}
        onNextWeek={sortedWeeks.length > 1 ? handleNextWeek : undefined}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        currentWeekLabel={currentWeekLabel}
        onCopyWeek={currentWeek ? handleCopyWeek : undefined}
        onPasteWeek={currentWeek ? handlePasteWeek : undefined}
        canCopyWeek={canCopyWeek}
        canPasteWeek={canPasteWeek}
        tasks={weekTasks}
      />
      <div className="layout">
        <SideActions 
          onAddTask={handleAddClick} 
          onClear={handleClearTasks} 
          hasTasks={tasks.length > 0}
          helpMode={helpMode}
          onToggleHelp={() => setHelpMode(!helpMode)}
          balanceMode={balanceMode}
          onToggleBalance={() => setBalanceMode(!balanceMode)}
          onPlan={() => setShowPlanModal(true)}
          onViewCalendar={() => setShowCalendar(true)}
          onShowGuide={() => setShowGuide(true)}
        />
        <div className="matrix-main" style={{ marginTop: sortedWeeks.length > 1 ? '1rem' : 0 }}>
          <QuadrantGrid
            quadrants={quadrants}
            tasks={weekTasks}
            onEditTask={handleEdit}
            onDeleteTask={handleDelete}
            helpMode={helpMode}
            onMoveTask={handleMoveTask}
            balanceMode={balanceMode}
            onCopyTask={handleCopyTask}
            onPasteTask={handlePasteTask}
            copiedTask={copiedTask}
          />
        </div>
      </div>
      <Footer />
      <TaskModal
        key={`${editingTask?.id ?? 'new'}-${showModal}`}
        isOpen={showModal}
        quadrants={quadrantNames}
        onClose={handleCloseModal}
        onSave={upsertTask}
        initialTask={editingTask}
        timeWindow={currentTimeWindow}
        allTasks={tasks}
      />
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Tasks"
        message="Are you sure you want to delete all tasks? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
      <PlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSave={handlePlanUpdate}
        currentPlan={currentTimeWindow}
        existingPlans={weekPlans}
      />
      <CalendarView
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        tasks={tasks}
        startDate={combinedDateRange.startDate}
        endDate={combinedDateRange.endDate}
        hoursPerDay={currentWeek?.hoursPerDay || 8}
      />
      <GuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
      <ConfirmDialog
        isOpen={!!pasteError}
        title="Cannot Paste Task"
        message={pasteError}
        confirmText="OK"
        cancelText=""
        onConfirm={() => {
          setPasteError('')
          setCopiedTask(null)
        }}
        onCancel={() => {
          setPasteError('')
          setCopiedTask(null)
        }}
      />
    </div>
  )
}

export default App
