# Hours Allocation Engine - Test Cases & Documentation

## Overview

This document provides comprehensive test cases for the Hours Allocation Engine, which manages time allocation across a weekly planning cycle with:
- **Daily limit**: 8 hours per day
- **Weekly limit**: 56 hours per week (7 days × 8)
- **Multi-day selection support**
- **Real-time capacity calculation**

---

## Test Suite: Daily Limit Tests

### Test 1: Prevent allocation exceeding daily limit
```typescript
Input:
  selectedDates: ['2025-12-26']
  requestedHours: 9
  currentHours: {}

Expected Output:
  isValid: false
  errors: ['Not enough daily capacity...']
  maxAllowableHours: 8
```

### Test 2: Allow full daily allocation (8 hours)
```typescript
Input:
  selectedDates: ['2025-12-26']
  requestedHours: 8
  currentHours: {}

Expected Output:
  isValid: true
  maxAllowableHours: 8
```

### Test 3: Calculate remaining hours correctly
```typescript
Input:
  dateStr: '2025-12-26'
  currentHours: { '2025-12-26': 3 }

Expected Output:
  remainingHours: 5
```

### Test 4: Return 0 for full day
```typescript
Input:
  dateStr: '2025-12-26'
  currentHours: { '2025-12-26': 8 }

Expected Output:
  remainingHours: 0
```

---

## Test Suite: Weekly Limit Tests

### Test 5: Prevent allocation exceeding weekly limit
```typescript
Input:
  selectedDates: ['2025-12-26'] (one day in full week)
  requestedHours: 1
  currentHours: {
    '2025-12-22': 8, // All 7 days full
    '2025-12-23': 8,
    '2025-12-24': 8,
    '2025-12-25': 8,
    '2025-12-26': 8,
    '2025-12-27': 8,
    '2025-12-28': 8
  }

Expected Output:
  isValid: false
  errors: ['Not enough weekly capacity...']
  weeklyRemaining: 0
```

### Test 6: Allow allocation within weekly limit
```typescript
Input:
  selectedDates: ['2025-12-28'] (one empty day)
  requestedHours: 8
  currentHours: {
    '2025-12-22': 8,
    '2025-12-23': 8,
    '2025-12-24': 8,
    '2025-12-25': 8,
    '2025-12-26': 8,
    '2025-12-27': 8
  }

Expected Output:
  isValid: true
  maxAllowableHours: 8
  weeklyRemaining: 0
```

---

## Test Suite: Multi-Day Selection Tests

### Test 7: Sum remaining capacity across selected days
```typescript
Input:
  selectedDates: ['2025-12-26', '2025-12-27']
  requestedHours: 11
  currentHours: {
    '2025-12-26': 1, // 7h remaining
    '2025-12-27': 4  // 4h remaining
  }

Expected Output:
  isValid: true
  maxAllowableHours: 11
  perDayRemaining: {
    '2025-12-26': 7,
    '2025-12-27': 4
  }
```

### Test 8: Reject allocation exceeding sum of remaining capacity
```typescript
Input:
  selectedDates: ['2025-12-26', '2025-12-27']
  requestedHours: 12
  currentHours: {
    '2025-12-26': 1, // 7h remaining
    '2025-12-27': 4  // 4h remaining (total 11h available)
  }

Expected Output:
  isValid: false
  errors: ['Not enough daily capacity. Requested: 12h, Available: 11h']
```

### Test 9: Warn about fully booked days in selection
```typescript
Input:
  selectedDates: ['2025-12-26', '2025-12-27']
  requestedHours: 5
  currentHours: {
    '2025-12-26': 8, // Full day
    '2025-12-27': 3
  }

Expected Output:
  isValid: true
  warnings: ['1 day is already full (8 hours allocated).']
  perDayRemaining: {
    '2025-12-26': 0,
    '2025-12-27': 5
  }
```

---

## Test Suite: Partial Availability Tests

### Test 10: Allow allocation in partially available day
```typescript
Input:
  selectedDates: ['2025-12-26']
  requestedHours: 5
  currentHours: { '2025-12-26': 3 }

Expected Output:
  isValid: true
  maxAllowableHours: 5
```

### Test 11: Reject allocation exceeding remaining capacity on partial day
```typescript
Input:
  selectedDates: ['2025-12-26']
  requestedHours: 6
  currentHours: { '2025-12-26': 3 } // Only 5h remaining

Expected Output:
  isValid: false
  errors: ['Not enough daily capacity. Requested: 6h, Available: 5h']
```

---

## Test Suite: Edge Cases

### Test 12: Handle empty selected dates
```typescript
Input:
  selectedDates: []
  requestedHours: 5
  currentHours: {}

Expected Output:
  isValid: false
  errors: ['At least one day must be selected.']
```

### Test 13: Handle zero hours requested
```typescript
Input:
  selectedDates: ['2025-12-26']
  requestedHours: 0
  currentHours: {}

Expected Output:
  isValid: false
  errors: ['Hours must be greater than 0.']
```

### Test 14: Handle negative hours
```typescript
Input:
  selectedDates: ['2025-12-26']
  requestedHours: -5
  currentHours: {}

Expected Output:
  isValid: false
  errors: ['Hours must be greater than 0.']
```

