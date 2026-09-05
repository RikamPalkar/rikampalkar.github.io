# Smart Hours Calculation Algorithm

## Overview
This algorithm provides intelligent capacity management for task scheduling across multiple days. It calculates remaining hours per day while accounting for multi-day tasks that distribute their hours across each day they span.

## Core Concept
Instead of tracking total hours, we track **remaining hours per day**. When a task spans multiple days, its hours are distributed evenly across all days it occupies.

## Algorithm Flow

### 1. **Initialize Daily Capacity**
```
For each day in timeWindow:
  remainingHours[day] = timeWindow.hoursPerDay
```

Example: 8h/day for 3 days = 24h total capacity
```
Day 1: 8h
Day 2: 8h
Day 3: 8h
```

### 2. **Distribute Task Hours Across Days**
When a task is created/updated:
```
taskDays = all dates from startDate to dueDate (inclusive)
hoursPerDay = task.estimatedHours / taskDays.length

For each day in taskDays:
  remainingHours[day] -= hoursPerDay
```

Example: 15-hour task spanning 2 days
```
hoursPerDay = 15h / 2 = 7.5h per day

Day 1: 8h - 7.5h = 0.5h remaining
Day 2: 8h - 7.5h = 0.5h remaining
```

### 3. **Validate New Tasks**
Before saving a task, check:
```
tasksToCheck = allTasks excluding the current task being edited

1. Date Validation
   - dueDate >= startDate

2. Capacity Validation
   remainingHours = sum of remaining hours across task's date range
   
   If remainingHours < task.estimatedHours:
     → Show error with breakdown of available hours per day
     → Block task creation
   
3. Automatic Adjustment
   - When existing task is deleted, hours are freed on all its days
   - When dates change, recalculation happens automatically
   - When hours change, per-day distribution updates
```

## Validation Examples

### Example 1: Single-Day Task
User: 8h/day, Day 1 has no tasks
```
Remaining: 8h
Adding: 5h task on Day 1
Result: ✓ Allowed (5h <= 8h)
New remaining: 3h
```

### Example 2: Multi-Day Task
User: 8h/day for 2 days (16h total)
```
Day 1: 8h available
Day 2: 8h available

Adding: 15h task from Day 1 to Day 2
Distribution: 7.5h per day
Day 1: 8h - 7.5h = 0.5h left
Day 2: 8h - 7.5h = 0.5h left
Result: ✓ Allowed (15h <= 16h total)
```

### Example 3: Insufficient Capacity
User: 8h/day for 2 days (16h total)
Day 1: Has 8h task (0h remaining)
Day 2: Empty (8h remaining)
```
Adding: 10h task from Day 1 to Day 2
Available: 0h + 8h = 8h
Needed: 10h
Result: ✗ Rejected with error showing:
  "Not enough hours across these days"
  "Available: 8h"
  "Breakdown: Dec 26: 0h, Dec 27: 8h"
```

### Example 4: Task Deletion Frees Hours
Initial state: Day 1-2 has 15h task (7.5h/day used)
```
Day 1: 8h - 7.5h = 0.5h remaining
Day 2: 8h - 7.5h = 0.5h remaining

User deletes the 15h task
Now calculations ignore it:
Day 1: 8h remaining
Day 2: 8h remaining
```

## Key Features

✅ **Automatic Distribution**: Hours spread evenly across all task days
✅ **Real-time Updates**: UI shows remaining hours dynamically as you change dates/hours
✅ **Smart Feedback**: Error messages show per-day breakdown when capacity is exceeded
✅ **Cascading Updates**: Deleting a task immediately frees hours
✅ **Edit Support**: Changing a task recalculates all affected days
✅ **Date Range Flexibility**: Works with single-day or multi-day tasks

## Implementation Details

### Helper Functions

1. **getRemainingHoursByDay(tasks, timeWindow)**
   - Returns `Map<date, remainingHours>` for entire time window
   - Used for all calculations

2. **getRemainingHoursForDate(date, tasks, timeWindow)**
   - Returns remaining hours for a specific day

3. **getRemainingHoursForRange(startDate, endDate, tasks, timeWindow)**
   - Returns total remaining hours across a date range
   - Used for multi-day task validation

4. **getCapacityBreakdown(startDate, endDate, tasks, timeWindow)**
   - Returns detailed breakdown: `{date: remainingHours, ...}`
   - Used in error messages to show per-day availability

## Benefits

1. **Prevents Overbooking**: Ensures total capacity is never exceeded
2. **Fair Distribution**: Multi-day tasks don't hog any single day
3. **Flexibility**: Users can work with any task duration
4. **Transparency**: Clear feedback on available capacity
5. **Consistency**: All validations use the same algorithm
6. **No Manual Calculation**: Automatic distribution of hours
