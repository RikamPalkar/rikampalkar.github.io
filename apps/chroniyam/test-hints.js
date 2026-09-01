// Test to check why hints show 0h

const DAILY_LIMIT = 8;

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

function calculateCurrentHours(tasks) {
  const hours = {};
  
  tasks.forEach((task) => {
    const startDate = parseDate(task.startDate);
    const endDate = parseDate(task.dueDate);
    const taskDates = getTaskDates(startDate, endDate);
    
    let remainingHours = task.estimatedHours;
    
    taskDates.forEach((date) => {
      const currentHours = hours[date] || 0;
      const availableInDay = DAILY_LIMIT - currentHours;
      const hoursToAllocate = Math.min(remainingHours, availableInDay);
      
      if (hoursToAllocate > 0) {
        hours[date] = currentHours + hoursToAllocate;
        remainingHours -= hoursToAllocate;
      }
    });
  });

  return hours;
}

function getRemainingHoursForDay(dateStr, currentHours) {
  const used = currentHours[dateStr] || 0;
  return Math.max(0, DAILY_LIMIT - used);
}

// TEST: What the user is experiencing
console.log('=== TEST: Opening modal with NO tasks ===\n');

const allTasks = [];
const currentHours = calculateCurrentHours(allTasks);
console.log('Current hours:', currentHours);

const today = '2025-12-26';
console.log(`\nChecking ${today}:`);
console.log('  Used hours:', currentHours[today] || 0);
const remaining = getRemainingHoursForDay(today, currentHours);
console.log('  Remaining:', remaining, 'hours');
console.log('  Expected: 8 hours');
console.log('  PASS:', remaining === 8 ? '✓' : '✗');

console.log('\n=== TEST: After adding 2h task on Dec 26 ===\n');

const allTasks2 = [
  { id: '1', startDate: '2025-12-26', dueDate: '2025-12-26', estimatedHours: 2 }
];
const currentHours2 = calculateCurrentHours(allTasks2);
console.log('Current hours:', currentHours2);
console.log('  Used on Dec 26:', currentHours2['2025-12-26'] || 0);
const remaining2 = getRemainingHoursForDay('2025-12-26', currentHours2);
console.log('  Remaining on Dec 26:', remaining2, 'hours');
console.log('  Expected: 6 hours');
console.log('  PASS:', remaining2 === 6 ? '✓' : '✗');

// Now test when opening NEXT modal (adding another task)
console.log('\n=== TEST: Opening modal again to add another task ===\n');
console.log('allTasks at this point:', allTasks2);
console.log('If initialTask is undefined (adding new), tasksToUse = allTasks');
const tasksToUse = allTasks2; // This is what useMemo returns when adding new
const currentHoursForModal = calculateCurrentHours(tasksToUse);
console.log('currentHours calculated by useMemo:', currentHoursForModal);
const remainingInModal = getRemainingHoursForDay('2025-12-26', currentHoursForModal);
console.log('Remaining shown in hint:', remainingInModal, 'hours');
console.log('Expected: 6 hours');
console.log('PASS:', remainingInModal === 6 ? '✓' : '✗');
