# ChroNiyam AI Voice Triage — Implementation Plan

**Hackathon Scope:** AI/Copilot track  
**Base App Status:** Fully functional Eisenhower Matrix task manager (React 19, TypeScript, Vite)  
**New Feature:** Voice-to-structured-task with LLM-driven quadrant classification  
**Target Duration:** Hackathon sprint (48–72 hours)

---

## 1. Current State Analysis

### ✅ What Already Exists (Foundation)

| Component | Status | Relevance |
|-----------|--------|-----------|
| **Task Type Definition** | Complete | `Task` type in `types/quadrant.ts` with all needed fields: `id`, `title`, `description`, `quadrant`, `estimatedHours`, `startDate`, `dueDate`, `completed`, `isRecurring` |
| **Quadrant System** | Complete | Four quadrants hardcoded: "Do First", "Schedule", "Delegate", "Eliminate" |
| **Hours Allocation Engine** | Complete | Validates daily (8 hrs/day) and weekly (56 hrs/week) limits; works with date ranges |
| **TaskModal Component** | Complete | Full task create/edit UI with validation; can be reused for review/confirm step |
| **Task State Management** | Complete | `App.tsx` uses `useState<Task[]>` for task list; can add AI-parsed tasks directly |
| **Task Cards & Grid** | Complete | Visual layout and rendering of tasks per quadrant |
| **Local Storage Persistence** | Complete | Already handles task persistence; AI-added tasks flow through same pipeline |
| **Week Planning UI** | Complete | Calendar, week selection, task allocation across time windows |

### ❌ What Needs to Be Built (Hackathon Scope)

| Feature | Layer | Priority |
|---------|-------|----------|
| **Mic Button Component** | UI | P0 (entry point) |
| **Speech Capture (Web Speech API or Azure)** | Capture | P0 (core input) |
| **Live Transcript Display** | UI | P1 (visual feedback) |
| **LLM Prompt Design** | AI/Prompt | P0 (classification engine) |
| **Task Parsing Pipeline** | API Integration | P0 (transcript → JSON) |
| **Review/Confirm Modal** | UI | P0 (user acceptance gate) |
| **Reasoning Display** | UI | P1 (explainability) |
| **Error Handling & Fallbacks** | UX | P1 (robustness) |
| **Accessibility & a11y** | UX | P2 (nice-to-have) |

---

## 2. Architecture Overview

### High-Level Flow

```
User clicks Mic
    ↓
Listen for speech (Web Speech API)
    ↓
Real-time transcript shown
    ↓
User stops recording
    ↓
Send transcript to Azure OpenAI
    ↓
LLM parses & classifies into structured JSON
    ↓
Review Modal shows parsed tasks + reasoning
    ↓
User confirms/edits
    ↓
Tasks flow into existing ChroNiyam system
    ↓
Hours validation, calendar, persistence (existing)
```

### Key Architectural Decisions

1. **Speech Capture Strategy**
   - **Primary:** Web Speech API (Chrome, Edge, Safari; built-in; no backend needed)
   - **Fallback:** Backup pre-recorded demo clip (hedge against live demo speech recognition failure)
   - **Stretch:** Azure Speech-to-Text for higher accuracy + deeper Copilot/Azure brand tie-in

2. **LLM Integration**
   - Use Azure OpenAI (Copilot API or GPT-4 via Azure)
   - Single prompt call: transcript in → structured JSON out
   - Reason string included for explainability

3. **UI Integration Pattern**
   - New "VoiceInputButton" component in Header or SideActions
   - Non-blocking: doesn't replace manual task entry, complements it
   - Reuses existing TaskModal for review step (minimal new UI code)

4. **State Flow**
   - Voice state isolated in new component (recording, transcript, parsed tasks, error)
   - No changes to existing `App.tsx` task list until user confirms
   - Review modal is temporary; confirmed tasks merged into `tasks` state via existing `onSave` callback

5. **No Backend Needed** (unless Azure Speech is chosen)
   - Web Speech API captures locally
   - Fetch call to Azure OpenAI endpoint (or via Copilot API)
   - Entire flow client-side; same deployment footprint

