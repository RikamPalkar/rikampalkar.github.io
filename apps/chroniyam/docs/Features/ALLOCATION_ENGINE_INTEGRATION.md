# Hours Allocation Engine - Integration Guide

## Quick Start

### 1. Import the Engine
```typescript
import { validateAllocation, calculateCurrentHours } from '@/utils/hoursAllocationEngine'
```

### 2. Prepare Input Data
```typescript
const selectedDates = ['2025-12-26', '2025-12-27']  // User selected dates
const requestedHours = 10  // User entered hours
const allTasks = [...]  // Existing tasks from state
const currentHours = calculateCurrentHours(allTasks)
```

### 3. Validate
```typescript
const result = validateAllocation({
  selectedDates,
  requestedHours,
  currentHours,
  existingTaskId: taskBeingEdited?.id,
  allTasks
})
```

### 4. Handle Result
```typescript
if (result.isValid) {
  // Save the task
  onSaveTask(taskData)
} else {
  // Show error to user
  setError(result.errors[0])
}

// Always show warnings (if any)
if (result.warnings.length > 0) {
  showWarnings(result.warnings)
}
```

---

## Integration with TaskModal

The new engine should replace the old `hoursCalculator.ts` logic:

### Before (Old Logic)
```typescript
const remainingHours = getRemainingHoursForRange(...)
if (task.estimatedHours > remainingHours + 0.001) {
  return 'Not enough hours available...'
}
```

### After (New Engine)
```typescript
const allTasks = allTasks.filter(t => t.id !== initialTask?.id)
const currentHours = calculateCurrentHours(allTasks)
const result = validateAllocation({
  selectedDates: [task.startDate, task.dueDate],
  requestedHours: task.estimatedHours,
  currentHours,
  existingTaskId: initialTask?.id,
  allTasks
})

if (!result.isValid) {
  return result.errors[0]  // Clear error message
}
```

---

## Display Hints to Users

### Available Hours Hint
```typescript
<span>
  Max allocatable: {result.maxAllowableHours}h
  ({result.weeklyRemaining}h remaining this week)
</span>
```

### Per-Day Breakdown
```typescript
{Object.entries(result.perDayRemaining).map(([date, hours]) => (
  <div key={date}>
    {formatDate(date)}: {formatHours(hours)} available
  </div>
))}
```

### Warnings Section
```typescript
{result.warnings.map((warning, i) => (
  <p key={i} className="warning">{warning}</p>
))}
```

---

## Common Validation Patterns

### Pattern 1: Single-Day Task
```typescript
const result = validateAllocation({
  selectedDates: [singleDate],
  requestedHours: 5,
  currentHours
})

// Error if > 8h or weekly limit exceeded
```

### Pattern 2: Multi-Day Task (2 days)
```typescript
const result = validateAllocation({
  selectedDates: [day1, day2],
  requestedHours: 15,
  currentHours
})

// Error if sum of daily capacity < 15h
// or weekly remaining < 15h
```

### Pattern 3: Editing Existing Task
```typescript
const result = validateAllocation({
  selectedDates: [day1, day2],
  requestedHours: 12,
  currentHours,
  existingTaskId: existingTask.id,
  allTasks: allTasks
})

// Engine automatically excludes existingTask from capacity calc
```

---

## Error Handling Examples

### Daily Capacity Exceeded
```
User selects: Monday (already has 7h)
Requests: 3h
Available: 1h

Error: "Not enough daily capacity.
Requested: 3h
Available across selected days: 1h"
```

### Weekly Capacity Exceeded
```
User selects: Any day, but week has 55h used
Requests: 2h
Available: 1h (in week)

Error: "Not enough weekly capacity.
Requested: 2h
Available this week: 1h"
```

### Invalid Input
```
User selects: No days
Requests: 5h

Error: "At least one day must be selected."
```

---

## TypeScript Integration

### Type the Result
```typescript
import type { AllocationResult } from '@/utils/hoursAllocationEngine'

const result: AllocationResult = validateAllocation({...})

// TypeScript knows all properties
if (result.isValid) { ... }
result.maxAllowableHours  // ✓ type: number
result.errors  // ✓ type: string[]
```

### Type the Input
```typescript
// Use inline object or create type
const input: Parameters<typeof validateAllocation>[0] = {
  selectedDates: ['2025-12-26'],
  requestedHours: 5,
  currentHours: {},
}
```

---

## Real-World Example: Task Creation Flow

