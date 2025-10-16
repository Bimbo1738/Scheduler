// Scheduler for Atty. Mika
// Data persistence via localStorage

// Default hours removed; schedule becomes dynamic. Provide a suggestion list if needed.
const DEFAULT_HOURS_HINT = [
  '8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM',
  '4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM'
];
const FIELDS = ['matters','venue','attendees','status','notes'];
const STATUS_VALUES = ['Pending','Done','Cancelled'];
const VENUE_OPTIONS = [
  'Office of the President',
  'Office of the General Manager',
  'Business lounge',
  'Lanai Botique',
  'Montalban Room',
  'Pasig Room',
  'Rosario Room',
  'Outside VVCCI'
];

// DOM refs
const scheduleBody = document.getElementById('scheduleBody');
const selectedDateInput = document.getElementById('selectedDate');
const weekdayLabel = document.getElementById('weekdayLabel');
const prevDayBtn = document.getElementById('prevDay');
const nextDayBtn = document.getElementById('nextDay');
const saveIndicator = document.getElementById('saveIndicator');

// To-do refs
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoStatusSelect = document.getElementById('todoStatus');
const todoTimeInput = document.getElementById('todoTime');
const timeHints = document.getElementById('timeHints');
const todoListEl = document.getElementById('todoList');
const clearDoneBtn = document.getElementById('clearDone');
// Removed JSON/Excel references; only print + manual save/clear
const printPdfBtn = document.getElementById('printPdf');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');
const clearScheduleBtn = document.getElementById('clearScheduleBtn');
const saveTodoListBtn = document.getElementById('saveTodoListBtn');
const clearTodoListBtn = document.getElementById('clearTodoListBtn');

// LocalStorage helpers
function storageKeyForDate(dateStr){ return `mikaSchedule:${dateStr}`; }
const TODO_KEY = 'mikaSchedule:todos';

function getDateStr(date){ return date.toISOString().slice(0,10); }

function loadSchedule(dateStr){
  const raw = localStorage.getItem(storageKeyForDate(dateStr));
  if(!raw){
    return []; // start empty
  }
  try { return JSON.parse(raw); } catch(e){ console.warn('Failed parse schedule', e); return []; }
}

function saveSchedule(dateStr, data){
  localStorage.setItem(storageKeyForDate(dateStr), JSON.stringify(data));
}

function renderSchedule(dateStr){
  scheduleBody.innerHTML='';
  let data = loadSchedule(dateStr);
  data = sortByTime(data);
  data.forEach((row, idx) => {
    const tr = document.createElement('tr');
    // Time column (fixed)
    const timeTd = document.createElement('td');
    timeTd.textContent = row.time;
    timeTd.className = 'time-col';
    tr.appendChild(timeTd);

    // Matters, Venue, Attendees, Status, Notes
    ['matters','venue','attendees','notes'].forEach(field => {
      const td = document.createElement('td');
      td.className='editable';
      td.contentEditable = true;
      td.dataset.field=field;
      td.dataset.index=idx;
      td.innerHTML = sanitize(row[field]||'');
      tr.appendChild(td);
    });

    // Status column inserted before Notes? In screenshot order: Matters, Venue, Attendees, Status, Notes
    // Adjust order: we added matters venue attendees notes above; we need status before notes -> easier: rebuild correctly.
    tr.innerHTML='';
    tr.appendChild(timeTd);

    const fieldsInOrder = ['matters','venue','attendees'];
    fieldsInOrder.forEach(field => {
      const td = document.createElement('td');
      td.dataset.field=field;
      td.dataset.index=idx;
      if(field === 'venue'){
        const select = document.createElement('select');
        select.className = 'venue-select';
        const blankOpt = document.createElement('option'); blankOpt.value=''; blankOpt.textContent=''; select.appendChild(blankOpt);
        VENUE_OPTIONS.forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; if(v===row.venue) o.selected=true; select.appendChild(o); });
        select.addEventListener('change', () => { autoSave(); });
        td.appendChild(select);
      } else {
        td.className='editable';
        td.contentEditable = true;
        td.innerHTML = sanitize(row[field]||'');
      }
      tr.appendChild(td);
    });

    const statusTd = document.createElement('td');
    const select = document.createElement('select');
    select.className='status-select';
    STATUS_VALUES.forEach(val => {
      const opt = document.createElement('option');
      opt.value=val; opt.textContent=val; if(val===row.status) opt.selected=true; select.appendChild(opt);
    });
    select.dataset.index=idx;
    select.addEventListener('change', () => { handleStatusChange(dateStr, idx, select.value, tr); });
    statusTd.appendChild(select);
    tr.appendChild(statusTd);

    const notesTd = document.createElement('td');
    notesTd.className='editable';
    notesTd.contentEditable = true;
    notesTd.dataset.field='notes';
    notesTd.dataset.index=idx;
    notesTd.innerHTML = sanitize(row.notes||'');
    tr.appendChild(notesTd);

    applyStatusClass(tr, row.status);
    scheduleBody.appendChild(tr);
  });
}

