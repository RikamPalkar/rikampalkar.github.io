# ChroniyamAI — Improvement Ideas

Ideas to make the app more impressive, in priority order.

## Critical gaps (before any demo)
1. **Persistence** — page refresh currently wipes all state (planning mode, tasks, chat). Save to `localStorage` and restore on load. _(Completed)_
2. **Secure backend for the OpenAI key** — currently called directly from the browser, exposing the API key in devtools. Needs a thin serverless proxy. _(Completed via `/api/chat` Edge function)_

## High-impact additions
3. **Voice reply (text-to-speech)** — speak the AI's replies aloud (`SpeechSynthesis`) for a real conversational feel.
4. **Calendar export (.ics)** — "Export to Outlook/Google Calendar" button on the finalized plan. Strong Microsoft-ecosystem tie-in. _(Completed)_
5. **Balance analytics** — chart of hours per quadrant, reinforcing the Eisenhower Matrix coaching angle (mirrors old ChroNiyam's "Balance Mode"). _(Completed)_
6. **Task completion tracking** — checkbox to mark done, completion %, small celebratory animation on finishing a day. _(Completed)_
7. **Undo/redo** for drag-and-drop and edits. _(Completed)_

## Polish
8. Example prompt chips on first load ("Try: 'I need to finish my report and call mom'") to guide a live demo. _(Completed)_
9. Light/dark theme toggle. _(Completed)_
