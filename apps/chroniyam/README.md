## ChroNiyam

A minimal, focused task management application built on the Eisenhower Matrix principle. ChroNiyam brings discipline and structure to your time through prioritized task organization.

### About the Name

"ChroNiyam" combines two concepts:
- **Chro** – from "chronological," relating to time and its ordered flow
- **Niyam** – a Sanskrit word meaning "discipline," "rules," or "protocol"

Together, it represents the idea of bringing structured discipline to time management.

### Purpose

ChroNiyam helps you categorize and manage tasks based on their urgency and importance. By organizing work across four quadrants, you gain clarity on what truly matters and where your time should be invested for maximum impact and minimal stress.

### Features

#### Core Task Management
- **Four-Quadrant Task Matrix** – Organize tasks into Do First, Schedule, Delegate, and Eliminate quadrants
- **Task Management** – Add, edit, delete, and organize tasks with rich details
- **Smart Organization**
  - Do First: Urgent and Important (crisis mode)
  - Schedule: Not Urgent but Important (strategic planning)
  - Delegate: Urgent but Not Important (distractions)
  - Eliminate: Not Urgent and Not Important (time wasters)

#### Hours Allocation & Planning
- **Hours Estimation** – Assign estimated hours to each task
- **Advanced Allocation Engine** – Intelligent hour distribution across task dates with:
  - Daily limit validation (8 hours per day)
  - Weekly limit validation (56 hours per week)
  - Multi-day task support with fair distribution
  - Real-time capacity feedback
  - Task editing with automatic adjustment
- **Week Planning** – Define specific time windows with custom daily hour allocations
- **Calendar View** – Visual weekly and monthly task calendar with hours allocation
- **Paste/Duplicate Tasks** – Copy tasks or entire week templates from clipboard (JSON format)
- **Task Copying** – Clone individual tasks or duplicate entire week plans

#### Insights & Validation
- **Balance Validator** – Real-time analysis of task distribution with:
  - Visual balance bar showing quadrant percentages
  - Health benchmarks (Q1: 15-25%, Q2: 50-65%, Q3: 5-15%, Q4: 5-15%)
  - Health status indicators (healthy, warning, critical)
  - Actionable recommendations
- **Hours Tracker** – Display current week's allocations and remaining capacity
- **Allocation Feedback** – Clear validation messages for allocation conflicts

#### User Experience
- **Guide Mode** – Interactive help explaining the Eisenhower Matrix and best practices
- **Theme Support** – Toggle between light and dark themes with system preference detection
- **Help Mode** – Detailed tooltips explaining the purpose of each quadrant
- **Persistent Storage** – All tasks, plans, and preferences saved locally in your browser
- **Clean UI** – Minimal design with no unnecessary clutter, keeping focus on task management

### Stack

- React 19, TypeScript, Vite
- ESLint (flat config)

### Getting Started

**Install dependencies:**
```bash
npm install
```

**Development:**
```bash
npm run dev
```

**Linting:**
```bash
npm run lint
```

**Build:**
```bash
npm run build
```

### Project Structure

- `src/App.tsx` – Main application component managing state and quadrants
- `src/components/` – Reusable UI components for tasks, modals, and controls
- `src/types/quadrant.ts` – TypeScript type definitions
- `src/index.css` – Layout and styling for quadrants

### How to Use

#### Managing Tasks
1. Click the add button to create a new task
2. Enter task details: title, description, estimated hours, and date range
3. Select which quadrant the task belongs to based on urgency and importance
4. The system validates that your allocation doesn't exceed:
   - 8 hours per day
   - 56 hours per week
5. Delete or edit tasks as priorities change

#### Planning & Scheduling
1. Use the "Plan" button to create weekly time windows with specific hour allocations
2. View your calendar to see task distribution across weeks
3. Define custom daily hour targets (default: 8 hours/day)
4. Plan for current week or schedule future weeks

#### Copying & Duplicating Tasks
1. **Copy individual task**: Click the copy icon on a task card to copy to clipboard as JSON
2. **Paste tasks**: Use the paste button to import tasks from clipboard
3. **Duplicate week**: Copy an entire week's tasks to reuse as a template
4. **Automatic validation**: Pasted tasks are validated against existing allocations

#### Using Insights
1. Enable **Balance Mode** to view task distribution analysis:
   - Visual percentage breakdown across quadrants
   - Health status with color indicators
   - Recommendations to improve balance
2. Check the **Hours Tracker** to see:
   - Current week's allocated hours
   - Remaining capacity per day
   - Weekly remaining hours
3. Enable **Guide Mode** to understand:
   - Purpose of each quadrant
   - Best practices for time management
   - Allocation engine explanations
4. Use **Help Mode** (tooltip) for quick explanations on any component

### Hours Allocation & Validation

The app uses a sophisticated allocation engine that ensures realistic time planning:

**Daily Limit**: 8 hours per day (configurable per week plan)
**Weekly Limit**: 56 hours per week (7 days × 8 hours)

**Key Features**:
- Multi-day tasks distribute hours fairly across selected days
- Weekly capacity prevents over-allocation
- Task editing excludes previous hours from capacity calculation
- Clear error messages when allocation conflicts occur
- Warnings for almost-full days
- Real-time feedback on available capacity

**Validation Rules**:
- Single task cannot exceed 8 hours on any day
- Total weekly hours cannot exceed 56
- Pasted tasks are validated against existing allocations
- Recurring tasks (if enabled) add hours to each selected day

### License

Copyright (c) 2025 Rikam Palkar. All rights reserved.

This source code is proprietary and may not be copied, modified, distributed, or used without explicit written permission from the author. See the LICENSE file for details.