function applyStatusClass(tr, status){
  tr.classList.remove('status-Pending','status-Done','status-Cancelled');
  tr.classList.add(`status-${status}`);
}

function sanitize(str){
  // Basic sanitize to prevent HTML injection
  return str.replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
}

function gatherScheduleData(){
  const dateStr = selectedDateInput.value;
  const rows = [];
  [...scheduleBody.querySelectorAll('tr')].forEach(tr => {
    const time = tr.querySelector('.time-col').innerText.trim();
    const matters = tr.querySelector('[data-field="matters"]').innerText.trim();
    let venueCell = tr.querySelector('[data-field="venue"]');
    let venue = '';
    if(venueCell){
      const sel = venueCell.querySelector('select');
      venue = sel ? sel.value.trim() : venueCell.innerText.trim();
    }
    const attendees = tr.querySelector('[data-field="attendees"]').innerText.trim();
    const notes = tr.querySelector('[data-field="notes"]').innerText.trim();
    const status = tr.querySelector('select').value;
    rows.push({ time, matters, venue, attendees, status, notes });
  });
  saveSchedule(dateStr, sortByTime(rows));
}

let saveTimer;
function markSaving(){
  saveIndicator.textContent='Saving...';
  saveIndicator.className='saving';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saveIndicator.textContent='All changes saved'; saveIndicator.className='saved'; }, 500);
}

function autoSave(){
  markSaving();
  gatherScheduleData();
}

scheduleBody.addEventListener('input', (e) => {
  if(e.target.classList.contains('editable')){
    autoSave();
  }
});

function handleStatusChange(dateStr, idx, newStatus, tr){
  applyStatusClass(tr, newStatus);
  autoSave();
}

function initDate(){
  const today = new Date();
  const dateStr = getDateStr(today);
  selectedDateInput.value = dateStr;
  updateWeekdayLabel();
  renderSchedule(dateStr);
}

function updateWeekdayLabel(){
  const date = new Date(selectedDateInput.value);
  const weekday = date.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric'});
  weekdayLabel.textContent = weekday;
}

selectedDateInput.addEventListener('change', () => {
  updateWeekdayLabel();
  renderSchedule(selectedDateInput.value);
});

prevDayBtn.addEventListener('click', () => moveDay(-1));
nextDayBtn.addEventListener('click', () => moveDay(1));

function moveDay(delta){
  const d = new Date(selectedDateInput.value);
  d.setDate(d.getDate()+delta);
  selectedDateInput.value = getDateStr(d);
  updateWeekdayLabel();
  renderSchedule(selectedDateInput.value);
}

// To-Do logic
function loadTodos(){
  const raw = localStorage.getItem(TODO_KEY);
  if(!raw) return [];
  try { return JSON.parse(raw); } catch(e){ return []; }
}

function saveTodos(todos){
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function renderTodos(){
  const todos = loadTodos();
  todoListEl.innerHTML='';
  todos.forEach((t, idx) => {
    const li = document.createElement('li');
    li.className = `todo-item todo-status-${t.status}`;

    const textarea = document.createElement('textarea');
    textarea.value = t.text;
    textarea.addEventListener('input', () => { t.text = textarea.value; saveTodosAndRefresh(todos); });

    const select = document.createElement('select');
    STATUS_VALUES.forEach(s => { const o=document.createElement('option'); o.value=s; o.textContent=s; if(s===t.status) o.selected=true; select.appendChild(o); });
    select.addEventListener('change', () => { t.status = select.value; saveTodosAndRefresh(todos); });

    const delBtn = document.createElement('button');
    delBtn.textContent='✕';
    delBtn.title='Delete';
    delBtn.addEventListener('click', () => { todos.splice(idx,1); saveTodosAndRefresh(todos); });

    li.appendChild(textarea);
    li.appendChild(select);
    li.appendChild(delBtn);
    todoListEl.appendChild(li);
  });
}

function saveTodosAndRefresh(todos){
  saveTodos(todos);
  renderTodos();
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const submitter = e.submitter ? e.submitter.value : 'add';
  const text = todoInput.value.trim();
  if(!text) return;
  const status = todoStatusSelect.value;
  const time = normalizeTime(todoTimeInput.value || '');
  if(submitter === 'add') {
    const todos = loadTodos();
    todos.push({ text, status });
    saveTodosAndRefresh(todos);
  } else if(submitter === 'addt') {
    // Insert directly into schedule at chosen time
    insertIntoScheduleAtTime(text, status, time);
  }
  todoForm.reset();
  todoStatusSelect.value='Pending';
  populateTimeHints();
});

