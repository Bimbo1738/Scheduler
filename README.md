# Mika Scheduler

A lightweight local (no backend) schedule and to-do manager tailored for Atty. Mika. Data is stored in your browser using `localStorage`, allowing you to navigate to past days and retain entries.

## Features
## Features
 - Editable hourly schedule (8:00 AM – 7:00 PM)
 - Fields: Matters to Discuss, Venue, Attendees, Status (Pending / Done / Cancelled), Notes
 - Per-day persistence (localStorage)
 - Navigate with Previous / Next buttons or pick a date
 - Color-coded status rows by status
 - To-Do list with statuses; Add adds only to list, AddT inserts directly into schedule at chosen time
 - Time selector for AddT to choose the schedule time slot
 - Auto-save on changes, plus manual Save Schedule / Save List buttons
 - Clear Schedule (current day) and Clear List (all todos) buttons
 - Print / Save to PDF (Print button invokes browser print dialog; print stylesheet applied)

## Usage
1. Open `index.html` in a modern browser (Chrome, Edge, Firefox, etc.).
2. Pick a date or use the arrow buttons.
3. Click into any cell (except Time) to edit; it auto-saves.
5. Add To-Do items: use Add to keep only in the list, or AddT to place directly into the selected time row in the schedule (not added to list).
6. Manual Save buttons are optional (auto-save still runs). Use Clear buttons cautiously.
7. Use Print for PDF generation (browser print dialog > Save as PDF).

Data lives in `localStorage`. Clearing site data or using a different browser/device resets everything. There are no JSON/Excel exports in this version—use Print to archive to PDF.
Data lives in `localStorage`. Clearing site data or using a different browser / device will create a fresh state. To move data between machines use the export/import JSON buttons.
You can adjust hours by editing the `HOURS` array in `script.js`.
Possible future enhancements: weekly PDF summary, re-introduce export formats, undo for clear actions.
## Extending
You can adjust hours by editing the `HOURS` array in `script.js`.

## Disclaimer
No server-side storage or authentication—do not include confidential information.
