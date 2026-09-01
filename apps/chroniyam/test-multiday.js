// Test multi-day task allocation

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
    
    // Fill each day sequentially up to DAILY_LIMIT
    let remainingHours = task.estimatedHours;
    console.log(`  Task ${task.id}: ${task.estimatedHours}h across ${taskDates.length} days`);
    
    taskDates.forEach((date) => {
      const currentHours = hours[date] || 0;
      const availableInDay = DAILY_LIMIT - currentHours;
      const hoursToAllocate = Math.min(remainingHours, availableInDay);
      
      if (hoursToAllocate > 0) {
        hours[date] = currentHours + hoursToAllocate;
        remainingHours -= hoursToAllocate;
        console.log(`    ${date}: allocated ${hoursToAllocate}h (total now: ${hours[date]}h)`);
      }
    });
    
    if (remainingHours > 0) {
      console.log(`    WARNING: ${remainingHours}h couldn't be allocated!`);
    }
  });

  return hours;
}

function getRemainingHoursForDay(dateStr, currentHours) {
  const used = currentHours[dateStr] || 0;
  const remaining = Math.max(0, DAILY_LIMIT - used);
  console.log(`  ${dateStr}: used ${used}h, remaining ${remaining}h`);
  return remaining;
}

function validateTask(selectedDates, requestedHours, currentHours) {
  console.log(`\nValidating: ${requestedHours}h across ${selectedDates.join(', ')}`);
  
  // Calculate remaining per day
  const perDayRemaining = {};
  selectedDates.forEach(date => {
    perDayRemaining[date] = getRemainingHoursForDay(date, currentHours);
  });
  
  // Sum total available
  const totalAvailable = Object.values(perDayRemaining).reduce((sum, val) => sum + val, 0);
  console.log(`  Total available: ${totalAvailable}h`);
  
  // Check if request fits
  const canAllocate = requestedHours <= totalAvailable;
  console.log(`  Can allocate ${requestedHours}h? ${canAllocate ? 'YES' : 'NO'}`);
  
  if (!canAllocate) {
    console.log(`  ERROR: Not enough daily capacity.`);
    console.log(`  Requested: ${requestedHours}h`);
    console.log(`  Available across selected days: ${totalAvailable}h`);
  }
  
  return canAllocate;
}

// SCENARIO: User's exact test case
console.log('=== SCENARIO: 15h task across 2 days, then add 1h task ===\n');

console.log('Step 1: Add 15h task across Dec 27-28');
const task1 = {
  id: '1',
  startDate: '2025-12-27',
  dueDate: '2025-12-28',
  estimatedHours: 15
};

const allTasks = [task1];
const currentHours = calculateCurrentHours(allTasks);
console.log('\nCurrent hours allocation:', currentHours);

console.log('\n---');
console.log('Step 2: Try to add 1h task on Dec 27 only');
const canAdd1hOnDay27 = validateTask(['2025-12-27'], 1, currentHours);
console.log(`Result: ${canAdd1hOnDay27 ? 'ALLOWED' : 'BLOCKED'}`);

console.log('\n---');
console.log('Step 3: Try to add 1h task on Dec 28 only');
const canAdd1hOnDay28 = validateTask(['2025-12-28'], 1, currentHours);
console.log(`Result: ${canAdd1hOnDay28 ? 'ALLOWED' : 'BLOCKED'}`);

console.log('\n---');
console.log('Step 4: Try to add 1h task across BOTH days (Dec 27-28)');
const canAdd1hAcross2Days = validateTask(['2025-12-27', '2025-12-28'], 1, currentHours);
console.log(`Result: ${canAdd1hAcross2Days ? 'ALLOWED' : 'BLOCKED'}`);

console.log('\n=== EXPECTED BEHAVIOR ===');
console.log('- 15h across 2 days = 8h on day 1, 7h on day 2');
console.log('- Day 1: 8 - 8 = 0h remaining');
console.log('- Day 2: 8 - 7 = 1h remaining');
console.log('- Adding 1h on day 1: BLOCKED (0h available)');
console.log('- Adding 1h on day 2: ALLOWED (1h available)');
