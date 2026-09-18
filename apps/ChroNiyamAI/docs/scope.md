# ChroNiyam AI Scope

## Product Direction

- Primary user promise: choose **Plan my week**, describe everything that needs attention, and receive a complete realistic weekly plan.
- The first screen should lead with one clear action, **Plan my week**, instead of making users understand planning modes before they begin.
- Users can add tasks by typing naturally or speaking through the microphone; they should not have to format or pre-classify the task list.
- Chroniyam AI should collect only the constraints needed to make a useful plan, such as deadlines, sleep, work hours, fixed meetings, energy, and preferred start time.
- The app should convert the task list into a complete schedule, not only classify tasks into quadrants.
- The generated plan should include task priority, quadrant, date, start time, duration, buffers, and recovery space.
- Users should be able to review the result, understand why tasks were placed, and request changes conversationally.
- Balance Mode should be a stronger planning policy for users who want well-being targets and Q2 protection; it should not be the only way to receive a complete plan.

## Ideal First-Run Flow

- User opens the app and sees **Plan my week** as the primary action.
- User clicks **Plan my week** and immediately gives Chroniyam a natural task dump by text or voice.
- AI identifies tasks, deadlines, urgency, importance, estimated duration, and activity areas.
- AI asks only essential follow-up questions for missing or high-impact constraints, after the task dump.
- AI estimates ordinary task duration, date, and time instead of asking the user for each task individually.
- Follow-up questions are reserved for genuinely blocking ambiguity, such as conflicting hard deadlines or immovable appointments.
- The user then provides global constraints such as available hours, sleep, preferred start, energy, and fixed meetings.
- The Plan Optimizer creates the first complete schedule automatically.
- The user sees the four quadrants, daily schedule, capacity usage, Q2 balance, recovery time, and plan quality.
- The user can accept the plan, edit it directly, or say what should change.

## Product Principle

- The user supplies intent and context.
- Chroniyam AI supplies structure, prioritization, scheduling, and tradeoff awareness.
- The user remains in control of every decision.
- The app should reduce planning effort, not create another project-management task list.
- The app provides two visual themes: Claymorphism for soft tactile planning and Neobrutalism for bold high-contrast planning.

## Conditional Constraint Questions

- If tasks include work: ask available work hours.
- If tasks include exercise: ask preferred exercise time only if needed.
- If tasks include an exam: ask exam date and study availability.
- If tasks include appointments: ask whether the time is fixed.
- If tasks include sleep or recovery: ask preferred sleep/recovery boundaries.
- If tasks include family or social activities: ask about fixed commitments only when relevant.

- Chroniyam AI should be smart enough to map recurring tasks and repeated activities across the planning window automatically.

## Scheduling Heuristics

- **Energy-based** — deep/complex tasks in your peak focus hours, light tasks in low-energy slots
- **Deadline proximity** — urgent-important tasks get earliest slots automatically
- **Context/location** — grouping similar tasks together to reduce switching cost
- **Calendar-aware buffering** — leaving gaps around meetings instead of cramming right after
- **Task chaining** — sequencing dependent tasks (e.g., "review" only after "draft" is done)
- **Recurring pattern learning** — noticing you always do admin work at a certain time and defaulting to that

## Product Features

- Initial planning setup for day, week, month, or custom planning windows.
- Balance Mode for planning a week around overall well-being and sustainable execution.
- Balance Mode category selection for work, exercise, relationships, learning, hobbies, and recovery.
- Recommended category-hour targets based on available waking capacity.
- Q2-focused coaching that protects important, non-urgent work and flags excessive Q1 pressure.
- Conversational task capture through text input.
- Browser speech recognition for voice task input.
- Optional browser speech synthesis for spoken AI replies.
- AI sarcasm intensity control from focused to dry.
- AI-generated task classification and planning suggestions.
- Shared Plan Optimizer used by Manual Mode and Balance Mode.
- Automatic scheduling after task capture around deadlines, capacity, sleep, current time, buffers, and quadrant priority.
- Manual Mode recommendations remain editable and non-blocking.
- Planning constraint collection for work hours, preferred start time, energy level, and fixed meetings or blocked time.
- Plan quality score covering capacity usage, Q2 percentage, unresolved issues, recovery hours, and deadline risk.
- Conversation-based plan editing for moving tasks, changing priorities, and requesting lighter or recovery-focused days.
- AI balance coaching in every planning mode, with non-blocking recommendations in manual mode.
- Task activity-area classification for Balance Mode.
- Eisenhower Matrix task lanes:
  - Do First.
  - Schedule.
  - Delegate.
  - Eliminate.