```typescript
const [result, setResult] = useState<AllocationResult | null>(null)

const handleTaskSubmit = (formData: TaskFormData) => {
  // 1. Prepare dates
  const selectedDates = getDateRange(formData.startDate, formData.dueDate)
  
  // 2. Calculate current hours
  const currentHours = calculateCurrentHours(allTasks)
  
  // 3. Validate
  const validationResult = validateAllocation({
    selectedDates,
    requestedHours: formData.estimatedHours,
    currentHours,
    existingTaskId: editingTaskId,
    allTasks
  })
  
  // 4. Check result
  if (!validationResult.isValid) {
    setError(validationResult.errors[0])
    return
  }
  
  // 5. Show warnings if any
  if (validationResult.warnings.length > 0) {
    showNotification('warning', validationResult.warnings.join('\n'))
  }
  
  // 6. Save task
  saveTask({
    ...formData,
    selectedDates,
    maxAllowable: validationResult.maxAllowableHours
  })
  
  // 7. Clear form
  resetForm()
}
```

---

## Testing the Integration

### Test Single-Day (Valid)
```typescript
// Day has 3h used, request 5h (should pass)
const result = validateAllocation({
  selectedDates: ['2025-12-26'],
  requestedHours: 5,
  currentHours: { '2025-12-26': 3 }
})
expect(result.isValid).toBe(true)
expect(result.maxAllowableHours).toBe(5)
```

### Test Multi-Day (Valid)
```typescript
// Sum of capacity is 12h, request 10h (should pass)
const result = validateAllocation({
  selectedDates: ['2025-12-26', '2025-12-27'],
  requestedHours: 10,
  currentHours: {
    '2025-12-26': 3,
    '2025-12-27': 4
  }
})
expect(result.isValid).toBe(true)
expect(result.maxAllowableHours).toBe(11) // 5h + 4h remaining
```

### Test Over Limit (Invalid)
```typescript
// Week full, request 1h (should fail)
const fullWeek = ['2025-12-22', '2025-12-23', '2025-12-24', 
                  '2025-12-25', '2025-12-26', '2025-12-27', '2025-12-28']
                 .reduce((acc, d) => ({ ...acc, [d]: 8 }), {})

const result = validateAllocation({
  selectedDates: ['2025-12-26'],
  requestedHours: 1,
  currentHours: fullWeek
})
expect(result.isValid).toBe(false)
expect(result.errors[0]).toContain('weekly')
```

---

## Migration from Old System

### Remove Old Code
Delete or deprecate:
- `src/utils/hoursCalculator.ts` (old algorithm)
- Related imports in components

### Update TaskModal
Replace validation logic with:
```typescript
import { validateAllocation, calculateCurrentHours } from '@/utils/hoursAllocationEngine'
// Use new validateAllocation() instead of old getRemainingHoursForRange()
```

### Update UI Hints
Use `result.perDayRemaining` instead of calling old functions

### Update Tests
Rewrite tests to use new engine's test cases

---

## Debugging

### Enable Debug Logging
```typescript
const result = validateAllocation({...})

console.log('Validation Result:', {
  isValid: result.isValid,
  errors: result.errors,
  warnings: result.warnings,
  maxAllowable: result.maxAllowableHours,
  perDay: result.perDayRemaining,
  weeklyRemaining: result.weeklyRemaining
})
```

### Common Issues

**Issue**: "isValid is false but no errors shown"
```
Check: result.errors.length should be > 0
Debug: console.log(result.errors)
```

**Issue**: "maxAllowableHours is less than expected"
```
Check: Is there a weekly limit issue?
Debug: console.log(result.weeklyRemaining)
```

**Issue**: "Warnings not showing"
```
Check: result.warnings.length > 0
Debug: console.log(result.warnings)
```

---

## Performance Notes

- **No external dependencies** - Pure TypeScript
- **O(n) complexity** - Linear in number of selected days
- **Instant validation** - No async operations
- **Small memory footprint** - Only stores date strings and numbers
- **Reusable calculations** - Call multiple times with different inputs

---

## Next Steps

1. **Create unit tests** for your specific use cases
2. **Replace old hoursCalculator** in TaskModal
3. **Update UI components** to show new result format
4. **Add warning notifications** in your UI
5. **Test edge cases** with real data
6. **Monitor performance** in production

---

## Support

For issues or questions:
1. Check `ALLOCATION_ENGINE_DESIGN.md` for algorithm details
2. Check `ALLOCATION_ENGINE_TESTS.md` for test cases
3. Review the source code: `src/utils/hoursAllocationEngine.ts`
4. Run tests to validate behavior
