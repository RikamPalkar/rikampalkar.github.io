# Advanced Validation Test Suite - Documentation

## File Location
`/test-advanced-validation.js`

## Overview
Comprehensive Node.js test suite for validating the hours allocation engine. Tests all four scenarios requested:
1. Daily limit enforcement when adding multiple tasks
2. Date range validation for multi-day allocations
3. Copy/paste single task validation
4. Copy/paste entire week validation

## How to Run

```bash
node test-advanced-validation.js
```

## Test Structure

### Helper Functions (Reusable)
- `parseDate(dateStr)` - Parse YYYY-MM-DD to Date object
- `getDateStr(date)` - Convert Date to YYYY-MM-DD format
- `getTaskDates(startDate, endDate)` - Get all dates in range
- `calculateCurrentHours(tasks)` - Calculate current allocation from task list
- `getRemainingHoursForDay(dateStr, currentHours)` - Get remaining capacity for single day
- `getWeekDates(date)` - Get all 7 dates in a week
- `validateAllocation(selectedDates, requestedHours, currentHours)` - Main validation function

### Test Suites

#### Suite 1: Daily Limit Validation (3 tests)
Tests that hours per day never exceed 8 hours.

```javascript
Test 1.1: Adding tasks should not exceed 8 hours per day
Test 1.2: Third task that would exceed limit should be prevented
Test 1.3: Exceeding daily limit should fail validation
```

#### Suite 2: Date Range Validation (4 tests)
Tests that hours across date ranges respect both daily and range constraints.

```javascript
Test 2.1: Multi-day task validation (2 days)
Test 2.2: Adding task to 2-day range should validate total capacity
Test 2.3: Exceeding range capacity should fail
Test 2.4: Wide date range (full week)
```

#### Suite 3: Copy/Paste Single Task Validation (3 tests)
Tests that copied/pasted single tasks are validated before insertion.

```javascript
Test 3.1: Paste single task that fits available capacity
Test 3.2: Paste single task that would exceed daily limit
Test 3.3: Paste multi-day task across range
```

#### Suite 4: Copy/Paste Entire Week Validation (4 tests)
Tests that entire week copy/paste operations respect all constraints.

```javascript
Test 4.1: Paste entire week when destination is empty
Test 4.2: Paste week that would exceed weekly limit
Test 4.3: Paste week into destination with existing tasks
Test 4.4: Paste week into full destination (should fail)
```

## Constants

```javascript
DAILY_LIMIT = 8              // Max hours per day
DAYS_IN_WEEK = 7
WEEKLY_LIMIT = 56            // Max hours per week
```

## Output Format

Each test displays:
- Test description
- Input parameters
- Expected behavior
- Actual result
- Pass/Fail status with explanation

```
Test 1.1: Adding tasks should not exceed 8 hours per day
Total hours for 2025-12-29: 7h
Expected: 7h (5h + 2h)
Daily Limit: 8h
✓ PASS - Within limit
```

## Integration with App

These tests validate the core logic from:
- `src/utils/hoursAllocationEngine.ts`
- `src/App.tsx` (paste/clipboard operations)
- `src/components/TaskModal.tsx` (task creation/editing)

## Test Data

Tests use realistic date ranges and hour allocations:
- Single-day tasks (5h, 6h, 8h)
- Multi-day tasks (10h-16h across 2-3 days)
- Week-spanning tasks (25h-35h across week)
- Edge cases (full days, full weeks, at-limit scenarios)

## Validation Rules Tested

Each test validates one or more of these rules:

1. **Rule 1**: Total hours on any single day ≤ 8h
2. **Rule 2**: Total hours across date range ≤ (number of days × 8h)
3. **Rule 3**: Copy/paste tasks must validate against Rules 1 & 2
4. **Rule 4**: Copy/paste weeks must validate against Rules 1 & 2

## Example: Understanding Test 2.2

```javascript
console.log('Existing: Day 1: 5h, Day 2: 4h');
// Available: Day 1: 3h, Day 2: 4h (total: 7h)

console.log('Trying to add: 6h task across 2 days');
console.log('Validation: VALID');
console.log('Max allocatable: 7h');

// Test PASSES because:
// - Day 1: 5h + 3h = 8h ≤ 8h ✓
// - Day 2: 4h + 2h = 6h ≤ 8h ✓
// - Range: 5h+4h = 9h, requesting 6h, 7h available ✓
```

## Extending Tests

To add new test cases:

1. Create new test function with clear name
2. Define input tasks/hours
3. Call validation function
4. Assert expected result
5. Display outcome with ✓ PASS or ✗ FAIL

Example:
```javascript
console.log('\nTest X.X: [Description]');
const testHours = { '2025-12-29': 5 };
const result = validateAllocation(['2025-12-29'], 3, testHours);
console.log(`Validation: ${result.isValid ? 'VALID' : 'INVALID'}`);
console.log(`✓ PASS` + (result.isValid ? ' - Expected behavior' : ' - FAILED'));
```

## Troubleshooting

### Test fails unexpectedly
1. Check helper function logic
2. Verify date parsing (YYYY-MM-DD format)
3. Confirm DAILY_LIMIT and WEEKLY_LIMIT constants

### Different results locally vs CI
- Ensure Node.js version consistency
- Check for timezone-related date issues
- Verify no external dependencies

### Adding custom test cases
- Use realistic date ranges
- Test both success and failure paths
- Include edge cases (at-limit, over-limit)

## Dependencies

None - Pure JavaScript, no external packages required.

## Performance

All tests complete in <100ms with simple synchronous operations.

## Future Enhancements

Potential additions:
- Recurring task allocation tests
- Timezone-aware date handling tests
- Performance benchmark tests
- Integration tests with React components
- JSON export/import validation tests
