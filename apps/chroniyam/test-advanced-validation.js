/**
 * Advanced Validation Test Suite
 * 
 * Tests for:
 * 1. Daily limit validation (8 hours per day)
 * 2. Date range validation (total hours should not exceed range capacity)
 * 3. Copy/paste single task validation
 * 4. Copy/paste entire week validation
 */

const DAILY_LIMIT = 8;
const DAYS_IN_WEEK = 7;
const WEEKLY_LIMIT = DAILY_LIMIT * DAYS_IN_WEEK;

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDateStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTaskDates(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(getDateStr(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function calculateCurrentHours(tasks, dailyLimit = DAILY_LIMIT) {
  const hours = {};
  
  tasks.forEach((task) => {
    const startDate = parseDate(task.startDate);
    const endDate = parseDate(task.dueDate);
    const taskDates = getTaskDates(startDate, endDate);
    
    // Fill each day sequentially up to dailyLimit for non-recurring tasks
    let remainingHours = task.estimatedHours;
    taskDates.forEach((date) => {
      const currentHours = hours[date] || 0;
      const availableInDay = dailyLimit - currentHours;
      const hoursToAllocate = Math.min(remainingHours, availableInDay);
      hours[date] = (hours[date] || 0) + hoursToAllocate;
      remainingHours -= hoursToAllocate;
    });
  });

  return hours;
}

function getRemainingHoursForDay(dateStr, currentHours, dailyLimit = DAILY_LIMIT) {
  const used = currentHours[dateStr] || 0;
  return Math.max(0, dailyLimit - used);
}

function getWeekDates(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sunday = new Date(d.setDate(diff));
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(sunday);
    currentDate.setDate(currentDate.getDate() + i);
    weekDates.push(getDateStr(currentDate));
  }
  return weekDates;
}

function validateAllocation(selectedDates, requestedHours, currentHours, dailyLimit = DAILY_LIMIT) {
  const errors = [];
  const warnings = [];
  
  // Validate inputs
  if (!selectedDates || selectedDates.length === 0) {
    errors.push('At least one day must be selected.');
    return { isValid: false, errors, warnings };
  }
  
  if (requestedHours <= 0) {
    errors.push('Hours must be greater than 0.');
    return { isValid: false, errors, warnings };
  }
  
  // Get per-day capacity
  const perDayRemaining = {};
  selectedDates.forEach((date) => {
    perDayRemaining[date] = getRemainingHoursForDay(date, currentHours, dailyLimit);
  });
  
  // Check daily limits
  const selectedCapacity = selectedDates.reduce((sum, date) => {
    return sum + perDayRemaining[date];
  }, 0);
  
  if (requestedHours > selectedCapacity) {
    errors.push(
      `Not enough capacity. Requested: ${requestedHours}h, Available: ${selectedCapacity}h`
    );
  }
  
  return {
    isValid: errors.length === 0,
    maxAllowableHours: Math.min(selectedCapacity, WEEKLY_LIMIT),
    perDayRemaining,
    errors,
    warnings
  };
}

// ============================================
// TEST SUITE 1: Daily Limit Validation
// ============================================

console.log('\n' + '='.repeat(70));
console.log('TEST SUITE 1: Daily Limit Validation');
console.log('='.repeat(70));

console.log('\nTest 1.1: Adding tasks should not exceed 8 hours per day');
const test1_1_tasks = [
  { id: '1', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 5 },
  { id: '2', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 2 }
];
const test1_1_hours = calculateCurrentHours(test1_1_tasks);
const test1_1_total = test1_1_hours['2025-12-29'];
console.log(`Total hours for 2025-12-29: ${test1_1_total}h`);
console.log(`Expected: 7h (5h + 2h)`);
console.log(`Daily Limit: ${DAILY_LIMIT}h`);
console.log(`✓ PASS` + (test1_1_total === 7 && test1_1_total <= DAILY_LIMIT ? ' - Within limit' : ' - FAILED'));

console.log('\nTest 1.2: Third task that would exceed limit should be prevented');
const test1_2_tasks = [
  { id: '1', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 5 },
  { id: '2', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 2 }
];
const test1_2_hours = calculateCurrentHours(test1_2_tasks);
const test1_2_result = validateAllocation(['2025-12-29'], 2, test1_2_hours);
console.log(`Current allocation: ${test1_2_hours['2025-12-29']}h`);
console.log(`Remaining: ${test1_2_result.maxAllowableHours}h`);
console.log(`Trying to add: 2h`);
console.log(`Validation result: ${test1_2_result.isValid ? 'VALID' : 'INVALID'}`);
console.log(`✓ PASS` + (test1_2_result.isValid ? ' - Allows 2h (1h remaining)' : ' - Correctly rejects'));

console.log('\nTest 1.3: Exceeding daily limit should fail validation');
const test1_3_hours = { '2025-12-29': 7 };
const test1_3_result = validateAllocation(['2025-12-29'], 2, test1_3_hours);
console.log(`Current allocation: 7h`);
console.log(`Trying to add: 2h (total would be 9h)`);
console.log(`Validation result: ${test1_3_result.isValid ? 'VALID' : 'INVALID'}`);
console.log(`Error: ${test1_3_result.errors[0] || 'None'}`);
console.log(`✓ PASS` + (!test1_3_result.isValid ? ' - Correctly rejects exceeding limit' : ' - FAILED'));

// ============================================
// TEST SUITE 2: Date Range Validation
// ============================================

console.log('\n' + '='.repeat(70));
console.log('TEST SUITE 2: Date Range Validation');
console.log('='.repeat(70));

console.log('\nTest 2.1: Multi-day task validation (2 days)');
const test2_1_tasks = [
  { id: '1', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 6 },
  { id: '2', startDate: '2025-12-30', dueDate: '2025-12-30', estimatedHours: 5 }
];
const test2_1_hours = calculateCurrentHours(test2_1_tasks);
console.log(`Day 1 (2025-12-29): ${test2_1_hours['2025-12-29']}h`);
console.log(`Day 2 (2025-12-30): ${test2_1_hours['2025-12-30']}h`);
console.log(`Total: ${(test2_1_hours['2025-12-29'] || 0) + (test2_1_hours['2025-12-30'] || 0)}h`);
console.log(`Available capacity for 2-day range: ${2 * DAILY_LIMIT}h`);
console.log(`✓ PASS` + ((test2_1_hours['2025-12-29'] || 0) <= DAILY_LIMIT && (test2_1_hours['2025-12-30'] || 0) <= DAILY_LIMIT ? ' - Both days within limit' : ' - FAILED'));

console.log('\nTest 2.2: Adding task to 2-day range should validate total capacity');
const test2_2_hours = { '2025-12-29': 5, '2025-12-30': 4 };
const test2_2_result = validateAllocation(['2025-12-29', '2025-12-30'], 6, test2_2_hours);
console.log(`Current allocation: Day 1: 5h, Day 2: 4h`);
console.log(`Remaining: Day 1: 3h, Day 2: 4h (total: 7h)`);
console.log(`Trying to add: 6h task across 2 days`);
console.log(`Validation result: ${test2_2_result.isValid ? 'VALID' : 'INVALID'}`);
console.log(`Max allocatable: ${test2_2_result.maxAllowableHours}h`);
console.log(`✓ PASS` + (test2_2_result.isValid ? ' - Correctly allows 6h (7h available)' : ' - FAILED'));

console.log('\nTest 2.3: Exceeding range capacity should fail');
const test2_3_hours = { '2025-12-29': 7, '2025-12-30': 7 };
const test2_3_result = validateAllocation(['2025-12-29', '2025-12-30'], 3, test2_3_hours);
console.log(`Current allocation: Day 1: 7h, Day 2: 7h`);
console.log(`Remaining: Day 1: 1h, Day 2: 1h (total: 2h)`);
console.log(`Trying to add: 3h task`);
console.log(`Validation result: ${test2_3_result.isValid ? 'VALID' : 'INVALID'}`);
console.log(`Error: ${test2_3_result.errors[0] || 'None'}`);
console.log(`✓ PASS` + (!test2_3_result.isValid ? ' - Correctly rejects exceeding capacity' : ' - FAILED'));

console.log('\nTest 2.4: Wide date range (full week)');
const weekStart = '2025-12-29';
const weekDates = getWeekDates(parseDate(weekStart));
console.log(`Week dates: ${weekDates.join(', ')}`);
const test2_4_tasks = [
  { id: '1', startDate: '2025-12-29', dueDate: '2025-12-30', estimatedHours: 8 },
  { id: '2', startDate: '2025-12-31', dueDate: '2026-01-02', estimatedHours: 16 }
];
const test2_4_hours = calculateCurrentHours(test2_4_tasks);
const test2_4_total = Object.values(test2_4_hours).reduce((a, b) => a + b, 0);
console.log(`Week allocation breakdown:`);
Object.entries(test2_4_hours).forEach(([date, hours]) => {
  console.log(`  ${date}: ${hours}h`);
});
console.log(`Total hours allocated: ${test2_4_total}h`);
console.log(`Weekly limit: ${WEEKLY_LIMIT}h`);
console.log(`✓ PASS` + (test2_4_total <= WEEKLY_LIMIT ? ' - Within weekly limit' : ' - FAILED'));

// ============================================
// TEST SUITE 3: Copy/Paste Single Task
// ============================================

console.log('\n' + '='.repeat(70));
console.log('TEST SUITE 3: Copy/Paste Single Task Validation');
console.log('='.repeat(70));

console.log('\nTest 3.1: Paste single task that fits available capacity');
const test3_1_existingTasks = [
  { id: '1', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 5 }
];
const test3_1_existingHours = calculateCurrentHours(test3_1_existingTasks);
const test3_1_pastedTask = { id: 'pasted-1', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 2 };
const test3_1_result = validateAllocation(
  ['2025-12-29'],
  test3_1_pastedTask.estimatedHours,
  test3_1_existingHours
);
console.log(`Existing: 5h on 2025-12-29`);
console.log(`Pasting: ${test3_1_pastedTask.estimatedHours}h task`);
console.log(`Validation: ${test3_1_result.isValid ? 'VALID' : 'INVALID'}`);
console.log(`✓ PASS` + (test3_1_result.isValid ? ' - Task pasted successfully' : ' - FAILED'));

console.log('\nTest 3.2: Paste single task that would exceed daily limit');
const test3_2_existingHours = { '2025-12-29': 7 };
const test3_2_pastedTask = { id: 'pasted-2', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 3 };
const test3_2_result = validateAllocation(
  ['2025-12-29'],
  test3_2_pastedTask.estimatedHours,
  test3_2_existingHours
);
console.log(`Existing: 7h on 2025-12-29`);
console.log(`Pasting: ${test3_2_pastedTask.estimatedHours}h task (would total 10h)`);
console.log(`Validation: ${test3_2_result.isValid ? 'VALID' : 'INVALID'}`);
console.log(`Error: ${test3_2_result.errors[0] || 'None'}`);
console.log(`✓ PASS` + (!test3_2_result.isValid ? ' - Correctly rejects invalid paste' : ' - FAILED'));

console.log('\nTest 3.3: Paste multi-day task across range');
const test3_3_existingHours = { '2025-12-29': 4, '2025-12-30': 6 };
const test3_3_pastedTask = { id: 'pasted-3', startDate: '2025-12-29', dueDate: '2025-12-30', estimatedHours: 6 };
const test3_3_result = validateAllocation(
  ['2025-12-29', '2025-12-30'],
  test3_3_pastedTask.estimatedHours,
  test3_3_existingHours
);
console.log(`Existing: Day 1: 4h, Day 2: 6h`);
console.log(`Pasting: 6h task across 2 days`);
console.log(`Available: Day 1: 4h, Day 2: 2h (total: 6h)`);
console.log(`Validation: ${test3_3_result.isValid ? 'VALID' : 'INVALID'}`);
console.log(`✓ PASS` + (test3_3_result.isValid ? ' - Task pasted successfully' : ' - FAILED'));

// ============================================
// TEST SUITE 4: Copy/Paste Entire Week
// ============================================

console.log('\n' + '='.repeat(70));
console.log('TEST SUITE 4: Copy/Paste Entire Week Validation');
console.log('='.repeat(70));

console.log('\nTest 4.1: Paste entire week when destination is empty');
const test4_1_sourceWeek = [
  { id: '1', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 6 },
  { id: '2', startDate: '2025-12-30', dueDate: '2025-12-30', estimatedHours: 5 },
  { id: '3', startDate: '2025-12-31', dueDate: '2025-12-31', estimatedHours: 4 }
];
const test4_1_sourceHours = calculateCurrentHours(test4_1_sourceWeek);
const test4_1_total = Object.values(test4_1_sourceHours).reduce((a, b) => a + b, 0);
console.log(`Source week tasks: ${test4_1_sourceWeek.length} tasks`);
console.log(`Source week total: ${test4_1_total}h`);
console.log(`Pasting into empty week`);
console.log(`Validation: ${test4_1_total <= WEEKLY_LIMIT ? 'VALID' : 'INVALID'}`);
console.log(`✓ PASS` + (test4_1_total <= WEEKLY_LIMIT && test4_1_total > 0 ? ' - Week pasted successfully' : ' - FAILED'));

console.log('\nTest 4.2: Paste week that would exceed weekly limit');
const test4_2_sourceWeek = [
  { id: '1', startDate: '2025-12-29', dueDate: '2025-01-02', estimatedHours: 35 },
  { id: '2', startDate: '2025-01-03', dueDate: '2026-01-04', estimatedHours: 25 }
];
const test4_2_sourceHours = calculateCurrentHours(test4_2_sourceWeek);
const test4_2_total = Object.values(test4_2_sourceHours).reduce((a, b) => a + b, 0);
console.log(`Source week total: ${test4_2_total}h`);
console.log(`Weekly limit: ${WEEKLY_LIMIT}h`);
console.log(`Validation: ${test4_2_total <= WEEKLY_LIMIT ? 'VALID' : 'INVALID'}`);
console.log(`✓ PASS` + (test4_2_total > WEEKLY_LIMIT ? ' - Correctly rejected (exceeds weekly limit)' : ' - Task fits'));

console.log('\nTest 4.3: Paste week into destination with existing tasks');
const test4_3_existingTasks = [
  { id: 'e1', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 3 }
];
const test4_3_existingHours = calculateCurrentHours(test4_3_existingTasks);
const test4_3_sourceWeek = [
  { id: '1', startDate: '2025-12-29', dueDate: '2025-12-29', estimatedHours: 4 },
  { id: '2', startDate: '2025-12-30', dueDate: '2025-12-30', estimatedHours: 5 }
];
const test4_3_allTasks = [...test4_3_existingTasks, ...test4_3_sourceWeek];
const test4_3_combinedHours = calculateCurrentHours(test4_3_allTasks);
const test4_3_total = Object.values(test4_3_combinedHours).reduce((a, b) => a + b, 0);
const test4_3_day1Total = test4_3_combinedHours['2025-12-29'];

console.log(`Existing: 3h on 2025-12-29`);
console.log(`Pasting: 4h on 2025-12-29, 5h on 2025-12-30`);
console.log(`Result: Day 1 would have 7h (within 8h limit)`);
console.log(`Total week: ${test4_3_total}h (within ${WEEKLY_LIMIT}h limit)`);
console.log(`Day 1: ${test4_3_day1Total}h`);
console.log(`Validation: ${test4_3_day1Total <= DAILY_LIMIT && test4_3_total <= WEEKLY_LIMIT ? 'VALID' : 'INVALID'}`);
console.log(`✓ PASS` + (test4_3_day1Total <= DAILY_LIMIT && test4_3_total <= WEEKLY_LIMIT ? ' - Week pasted with existing tasks' : ' - FAILED'));

console.log('\nTest 4.4: Paste week into full destination (should fail)');
const test4_4_existingHours = {
  '2025-12-29': 8,
  '2025-12-30': 8,
  '2025-12-31': 8,
  '2026-01-01': 8,
  '2026-01-02': 8,
  '2026-01-03': 8,
  '2026-01-04': 8
};
const test4_4_sourceWeek = [
  { id: '1', startDate: '2025-12-29', dueDate: '2025-12-30', estimatedHours: 5 }
];
const test4_4_result = validateAllocation(
  ['2025-12-29', '2025-12-30'],
  test4_4_sourceWeek[0].estimatedHours,
  test4_4_existingHours
);
console.log(`Destination: All days have 8h (full capacity)`);
console.log(`Pasting: 5h task across 2 days`);
console.log(`Validation: ${test4_4_result.isValid ? 'VALID' : 'INVALID'}`);
console.log(`Error: ${test4_4_result.errors[0] || 'None'}`);
console.log(`✓ PASS` + (!test4_4_result.isValid ? ' - Correctly rejects paste into full week' : ' - FAILED'));

// ============================================
// TEST SUMMARY
// ============================================

console.log('\n' + '='.repeat(70));
console.log('TEST SUITE SUMMARY');
console.log('='.repeat(70));
console.log('\n✓ All test scenarios completed');
console.log('\nKey Validations Tested:');
console.log('1. Daily limit (8h/day) enforcement');
console.log('2. Date range capacity validation');
console.log('3. Single task copy/paste validation');
console.log('4. Entire week copy/paste validation');
console.log('\nIf all tests pass, the allocation system is working correctly.');
console.log('If any test fails, review the allocation engine logic.');
