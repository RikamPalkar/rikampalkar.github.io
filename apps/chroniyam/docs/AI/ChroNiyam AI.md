# PRD: ChroNiyam AI — Voice-Powered Smart Task Triage

**Author:** Rikam Palkar
**Type:** Hackathon MVP (AI/Copilot track)
**Base:** Existing ChroNiyam app (Eisenhower Matrix task manager — React 19, TypeScript, Vite)
**Status:** Draft

---

## 0. Provenance — this builds on an existing personal project

ChroNiyam is my own original project, built and shipped prior to this hackathon: [rikampalkar.github.io/ChroNiyam](https://rikampalkar.github.io/ChroNiyam) ([source](https://github.com/RikamPalkar/ChroNiyam)). It's a fully working Eisenhower Matrix task manager with a four-quadrant system, an hours-allocation engine (daily/weekly capacity validation), calendar views, and a balance validator — all built without any AI.

**What's new for this hackathon** is the AI layer on top: voice input and LLM-driven task triage (Sections 4-7 below). The existing app is the foundation and proof of working execution; the hackathon scope is specifically the AI/Copilot enhancement, not a rebuild from scratch. This should be stated up front in the submission so judges understand what's pre-existing vs. what was built during the hackathon window.

---

## 1. Problem

ChroNiyam already helps people organize tasks into the Eisenhower Matrix (urgent/important quadrants), but the user has to manually decide which quadrant each task belongs to, and manually type every task. Two friction points:

1. **Typing is slow** — especially for a quick brain-dump of everything on your mind
2. **Quadrant classification takes judgment** — people either overthink it or skip prioritization entirely and dump everything into "urgent"

## 2. Goal

Let a user speak a messy, unstructured list of tasks out loud and have AI transcribe, parse, and auto-sort them into the correct quadrant — with estimated hours and due dates extracted automatically.

## 3. Non-goals (hackathon scope)

- Not building multi-language voice support (English only for the demo)
- Not building a mobile app — web only, using existing ChroNiyam frontend
- Not replacing manual task entry — voice is an additional input mode, not a forced one
- Not perfecting date/time parsing edge cases — cover common phrasing ("tomorrow," "next week," "by Friday")

## 4. Core user flow

1. User clicks the mic icon on ChroNiyam
2. User speaks freely, e.g.: *"I need to finish the client presentation by tomorrow, it's really urgent. Also remind myself to water the plants sometime. And schedule a review with my manager next week."*
3. Live transcript appears as they speak (visual feedback, builds trust)
4. On stop, the transcript is sent to an LLM which:
   - Splits the transcript into distinct tasks
   - Assigns each task a quadrant (Do First / Schedule / Delegate / Eliminate) based on urgency + importance cues in the language used
   - Extracts a due date where mentioned ("tomorrow," "next week," "by Friday")
   - Estimates hours needed (reasonable default if not specified)
5. Parsed tasks appear as editable cards, pre-filled into their quadrants — user can adjust anything before confirming
6. Confirmed tasks flow into ChroNiyam's existing allocation engine (daily/weekly hour validation, calendar view) unchanged

## 5. Why each task lands in its quadrant (explainability)

Every AI-classified task shows a one-line reason on hover/tap, e.g.:
- *"Do First — you said 'really urgent' and it's due tomorrow"*
- *"Schedule — important but no urgency signal, due next week"*

This is the "wow" moment for judges: not just sorting, but showing *why*, which builds trust and demonstrates real reasoning rather than a black box.

## 6. Tech stack (hackathon-buildable)

- **Speech-to-text**: Web Speech API (built into Chrome, free, no backend, works client-side) — fastest path for a hackathon. Azure Speech-to-Text as a stretch goal if time allows (better accuracy, ties into the Copilot/Azure theme more directly)
- **Task parsing + classification**: Azure OpenAI / Copilot — single prompt call: transcript in, structured JSON out (task list with quadrant, due date, hour estimate, reasoning)
- **Frontend**: Extends existing ChroNiyam React/TypeScript app — new mic button component + review/edit modal before tasks commit
- **No new backend needed** if using client-side Web Speech API + direct LLM API call; keeps the build fast

## 7. Structured output contract (LLM prompt design)

The LLM should return strict JSON so it maps directly onto ChroNiyam's existing `Task` type:

```json
[
  {
    "title": "Finish client presentation",
    "quadrant": "doFirst",
    "dueDate": "2026-08-24",
    "estimatedHours": 3,
    "reasoning": "Marked urgent, due tomorrow, tied to a client deliverable"
  }
]
```

This keeps the AI layer decoupled from the UI — parse once, render into existing components.

## 8. Demo script (for judges)

1. Open ChroNiyam, show the existing quadrant view (proves it's a real, working app, not a mockup)
2. Click mic, speak a messy 3-4 task brain-dump live in front of judges (no rehearsed text shown on screen — real spontaneity is more convincing)
3. Watch transcript build in real time
4. Watch tasks auto-populate into correct quadrants with hour estimates and due dates
5. Hover one task to show the reasoning line — this is the moment that proves it's AI, not keyword matching
6. Show the existing hours/capacity validator kick in normally — proves the AI layer integrates with real logic, not just a demo toy

## 9. Success criteria

- End-to-end: speak → transcribe → parse → sorted tasks appear, under 10 seconds
- At least 3-4 distinct tasks correctly split from one continuous spoken sentence
- Quadrant assignment matches human judgment on 80%+ of demo cases
- Reasoning line is genuinely explanatory, not generic

## 10. Risks

- **Speech recognition accuracy** — background noise/accent could hurt live demo; mitigate by testing your own voice/mic setup extensively beforehand, keep a backup pre-recorded clip as fallback
- **LLM over-splitting or under-splitting tasks** — mitigate with careful prompt design and few-shot examples in the prompt
- **Ambiguous urgency language** ("sometime," "whenever") — acceptable to default to lower-priority quadrant (Schedule/Eliminate) and let user manually override

## 11. Stretch goals (if time allows)

- Voice confirmation — AI reads back the parsed task list before committing (ties in text-to-speech as originally discussed)
- Recurring task detection from speech ("every Monday," "weekly")
- Multi-turn correction — user can say "no, move that to Schedule instead" and have it re-classify conversationally