---

## 3. Component & File Structure

### New Files to Create

```
src/
├── components/
│   ├── VoiceInput/
│   │   ├── VoiceInputButton.tsx         (Mic button UI + recording state)
│   │   ├── VoiceTranscriptDisplay.tsx   (Live transcript with formatting)
│   │   ├── VoiceReviewModal.tsx         (Parsed tasks review + edit)
│   │   ├── TaskReasoningTooltip.tsx     (Hover/tap to show AI reasoning)
│   │   └── voiceInputStyles.css         (Scoped styles for voice UI)
│
├── utils/
│   ├── voiceRecognition.ts              (Web Speech API wrapper)
│   ├── llmPrompt.ts                     (Prompt engineering & response parsing)
│   ├── azureOpenAI.ts                   (Azure API client)
│   └── voiceUtils.ts                    (Helpers: date parsing, task validation)
│
└── types/
    └── voice.ts                         (VoiceState, ParsedTask, LLMResponse types)
```

### Modified Files

```
src/
├── App.tsx                              (Add voice state container; integrate VoiceInputButton)
├── components/Header.tsx                (Add VoiceInputButton to header or toolbar)
└── components/SideActions.tsx           (Alternative placement for mic button)
```

---

## 4. Detailed Implementation Phases

### Phase 1: Foundation & API Setup (6–8 hours)

#### 4.1.1 Environment & Dependencies
- **Action:** Add minimal dependencies (none required if using Web Speech API)
  - Keep existing: React, TypeScript, Vite
  - Optional: `axios` for Azure API calls (or use native `fetch`)
- **Files:** `package.json` (no changes needed if using Web Speech API)
- **Risk:** None if Web Speech API; Azure requires valid credentials

#### 4.1.2 Azure OpenAI Setup (if chosen)
- **Action:** 
  - Create Azure OpenAI resource (or use existing Copilot Studio account)
  - Generate API key and endpoint
  - Store in `.env.local` (git-ignored)
- **File to Create:** `src/utils/azureOpenAI.ts`
  - Async function `classifyTasksWithAI(transcript: string): Promise<ParsedTask[]>`
  - Handles API call, error handling, response parsing
- **Test:** Hardcoded transcript → verify JSON response structure
- **Estimated Effort:** 2 hours

#### 4.1.3 Type Definitions
- **File to Create:** `src/types/voice.ts`
  ```typescript
  export type VoiceState = {
    isListening: boolean
    transcript: string
    isProcessing: boolean
    parsedTasks: ParsedTask[]
    error: string | null
  }

  export type ParsedTask = {
    title: string
    quadrant: QuadrantKey
    dueDate: string
    estimatedHours: number
    reasoning: string // e.g., "Marked urgent, due tomorrow"
  }

  export type LLMResponse = {
    success: boolean
    tasks: ParsedTask[]
    error?: string
  }
  ```
- **Test:** TypeScript compilation only
- **Estimated Effort:** 1 hour

#### 4.1.4 Web Speech API Wrapper
- **File to Create:** `src/utils/voiceRecognition.ts`
  ```typescript
  export class WebSpeechRecognizer {
    private recognition: SpeechRecognition | null = null
    
    constructor(
      onTranscript: (text: string) => void,
      onEnd: () => void,
      onError: (err: string) => void
    )
    
    start(): void
    stop(): void
    abort(): void
  }
  ```
- **Key Features:**
  - Graceful fallback if Web Speech API unavailable
  - Real-time transcript streaming
  - Error handling (no microphone, permission denied, timeout)
- **Test:** Manual test in Chrome/Edge (requires HTTPS or localhost)
- **Estimated Effort:** 2–3 hours

**Phase 1 Total: 6–8 hours**

---

### Phase 2: UI Components (8–10 hours)

