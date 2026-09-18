# ChroNiyam AI: Three-Minute Demo Speech

## Recording Approach

- Keep the front camera visible in a small corner while screen recording.
- Look at the camera for the opening, problem statement, and closing.
- Look at the screen while demonstrating the workflow.
- Do not narrate every click. State the user value, then show the evidence on screen.

## 0:00-0:15 | Introduction

Hello, I am Rikam Palkar. I have more than eight years of software industry experience, and I have been a Microsoft MVP for the last three years.

## 0:15-0:30 | Opening

Today, I am presenting ChroNiyam AI, a conversational planning app. Its purpose is simple: a user can describe everything on their plate and receive a structured, realistic plan.

## 0:30-1:00 | Problem Statement

Most people do not struggle because they lack a task lists. They struggle because they have too many competing responsibilities, unclear priorities, deadlines, and limited energy.

Traditional you have a task lists, but they do not decide what should happen first, when it fits, or whether the week is realistic. Important work, health, relationships, and recovery can easily be pushed aside by urgent requests.

## 1:00-1:30 | Solution

ChroNiyam AI combines natural conversation with the Eisenhower Matrix. The user supplies intent: what they need to do, by typing or speaking. The application supplies structure: priority, estimated duration, time placement, and tradeoffs.

The AI does not ask the user to fill in a form for every task. It maps tasks directly, estimates practical durations, detects repeated activities, and asks follow-up questions only when a detail is genuinely important, such as a hard deadline or an immovable appointment.

The plan sorts everything into four zones. First, "Do First" — that's urgent and important, the stuff that needs your attention right now. Then "Schedule" — important work that deserves protected time, so it doesn't get pushed aside. Third, "Delegate" — urgent, but lower value, so it can go to someone else. And finally, "Eliminate" — the distractions, the things that don't need to happen at all.

## 1:30-2:25 | Live UI Demo

[Show the landing screen]

The experience starts with one action: Plan my week.

[Click Plan my week, then open Ask AI]

I can type or speak a natural task dump. For example:

### Paste This Initial Demo Prompt

```text
Plan my week. It is Saturday afternoon, September 19, 2026.

I need to finish the quarterly project report by Friday, September 25, prepare a presentation for Monday morning, September 21, review the draft with my teammate after the presentation is ready, and respond to urgent client feedback this afternoon.

I also want to exercise three times this week, take my cat for a walk every morning, call my parents twice, buy groceries, spend one evening with friends, study for my certification exam on Saturday, September 26, and keep one low-demand recovery evening.

I have a dentist appointment on Wednesday, September 23, at 3 PM that cannot move. Please create a realistic weekly plan, estimate normal task durations, detect repeated activities, prioritize deadlines, protect focus time and recovery, group similar work where possible, and avoid overbooking.
```

[Send the prompt and briefly show the AI response]

Chroniyam AI identifies the tasks, classifies them using urgency and importance, estimates duration, and creates dated task occurrences. Repeated activities are grouped in the All dates view, so the board remains readable while still showing their count and date range.

[Show All dates, then select one date]

The date selector lets the user review a specific day without losing the full weekly view. The planning summary shows capacity, quadrant allocation, completion progress, recovery time, and plan quality.

### Speak This Follow-Up Prompt

```text
I only have four hours available on Friday, September 25, 2026. Please make that day lighter and move anything flexible to another day.
```

[Use the microphone, speak the prompt, then show the updated plan]

This demonstrates voice input and conversational plan adjustment. The user does not need to manually rebuild the schedule after a real-world constraint changes.

[Open one task]

Every task can still be edited directly. Users can change time, duration, category, priority, or drag tasks between quadrants. The app warns about real day-level problems such as time conflicts, missing details, past times, or overload, while the All dates view stays clean.

[Show voice controls]

Voice input uses browser speech recognition. Optional voice replies use browser speech synthesis, with controls for tone and speed. The AI response itself is generated securely through the server-side API.

## 2:25-2:48 | AI And Technology

The frontend is built with React, TypeScript, and Vite. The UI supports Claymorphism and Neobrutalism themes.

For AI, the browser sends conversation context to a Vercel serverless `/api/chat` function. That function keeps the OpenAI API key on the server and forwards structured requests to OpenAI. This gives the app a thin BFF-style layer rather than exposing the production key in the browser.

The planner also uses local validation and scheduling heuristics: urgent work gets earlier attention, deep work is favoured during focus time, similar work can be grouped, and buffers reduce overload.

## 2:48-3:00 | Closing

ChroNiyam AI is not another place to manually maintain a task list. It is a planning partner that turns a scattered week into a visible, balanced, and adjustable plan. The user stays in control, while the AI reduces the effort required to get organized.