### Test 15: Handle multiple full days
```typescript
Input:
  selectedDates: ['2025-12-26', '2025-12-27', '2025-12-28']
  requestedHours: 5
  currentHours: {
    '2025-12-26': 8, // Full
    '2025-12-27': 8, // Full
    '2025-12-28': 3
  }

Expected Output:
  isValid: true
  warnings: ['2 days are already full (8 hours allocated).']
  maxAllowableHours: 5
```

---

## Test Suite: Per-Day Capacity Tests

### Test 16: Return correct capacity for each selected day
```typescript
Input:
  selectedDates: ['2025-12-26', '2025-12-27', '2025-12-28']
  currentHours: {
    '2025-12-26': 2,
    '2025-12-27': 0,
    '2025-12-28': 8
  }

Expected Output:
  capacity: {
    '2025-12-26': 6,
    '2025-12-27': 8,
    '2025-12-28': 0
  }
```

---

## Test Suite: Task Editing Tests

### Test 17: Exclude existing task from capacity calculation when editing
```typescript
Input:
  selectedDates: ['2025-12-26']
  requestedHours: 8
  currentHours: { '2025-12-26': 5 }
  existingTaskId: 'task-1'
  allTasks: [{
    id: 'task-1',
    startDate: '2025-12-26',
    dueDate: '2025-12-26',
    estimatedHours: 5
  }]

Expected Output:
  isValid: true (because task-1's 5h is excluded from calculation)
  maxAllowableHours: 8
```

---

## Test Suite: Week Date Functions

### Test 18: Return 7 dates for a week
```typescript
Input:
  date: any date in a week

Expected Output:
  dates: Array of 7 date strings from Monday to Sunday
  length: 7
```

### Test 19: Format week range correctly
```typescript
Input:
  date: 2025-12-26

Expected Output:
  formatted: 'Dec 22 - Dec 28, 2025'
```

---

## Test Suite: Calculate Current Hours

### Test 20: Calculate hours per day from multi-day tasks
```typescript
Input:
  tasks: [{
    startDate: '2025-12-26',
    dueDate: '2025-12-27',
    estimatedHours: 16 // 8h per day across 2 days
  }]

Expected Output:
  currentHours: {
    '2025-12-26': 8,
    '2025-12-27': 8
  }
```

---

## Example Scenarios

### Scenario 1: Basic Single-Day Booking
```
Week capacity: 56 hours (8h/day × 7 days)
User wants to book: 5 hours on Monday
Current usage: 0 hours

Validation Result:
✓ Valid - 5h ≤ 8h daily + 5h ≤ 56h weekly
```

### Scenario 2: Multi-Day Task
```
Week capacity: 56 hours
Days selected: Monday (1h used) & Tuesday (4h used)
User wants: 10 hours across 2 days

Available: 7h + 4h = 11h
Requested: 10h

Validation Result:
✓ Valid - 10h ≤ 11h available
Distribution: 5h per day
```

### Scenario 3: At Weekly Capacity
```
Week capacity: 56 hours
Monday-Saturday: 8h each = 48h used
Sunday: Empty = 8h remaining
User wants: 10 hours on any day

Validation Result:
✗ Invalid - 10h > 8h remaining in week
```

### Scenario 4: Mixed Full/Partial Days
```
Days selected: Monday (full), Tuesday (3h used), Wednesday (empty)
User wants: 12 hours

Available capacity:
- Monday: 0h
- Tuesday: 5h
- Wednesday: 8h
Total: 13h

Warnings: "1 day is already full"
Validation Result:
✓ Valid - 12h ≤ 13h
Maximum allocatable: 13h
```

---

## API Reference

### `validateAllocation(input)`
Main function for validating hour allocation requests.

**Input:**
```typescript
{
  selectedDates: string[]  // YYYY-MM-DD format
  requestedHours: number
  currentHours: Record<string, number>  // hours by date
  existingTaskId?: string
  allTasks?: Task[]
}
```

**Output:**
```typescript
{
  isValid: boolean
  maxAllowableHours: number
  weeklyRemaining: number
  perDayRemaining: Record<string, number>
  errors: string[]
  warnings: string[]
}
```

### `getRemainingHoursForDay(dateStr, currentHours)`
Get remaining capacity for a specific day.

### `getWeekDates(date)`
Get all 7 dates in a week.

### `calculateCurrentHours(tasks)`
Calculate total hours allocated per day from task list.

---

## Edge Cases Handled

✅ Empty date selection  
✅ Zero/negative hours  
✅ Single full day  
✅ Multiple full days  
✅ Mixed full and partial days  
✅ Week boundary spanning  
✅ Task editing/exclusion  
✅ Fractional hour distribution  
✅ Real-time recalculation  
✅ Clear error messages with specifics  

---

## Implementation Notes

- Daily limit: 8 hours (configurable via `DAILY_LIMIT` constant)
- Weekly limit: 56 hours (7 days × 8 hours)
- Week starts on Monday, ends on Sunday
- All dates in YYYY-MM-DD format (ISO standard)
- All times set to 00:00:00 UTC for consistency
- Floating-point safe through rounding to 1 decimal
- Multi-day tasks distribute hours evenly across days
- Remainders allocated to last day of task