#### 4.2.1 VoiceInputButton Component
- **File to Create:** `src/components/VoiceInput/VoiceInputButton.tsx`
- **Responsibilities:**
  - Render mic icon (active/inactive states)
  - Toggle recording on/off
  - Show loading spinner during LLM processing
  - Display error alert if speech capture fails
  - Trigger review modal on success
- **Props:**
  ```typescript
  type VoiceInputButtonProps = {
    onVoiceTasksParsed: (tasks: ParsedTask[]) => void
    disabled?: boolean
  }
  ```
- **State:**
  - `isListening`, `transcript`, `isProcessing`, `error`, `parsedTasks`
- **Test:** 
  - Click → recording starts
  - Click → recording stops
  - LLM call succeeds → parsed tasks appear
  - No mic → error message
- **Estimated Effort:** 3–4 hours

#### 4.2.2 VoiceTranscriptDisplay Component
- **File to Create:** `src/components/VoiceInput/VoiceTranscriptDisplay.tsx`
- **Responsibilities:**
  - Show live transcript as user speaks
  - Visual distinction between final transcript and provisional (interim) results
  - Show confidence indicator (optional)
- **Props:**
  ```typescript
  type VoiceTranscriptDisplayProps = {
    transcript: string
    isListening: boolean
    confidence?: number
  }
  ```
- **Test:** Manual (visual check during speech)
- **Estimated Effort:** 1–2 hours

#### 4.2.3 VoiceReviewModal Component
- **File to Create:** `src/components/VoiceInput/VoiceReviewModal.tsx`
- **Responsibilities:**
  - Show parsed tasks in a modal/dialog
  - Allow inline edit of each task (title, quadrant, due date, hours)
  - "Confirm All" button to add tasks to quadrant grid
  - "Discard" button to cancel and close
  - Show reasoning line for each task (hover or always visible)
- **Props:**
  ```typescript
  type VoiceReviewModalProps = {
    isOpen: boolean
    tasks: ParsedTask[]
    onConfirm: (editedTasks: Task[]) => void
    onCancel: () => void
    quadrants: Quadrant[]
    timeWindow?: TimeWindow
  }
  ```
- **Reuse:** Extend or compose with existing `TaskModal` for consistency
- **Test:**
  - Edit task title → change persists
  - Change quadrant → change persists
  - Confirm → tasks added to `App.tsx` task list
- **Estimated Effort:** 3–4 hours

#### 4.2.4 TaskReasoningTooltip Component
- **File to Create:** `src/components/VoiceInput/TaskReasoningTooltip.tsx`
- **Responsibilities:**
  - Hover/tap to show AI reasoning for each parsed task
  - e.g., *"Do First — you said 'really urgent' and it's due tomorrow"*
- **Props:**
  ```typescript
  type TaskReasoningTooltipProps = {
    reasoning: string
  }
  ```
- **Test:** Hover over task in review modal → tooltip appears
- **Estimated Effort:** 1–2 hours

#### 4.2.5 Styling
- **File to Create:** `src/components/VoiceInput/voiceInputStyles.css`
- **Targets:**
  - Mic button active/inactive states
  - Transcript display box (live update visual)
  - Review modal styling (consistent with existing modals)
  - Reasoning tooltip styling
- **Estimated Effort:** 1–2 hours

**Phase 2 Total: 8–10 hours**

---

### Phase 3: LLM Prompt & Integration (6–8 hours)

#### 4.3.1 Prompt Engineering
- **File to Create:** `src/utils/llmPrompt.ts`
- **Function:**
  ```typescript
  export function buildClassificationPrompt(transcript: string): string {
    // Construct a few-shot prompt that:
    // 1. Explains Eisenhower Matrix
    // 2. Gives 3-4 example transcripts → JSON output
    // 3. Instructs on date parsing (tomorrow, next week, by Friday)
    // 4. Instructs on hour estimation (default to 1–2 if not specified)
    // 5. Asks for reasoning line for each task
  }

  export function parseAIResponse(aiOutput: string): ParsedTask[] {
    // Extract JSON from AI response
    // Validate structure
    // Return array of ParsedTask
  }
  ```
