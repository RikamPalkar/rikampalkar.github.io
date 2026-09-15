# ChroNiyam AI Scope

## Product Features

- Initial planning setup for day, week, month, or custom planning windows.
- Conversational task capture through text input.
- Browser speech recognition for voice task input.
- Optional browser speech synthesis for spoken AI replies.
- AI sarcasm intensity control from focused to dry.
- AI-generated task classification and planning suggestions.
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

- React 19.
- TypeScript 6.
- Vite 8.
- React DOM.
- Vercel serverless function for the production chat proxy.
- OpenAI Chat Completions API with structured JSON schema responses.
- Browser Web Speech API for speech recognition.
- Browser SpeechSynthesis API for spoken replies.
- CSS with responsive media queries, animations, CSS variables, and glass-style panels.
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