clearDoneBtn.addEventListener('click', () => {
  const todos = loadTodos().filter(t => t.status !== 'Done');
  saveTodosAndRefresh(todos);
});

// Manual Save / Clear buttons
saveScheduleBtn.addEventListener('click', () => { gatherScheduleData(); markSaving(); });
clearScheduleBtn.addEventListener('click', () => {
  if(confirm('Clear all schedule entries for this day?')){
    saveSchedule(selectedDateInput.value, []);
    renderSchedule(selectedDateInput.value);
    markSaving();
  }
});

saveTodoListBtn.addEventListener('click', () => { const t=loadTodos(); saveTodos(t); /* already saved but force indicator */ markSaving(); });
clearTodoListBtn.addEventListener('click', () => {
  if(confirm('Remove ALL to-dos?')){ saveTodos([]); renderTodos(); markSaving(); }
});

// Insert Todo into first empty Matters cell or append to last cell's notes
function insertTodoIntoSchedule(text, status){
  // Backwards compatibility: choose a default time (next half hour) if not specified
  const guess = guessNextTime();
  insertIntoScheduleAtTime(text, status, guess);
}

// New: insert at specific time slot
function insertIntoScheduleAtTime(text, status, time){
  if(!time){ time = guessNextTime(); }
  const dateStr = selectedDateInput.value;
  const data = loadSchedule(dateStr);
  let row = data.find(r => r.time === time);
  if(!row){
    row = { time, matters:'', venue:'', attendees:'', status:'Pending', notes:'' };
    data.push(row);
  }
  if(row.matters){
    row.matters += '; ' + text;
  } else {
    row.matters = text;
  }
  if(status && status !== 'Pending') row.status = status;
  saveSchedule(dateStr, sortByTime(data));
  renderSchedule(dateStr);
}

function guessNextTime(){
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  m = m < 30 ? 30 : 0; // round to next half hour
  if(m===0) h = (h+1)%24;
  return toTwelveHour(h, m);
}

function toTwelveHour(h, m){
  const period = h>=12 ? 'PM':'AM';
  let hour = h%12; if(hour===0) hour=12;
  const mm = (m+'').padStart(2,'0');
  return `${hour}:${mm} ${period}`;
}

function parseTime(str){
  // Expect formats like '8:00 AM', '8 AM', '8:30 pm'
  const re = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i;
  const m = str.trim().toUpperCase().match(re);
  if(!m) return null;
  let hour = parseInt(m[1],10);
  let min = m[2] ? parseInt(m[2],10) : 0;
  if(hour===12) hour=0; // 12 AM -> 0
  if(m[3]==='PM') hour+=12;
  return hour*60+min;
}

function sortByTime(arr){
  return [...arr].sort((a,b) => {
    const ta = parseTime(normalizeTime(a.time)) ?? 0;
    const tb = parseTime(normalizeTime(b.time)) ?? 0;
    return ta-tb;
  });
}

function normalizeTime(t){
  // Ensure contains minutes
  const re = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i;
  const m = t.trim().toUpperCase().match(re);
  if(!m) return t.trim();
  const hh = m[1];
  const mm = m[2] ? m[2] : '00';
  return `${hh}:${mm} ${m[3]}`;
}

function populateTimeHints(){
  if(!timeHints) return;
  timeHints.innerHTML='';
  DEFAULT_HOURS_HINT.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h; timeHints.appendChild(opt);
  });
}


// Print / PDF
printPdfBtn.addEventListener('click', () => {
  window.print();
});

// Initialize
initDate();
renderTodos();
populateTimeHints();