- **Prompt Design (MVP):**
  ```
  You are a task triage assistant. Users speak their tasks out loud; you parse and classify them.
  The Eisenhower Matrix has four quadrants:
  1. "Do First" — Urgent and Important
  2. "Schedule" — Not Urgent but Important
  3. "Delegate" — Urgent but Not Important
  4. "Eliminate" — Neither Urgent nor Important

  For each task mentioned:
  - Extract the task title
  - Classify into one of the four quadrants based on urgency/importance language used
  - Parse the due date ("tomorrow" → today+1, "next week" → today+7, "by Friday" → next Friday)
  - Estimate hours (if not mentioned, default to 1)
  - Provide a one-line reason for the classification

  Example:
  Transcript: "I need to finish the client presentation by tomorrow, it's really urgent. Also water the plants sometime."
  
  Output:
  [
    {
      "title": "Finish client presentation",
      "quadrant": "doFirst",
      "dueDate": "2026-08-24",
      "estimatedHours": 3,
      "reasoning": "Marked urgent, due tomorrow, tied to client deliverable"
    },
    {
      "title": "Water the plants",
      "quadrant": "eliminate",
      "dueDate": "2026-08-28",
      "estimatedHours": 0.25,
      "reasoning": "No urgency or importance signal; low priority"
    }
  ]

  Now parse this transcript:
  [USER TRANSCRIPT HERE]
  ```
- **Test:** Send test transcripts; verify JSON quality
- **Estimated Effort:** 2–3 hours

