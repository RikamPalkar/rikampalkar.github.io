// Simple test to verify hours allocation logic

// Simulate the functions
const DAILY_LIMIT = 8;

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function calculateCurrentHours(tasks) {
  const hours = {};
  
  tasks.forEach((task) => {
    const startDate = parseDate(task.startDate);
    const endDate = parseDate(task.dueDate);
    const taskDates = getTaskDates(startDate, endDate);
    const hoursPerDay = task.estimatedHours / taskDates.length;

    taskDates.forEach((date) => {
      hours[date] = (hours[date] || 0) + hoursPerDay;
    });
  });

  return hours;
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

function getDateStr(date) {
  // Get local date components to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRemainingHoursForDay(dateStr, currentHours) {
  const used = currentHours[dateStr] || 0;
  return Math.max(0, DAILY_LIMIT - used);
}

// TEST 1: Empty tasks, should show 8h available
console.log('\n=== TEST 1: No existing tasks ===');
const allTasks1 = [];
const currentHours1 = calculateCurrentHours(allTasks1);
console.log('currentHours:', currentHours1);
const remaining1 = getRemainingHoursForDay('2025-12-27', currentHours1);
console.log('Remaining on 2025-12-27:', remaining1, 'hours');
console.log('Expected: 8 hours');
console.log('PASS:', remaining1 === 8 ? '✓' : '✗');

// TEST 2: One 5h task on Dec 27, should show 3h available
console.log('\n=== TEST 2: One 5h task on Dec 27 ===');
const allTasks2 = [
  { id: '1', startDate: '2025-12-27', dueDate: '2025-12-27', estimatedHours: 5 }
];
const currentHours2 = calculateCurrentHours(allTasks2);
console.log('currentHours:', currentHours2);
const remaining2 = getRemainingHoursForDay('2025-12-27', currentHours2);
console.log('Remaining on 2025-12-27:', remaining2, 'hours');
console.log('Expected: 3 hours');
console.log('PASS:', remaining2 === 3 ? '✓' : '✗');

// TEST 3: One 8h task on Dec 27, should show 0h available
console.log('\n=== TEST 3: One 8h task on Dec 27 ===');
const allTasks3 = [
  { id: '1', startDate: '2025-12-27', dueDate: '2025-12-27', estimatedHours: 8 }
];
const currentHours3 = calculateCurrentHours(allTasks3);
console.log('currentHours:', currentHours3);
const remaining3 = getRemainingHoursForDay('2025-12-27', currentHours3);
console.log('Remaining on 2025-12-27:', remaining3, 'hours');
console.log('Expected: 0 hours');
console.log('PASS:', remaining3 === 0 ? '✓' : '✗');

// TEST 4: Two 8h tasks on Dec 27, should show 0h (but this should have been prevented!)
console.log('\n=== TEST 4: Two 8h tasks on Dec 27 (INVALID STATE) ===');
const allTasks4 = [
  { id: '1', startDate: '2025-12-27', dueDate: '2025-12-27', estimatedHours: 8 },
  { id: '2', startDate: '2025-12-27', dueDate: '2025-12-27', estimatedHours: 8 }
];
const currentHours4 = calculateCurrentHours(allTasks4);
console.log('currentHours:', currentHours4);
const remaining4 = getRemainingHoursForDay('2025-12-27', currentHours4);
console.log('Remaining on 2025-12-27:', remaining4, 'hours');
console.log('Note: Used hours = 16, but limit is 8, so remaining = max(0, 8-16) = 0');
console.log('This state should never happen if validation works!');

// TEST 5: When editing task 1 (8h), exclude it - should show 8h available
console.log('\n=== TEST 5: Editing task 1 (8h), exclude it ===');
const allTasks5 = [
  { id: '1', startDate: '2025-12-27', dueDate: '2025-12-27', estimatedHours: 8 }
];
const tasksExcludingEdited = allTasks5.filter(t => t.id !== '1');
const currentHours5 = calculateCurrentHours(tasksExcludingEdited);
console.log('Tasks after filtering:', tasksExcludingEdited);
console.log('currentHours:', currentHours5);
const remaining5 = getRemainingHoursForDay('2025-12-27', currentHours5);
console.log('Remaining on 2025-12-27:', remaining5, 'hours');
console.log('Expected: 8 hours (task excluded, so day is empty)');
console.log('PASS:', remaining5 === 8 ? '✓' : '✗');

console.log('\n=== SUMMARY ===');
console.log('If all tests pass, the logic is correct.');
console.log('If tests pass but UI still broken, issue is in how data flows to component.');