- Automatic task extraction from conversation.
- Automatic date, time, and duration suggestions.
- Live task board updates while chatting with the AI.
- Drag-and-drop task movement between quadrants.
- Inline task editing.
- Task removal.
- AI-assisted task duration and time-slot suggestions.
- Daily and multi-day schedule planning.
- Sleep-hour configuration.
- Sleep override for selected dates.
- Capacity and overbooking calculations.
- Balance guidance based on quadrant distribution and available capacity.
- Schedule capacity and conflict warnings.
- Plan finalization and locked-plan state.
- Start Over flow for clearing the current plan.
- Local browser persistence for tasks, messages, settings, and planning configuration.
- Help carousel covering the product concept, workflow, matrix, and planning guidance.
- Floating Ask AI button that opens and hides the chat window.
- Draggable Ask AI button for desktop and touch devices.
- Responsive planner and floating chat window for mobile screens.
- Accessible labels, keyboard navigation, Escape-to-close help, and touch-friendly controls.

## Technical Stack

- BFF-style serverless proxy layer through the Vercel `/api/chat` function; it is currently a thin frontend-focused API proxy rather than a full backend-for-frontend system.
- React 19.
- TypeScript 6.
- Vite 8.
- React DOM.
- Vercel serverless function for the production chat proxy.
- OpenAI Chat Completions API with structured JSON schema responses.
- Browser Web Speech API for speech recognition.
- Browser SpeechSynthesis API for spoken replies.
- CSS with responsive media queries, animations, CSS variables, and glass-style panels.
- Two selectable visual themes: Claymorphism and Neobrutalism.
- Claymorphic surfaces with soft raised and inset shadows, rounded controls, tactile task cards, and high-contrast status colors.
- Neobrutalist surfaces with bold outlines, hard offset shadows, flat high-contrast colors, and square geometric corners.
- Browser localStorage through the application storage helper.
- Oxlint for linting.
- Node.js and npm for dependency management and scripts.

## Application Structure

- `src/App.tsx` owns application state and page composition.
- `src/components/` contains setup, chat, help, planner, and task-board UI.
- `src/lib/openai.ts` contains client-side AI request and response handling.
- `src/lib/voiceRecognition.ts` contains browser speech-input handling.
- `src/lib/storage.ts` contains local browser persistence.
- `src/lib/scheduleValidator.ts` contains schedule capacity and conflict rules.
- `src/lib/mergeTasks.ts` keeps task identity stable across AI updates.
- `src/index.css` contains global styles and design tokens.
- `src/App.css` contains application layout and component styles.
- `api/chat.ts` contains the server-side Vercel API proxy.
- `public/tictactoe-icon.svg` contains the official application logo and favicon asset.

## AI Request Flow

- User enters a task by text or voice.
- Browser speech recognition converts voice into text when used.
- React sends the conversation and planning context to the AI layer.
- Local development can call OpenAI directly when configured.
- Production calls `/api/chat` on Vercel.
- The serverless function reads the server-only OpenAI key.
- OpenAI returns structured conversation and task data.
- The client validates, merges, displays, and schedules the returned tasks.
- The selected sarcasm level is included in the AI personality instructions.
- The optional browser speech synthesizer reads the AI reply aloud.

## Environment Configuration

- `VITE_OPENAI_API_KEY` enables direct client-side OpenAI calls for local development.
- `VITE_OPENAI_MODEL` optionally selects the client-side model.
- `OPENAI_API_KEY` is used by the Vercel serverless function in production.
- `OPENAI_MODEL` optionally selects the server-side model.
- Production secrets are configured in Vercel environment settings.
- The production OpenAI key is not exposed to browser code when using `/api/chat`.

## Build And Run

- Install dependencies with `npm install` from `apps/ChroNiyamAI`.
- Start local development with `npm run dev`.
- Run lint checks with `npm run lint`.
- Build the production bundle with `npm run build`.
- TypeScript is checked through `tsc -b` during the production build.
- Vite creates the production bundle in `apps/ChroNiyamAI/dist`.
- Preview the production bundle with `npm run preview`.

## Deployment

- Hosting target: Vercel.
- Vercel project root: `apps/ChroNiyamAI`.
- Vercel install command: `npm install`.
- Vercel build command: `npm run build`.
- Vercel output directory: `dist`.
- Vercel serves the React frontend and `/api/chat` serverless function together.
- GitHub pushes trigger Vercel builds through the connected repository integration.
- Production deployments use the production environment variables.
- Pull requests and non-production branches can create preview deployments.
- The Vite base path is `/` for the root Vercel domain deployment.
- GitHub Pages is not used for the AI app because it cannot run `/api/chat`.