#### 4.3.2 Azure OpenAI Client
- **File to Create:** `src/utils/azureOpenAI.ts`
  ```typescript
  export async function classifyTasksWithAI(transcript: string): Promise<ParsedTask[]> {
    const prompt = buildClassificationPrompt(transcript)
    
    const response = await fetch(
      `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_ID}/chat/completions?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'api-key': AZURE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3, // Low temperature for consistent parsing
          max_tokens: 2000
        })
      }
    )

    const data = await response.json()
    const aiOutput = data.choices[0].message.content
    return parseAIResponse(aiOutput)
  }
  ```
- **Error Handling:**
  - Network error → show "Network unavailable"
  - Invalid response → show "Could not parse response"
  - API error (401, 429) → show specific error message
- **Test:** Integration test with real Azure account
- **Estimated Effort:** 2–3 hours

#### 4.3.3 Date Parsing Utility
- **File to Create:** `src/utils/voiceUtils.ts`
  ```typescript
  export function parseDateFromVoice(phrase: string, referenceDate: Date = new Date()): string {
    // Handle:
    // - "tomorrow" → today+1
    // - "next week" → today+7
    // - "by Friday" → next Friday
    // - "December 15" → this year or next year depending on context
    // - absolute dates (optional)
    // Returns YYYY-MM-DD
  }

  export function estimateDefaultHours(taskTitle: string): number {
    // Heuristic: if task sounds large, default to 2, otherwise 1
    // "meeting" → 1, "project" → 2, etc.
  }
  ```
- **Note:** LLM should ideally do this, but utility is fallback
- **Estimated Effort:** 1–2 hours

**Phase 3 Total: 6–8 hours**

---

### Phase 4: Integration with App.tsx (4–6 hours)

#### 4.4.1 Add Voice State Container to App
- **File to Modify:** `src/App.tsx`
- **Changes:**
  ```typescript
  function App() {
    // ... existing state ...
    const [voiceModalOpen, setVoiceModalOpen] = useState(false)
    const [voiceParsedTasks, setVoiceParsedTasks] = useState<ParsedTask[]>([])

    const handleVoiceTasksConfirmed = (confirmedTasks: Task[]) => {
      // Convert ParsedTask[] to Task[] (generate IDs, set startDate, etc.)
      const newTasks = confirmedTasks.map(t => ({
        ...t,
        id: generateId(),
        startDate: t.dueDate, // or parse from dateRange
        completed: false
      }))
      setTasks([...tasks, ...newTasks])
      setVoiceModalOpen(false)
    }

    return (
      <>
        {/* existing UI */}
        <Header onOpenVoice={() => setVoiceModalOpen(true)} />
        {voiceModalOpen && (
          <VoiceInputButton
            onVoiceTasksParsed={(tasks) => {
              setVoiceParsedTasks(tasks)
              setVoiceModalOpen(true) // Show review modal
            }}
          />
        )}
        <VoiceReviewModal
          isOpen={voiceModalOpen}
          tasks={voiceParsedTasks}
          onConfirm={handleVoiceTasksConfirmed}
          onCancel={() => setVoiceModalOpen(false)}
          {...otherProps}
        />
      </>
    )
  }
  ```
- **Estimated Effort:** 2–3 hours

#### 4.4.2 Add Mic Button to Header/SideActions
- **File to Modify:** `src/components/Header.tsx` or `src/components/SideActions.tsx`
- **Changes:**
  - Import `VoiceInputButton`
  - Add button to toolbar
  - Pass callback to trigger voice capture
- **Estimated Effort:** 1–2 hours

#### 4.4.3 Environment Variables
- **File to Create/Modify:** `.env.local` (git-ignored)
  ```
  VITE_AZURE_ENDPOINT=https://<resource>.openai.azure.com/
  VITE_AZURE_API_KEY=<api-key>
  VITE_AZURE_DEPLOYMENT_ID=<deployment-name>
  ```
- **Test:** Load env vars in app startup
- **Estimated Effort:** 1 hour

**Phase 4 Total: 4–6 hours**

---

### Phase 5: Testing & Demo Prep (4–6 hours)

#### 4.5.1 Unit Tests (Utilities)
- Test `voiceUtils.parseDateFromVoice()` with common inputs
- Test `llmPrompt.parseAIResponse()` with sample AI output
- Test hours allocation validation after voice-added tasks
- **File:** `test-voice.js` (jest or simple node script)
- **Estimated Effort:** 2 hours

#### 4.5.2 Manual Integration Testing
1. **Speech Capture:**
   - Speak 3–4 distinct tasks in one continuous sentence
   - Verify real-time transcript display
   - Verify LLM parses into separate tasks
2. **Quadrant Assignment:**
   - Verify high-urgency tasks → "Do First"
   - Verify low-urgency tasks → "Schedule" or "Eliminate"
   - Verify reasoning lines make sense
3. **Review Modal:**
   - Edit task (change title, quadrant, hours)
   - Confirm and verify tasks appear in quadrant grid
   - Verify hours allocation validator runs
4. **Edge Cases:**
   - No tasks recognized → error message
   - LLM fails (network error) → graceful fallback
   - Ambiguous task ("sometime") → defaults to lower-priority quadrant
- **Estimated Effort:** 2 hours

#### 4.5.3 Demo Rehearsal & Fallback
- **Script:** Pre-planned brain-dump to demo:
  - *"I need to finish the client presentation by tomorrow, it's really urgent. Also remind myself to water the plants sometime. And schedule a review with my manager next week."*
- **Record Fallback Clip:** Save MP3 of your own voice saying the brain-dump (in case live mic fails)
  - Modify Web Speech API wrapper to accept pre-recorded audio fallback
- **Estimated Effort:** 1–2 hours

**Phase 5 Total: 4–6 hours**

---

### Phase 6: Polish & Stretch Goals (2–4 hours)

#### 4.6.1 Accessibility (a11y)
- Add ARIA labels to mic button
- Ensure modal keyboard-navigable
- Transcript display readable by screen readers
- **Estimated Effort:** 1 hour

#### 4.6.2 UI Polish
- Improve mic button icon/animation
- Smooth transcript update transitions
- Reasoning tooltip styling
- Mobile responsiveness (optional)
- **Estimated Effort:** 1–2 hours

#### 4.6.3 Stretch: Voice Confirmation
- Text-to-speech reads back parsed tasks before commit
- User can say "confirm" to commit or "cancel"
- **Estimated Effort:** 2–3 hours (if time allows)

#### 4.6.4 Stretch: Azure Speech-to-Text
- Replace Web Speech API with Azure Speech-to-Text
- Better accuracy, deeper Copilot tie-in
- Requires backend (or CORS proxy)
- **Estimated Effort:** 3–4 hours (if time allows)

**Phase 6 Total: 2–4 hours (optional)**

---

## 5. Total Effort Estimate

| Phase | Effort (hours) | Notes |
|-------|---|---|
| **Phase 1: Foundation & API** | 6–8 | Environment, types, Web Speech wrapper |
| **Phase 2: UI Components** | 8–10 | Mic button, transcript, review modal, tooltip |
| **Phase 3: LLM Prompt & Integration** | 6–8 | Prompt design, Azure client, date parsing |
| **Phase 4: App Integration** | 4–6 | Wire voice components into App.tsx |
| **Phase 5: Testing & Demo Prep** | 4–6 | Unit tests, manual testing, rehearsal |
| **Phase 6: Polish & Stretch** | 2–4 | a11y, UI, voice confirmation (optional) |
| **TOTAL (MVP)** | **30–36 hours** | Core hackathon deliverable |
| **TOTAL (with stretches)** | **35–44 hours** | If time permits |

**Hackathon Window: 48–72 hours** → ✅ Feasible MVP in first 36 hours; stretches in remainder.

---

## 6. Critical Path & Risk Mitigation

### Critical Dependencies (Must Complete First)
1. **Azure OpenAI Setup** → Blocks LLM testing
2. **Web Speech API Wrapper** → Blocks UI integration
3. **LLM Prompt Design** → Blocks accuracy testing

### Top Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|---|---|---|
| **Live speech recognition fails (poor mic/accent)** | High | Critical (breaks live demo) | Pre-record fallback demo clip; test mic setup 1 day before |
| **LLM over-splits or under-splits tasks** | Medium | High (confuses users) | Iterate on prompt with 5–10 test transcripts; include few-shot examples |
| **Azure API credentials invalid/expired** | Low | Critical (blocks demo) | Test API call 24 hours before; have backup Azure account ready |
| **Date parsing ambiguity ("by Friday" — which Friday?)** | Medium | Low (user can edit) | Default to next occurrence; add note in UI ("next Friday assumed") |
| **Quadrant misclassification** | Medium | Low (user can edit in modal) | Acceptable per PRD ("80%+ accuracy"); user has review step |
| **Web Speech API unavailable (Safari on iOS)** | Medium | Medium (demo only, not real deployment) | Graceful error message; not a blocker for hackathon MVP |

### Rollback Strategy
- If Azure OpenAI not available: Use mock LLM response (hardcoded tasks) for demo
- If Web Speech fails: Pre-recorded clip + manual playback
- If modal UI breaks: Fall back to manual task entry (existing UI still works)

---

## 7. Success Criteria (from PRD)

- ✅ End-to-end: speak → transcribe → parse → sorted tasks appear, **under 10 seconds**
- ✅ **3–4 distinct tasks correctly split** from one continuous spoken sentence
- ✅ Quadrant assignment matches human judgment on **80%+ of demo cases**
- ✅ Reasoning line is **genuinely explanatory**, not generic
- ✅ Tasks integrate with existing hours/capacity validator
- ✅ Tasks appear in quadrant grid alongside manual tasks (no visual distinction)

---

## 8. Commit & Push Strategy

### Commit Phases (align with implementation)

```bash
# After Phase 1
git add -A
git commit -m "feat(voice): add types, Web Speech wrapper, and Azure OpenAI client"

# After Phase 2
git commit -m "feat(voice): add VoiceInputButton, VoiceReviewModal, and styling"

# After Phase 3
git commit -m "feat(voice): add LLM prompt design and date parsing utilities"

# After Phase 4
git commit -m "feat(voice): integrate voice components into App.tsx"

# After Phase 5
git commit -m "test(voice): add unit and integration tests for voice triage"

# After Phase 6 (if stretches completed)
git commit -m "feat(voice): add accessibility and UI polish"
```

### Branch Strategy
- Work on `feature/voice-triage` branch
- Do NOT push until Phase 5 (testing) passes
- Merge to `main` after live demo succeeds
- Hackathon submission: link to final PR or commit SHA

---

## 9. File Checklist (Ready-to-Build)

### New Files to Create (Phase 1–3)
- [ ] `src/types/voice.ts` — VoiceState, ParsedTask, LLMResponse types
- [ ] `src/utils/voiceRecognition.ts` — Web Speech API wrapper
- [ ] `src/utils/azureOpenAI.ts` — Azure OpenAI client
- [ ] `src/utils/llmPrompt.ts` — Prompt engineering & response parsing
- [ ] `src/utils/voiceUtils.ts` — Date parsing & hour estimation helpers
- [ ] `src/components/VoiceInput/VoiceInputButton.tsx` — Mic button component
- [ ] `src/components/VoiceInput/VoiceTranscriptDisplay.tsx` — Live transcript UI
- [ ] `src/components/VoiceInput/VoiceReviewModal.tsx` — Parsed tasks review modal
- [ ] `src/components/VoiceInput/TaskReasoningTooltip.tsx` — Reasoning tooltip
- [ ] `src/components/VoiceInput/voiceInputStyles.css` — Styling
- [ ] `.env.local` — Azure credentials (git-ignored)
- [ ] `test-voice.js` — Unit tests for voice utilities

### Files to Modify (Phase 4)
- [ ] `src/App.tsx` — Add voice state; integrate VoiceInputButton
- [ ] `src/components/Header.tsx` OR `src/components/SideActions.tsx` — Add mic button
- [ ] `package.json` — If adding dependencies (likely none needed)

### Files to Review/Validate
- [ ] `.gitignore` — Ensure `.env.local` is ignored
- [ ] `tsconfig.json` — Web Speech API types (use `@types/dom-speech-api` if needed)

---

## 10. Next Steps (Action Items)

### Before Implementation Starts
1. [ ] Request/validate Azure OpenAI credentials (API key, endpoint, deployment ID)
2. [ ] Test Web Speech API in target browser (Chrome/Edge)
3. [ ] Review existing `Task` type and state management in `App.tsx`
4. [ ] Draft 5–10 test transcripts for prompt iteration

### During Implementation
1. [ ] Follow phase breakdown; commit at each phase boundary
2. [ ] Iterate on LLM prompt with test transcripts (phases 3a–3b)
3. [ ] Test each component in isolation before integration
4. [ ] Record fallback demo clip by day 2 of hackathon

### 24 Hours Before Demo
1. [ ] Full end-to-end test (mic → transcript → LLM → review modal → task added)
2. [ ] Verify three URLs resolved in browser (portfolio, tictactoe, chroniyam)
3. [ ] Test demo script ("I need to finish the client presentation…")
4. [ ] Prepare fallback clip
5. [ ] Backup all code (commit to GitHub)

---

## 11. Links & References

- **PRD:** `apps/chroniyam/docs/PRD-chroniyam-ai-voice-triage.md`
- **Existing Task Type:** `src/types/quadrant.ts`
- **Hours Allocation Engine:** `src/utils/hoursAllocationEngine.ts`
- **App State Management:** `src/App.tsx` (lines 1–100)
- **Web Speech API Docs:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Azure OpenAI API:** https://learn.microsoft.com/en-us/azure/ai-services/openai/reference
- **Eisenhower Matrix:** https://en.wikipedia.org/wiki/Time_management#Eisenhower_matrix

---

## 12. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ChroNiyam UI Layer                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Header / SideActions                                       │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  [🎤 Mic Button] ← VoiceInputButton Component        │  │ │
│  │  │  Click → Recording Starts                             │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Live Transcript Display                                   │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ "I need to finish the client presentation by t..."  │  │ │
│  │  │  VoiceTranscriptDisplay Component                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Review Modal (VoiceReviewModal)                           │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ ✓ Finish client presentation [Do First]              │  │ │
│  │  │   Due: Tomorrow   |  2 hours   [Marked urgent]       │  │ │
│  │  │   → Tap for reasoning (TaskReasoningTooltip)         │  │ │
│  │  │                                                        │  │ │
│  │  │ ✓ Water plants [Eliminate]                           │  │ │
│  │  │   Due: Anytime   |  0.5 hrs   [No urgency signal]    │  │ │
│  │  │                                                        │  │ │
│  │  │ [Cancel]  [Confirm & Add Tasks]                      │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Quadrant Grid (existing, unmodified)                      │ │
│  │  ┌──────────────────┬──────────────────┐                   │ │
│  │  │  Do First        │  Schedule        │                   │ │
│  │  │ ┌────────────────┐ ┌──────────────┐ │                   │ │
│  │  │ │Client Present. │ │Review w/ Mgr │ │ ← Tasks added     │ │
│  │  │ │[3h] [Tomorrow] │ │[1h] [Sep 10] │ │   by voice        │ │
│  │  │ └────────────────┘ └──────────────┘ │                   │ │
│  │  ├──────────────────┬──────────────────┤                   │ │
│  │  │  Delegate        │  Eliminate       │                   │ │
│  │  │ ┌──────────────┐ │ ┌──────────────┐ │                   │ │
│  │  │ │              │ │ │Water plants  │ │ ← Task added      │ │
│  │  │ │              │ │ │[0.5h] [?]    │ │   by voice        │ │
│  │  │ └──────────────┘ │ └──────────────┘ │                   │ │
│  │  └──────────────────┴──────────────────┘                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

                              ↓ (Data Flow)

┌─────────────────────────────────────────────────────────────────┐
│                         API / Utility Layer                      │
│                                                                   │
│  VoiceRecognition (Web Speech API)                              │
│  ├─ start() → Capture user speech                              │
│  ├─ Real-time transcript streaming                             │
│  └─ stop() → Finalize transcript                               │
│                                                                   │
│  LLM Pipeline (Azure OpenAI)                                   │
│  ├─ buildClassificationPrompt(transcript)                      │
│  ├─ classifyTasksWithAI(transcript) ← fetch to Azure           │
│  ├─ parseAIResponse(aiOutput) → ParsedTask[]                   │
│  └─ Returns: { title, quadrant, dueDate, hours, reasoning }   │
│                                                                   │
│  Date & Hours Utilities                                         │
│  ├─ parseDateFromVoice("tomorrow") → "2026-08-24"             │
│  ├─ estimateDefaultHours(title) → 1 or 2                      │
│  └─ Integrated with existing hoursAllocationEngine             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

                              ↓ (Confirmed Tasks)

┌─────────────────────────────────────────────────────────────────┐
│                     Existing ChroNiyam Pipeline                  │
│  (No changes required)                                           │
│                                                                   │
│  ├─ Tasks stored in App.tsx state: tasks[]                      │
│  ├─ Hours validation: validateAllocation() runs                 │
│  ├─ Week planning: weeks displayed in calendar                  │
│  ├─ Local storage: tasks persist via existing logic             │
│  └─ Final output: Three URLs deployed to GitHub Pages           │
│     - https://rikampalkar.github.io/                            │
│     - https://rikampalkar.github.io/tictactoe/                  │
│     - https://rikampalkar.github.io/ChroNiyam/                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

This implementation plan breaks down the PRD into six phased tasks (30–36 hours MVP) that leverages the existing ChroNiyam foundation without breaking it. The critical path is:

1. **Foundation (Types & API clients)** → 6–8 hours
2. **UI Components** → 8–10 hours
3. **LLM Prompt & Integration** → 6–8 hours
4. **App Integration** → 4–6 hours
5. **Testing & Demo Prep** → 4–6 hours

**No backend required** (Web Speech API is browser-native; Azure OpenAI is serverless). Existing task system, hours validation, and deployment pipeline remain unchanged. Voice is purely an input layer. The demo is achievable within the hackathon window with time for iteration and polish.
